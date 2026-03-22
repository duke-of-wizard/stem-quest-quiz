const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Load OpenAI SDK if available (for online question generation)
let OpenAI;
try { OpenAI = require('openai'); } catch (e) { /* SDK not installed, online mode unavailable */ }

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Initialize SQLite Database
const db = new sqlite3.Database('quiz.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeTables();
    }
});

// Create tables
function initializeTables() {
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT UNIQUE NOT NULL,
                age_group TEXT NOT NULL,
                category TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS game_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                total_score INTEGER DEFAULT 0,
                questions_answered INTEGER DEFAULT 0,
                difficulty_level TEXT DEFAULT 'easy',
                started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                completed_at DATETIME,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS question_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER NOT NULL,
                question_id TEXT NOT NULL,
                was_correct BOOLEAN NOT NULL,
                attempts INTEGER DEFAULT 1,
                points_earned INTEGER DEFAULT 0,
                answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES game_sessions(id)
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS user_question_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                device_id TEXT NOT NULL,
                question_id TEXT NOT NULL,
                category TEXT NOT NULL,
                difficulty TEXT NOT NULL,
                seen_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(device_id, question_id)
            )
        `);

        db.run(`
            CREATE INDEX IF NOT EXISTS idx_uqh_device
            ON user_question_history(device_id, category, difficulty)
        `, (err) => {
            if (!err) {
                console.log('Database initialized successfully');
            }
        });
    });
}

// Load question bank from JSON file
const questionsFilePath = path.join(__dirname, 'questions.json');
let questionBank = JSON.parse(fs.readFileSync(questionsFilePath, 'utf-8'));

function saveQuestionBank() {
    fs.writeFileSync(questionsFilePath, JSON.stringify(questionBank, null, 2));
}

// ID prefix map for generating new question IDs
const categoryIdPrefix = { maths: 'm', science: 's', riddles: 'r', spelling: 'sp', india: 'i' };
const difficultyIdPrefix = { easy: 'e', medium: 'm', hard: 'h' };

function getNextQuestionId(category, difficulty) {
    const prefix = `${categoryIdPrefix[category]}_${difficultyIdPrefix[difficulty]}_`;
    const existing = (questionBank[category]?.[difficulty] || []);
    let maxNum = 0;
    for (const q of existing) {
        const num = parseInt(q.id.replace(prefix, ''), 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
    }
    return prefix + (maxNum + 1);
}

// API Routes

// Create new user session
app.post('/api/user/create', (req, res) => {
    const { sessionId, ageGroup, category } = req.body;

    db.run('INSERT INTO users (session_id, age_group, category) VALUES (?, ?, ?)',
        [sessionId, ageGroup, category],
        function (err) {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }

            const userId = this.lastID;

            db.run('INSERT INTO game_sessions (user_id) VALUES (?)',
                [userId],
                function (err) {
                    if (err) {
                        return res.status(500).json({ success: false, error: err.message });
                    }

                    res.json({
                        success: true,
                        userId: userId,
                        gameSessionId: this.lastID
                    });
                });
        });
});

// Get question (ensuring no repeats across sessions)
app.post('/api/question/get', (req, res) => {
    const { sessionId, category, difficulty, deviceId } = req.body;

    if (!questionBank[category] || !questionBank[category][difficulty]) {
        return res.json({ success: false, message: 'Invalid category or difficulty' });
    }

    // Get questions this device has already seen (cross-session)
    const query = deviceId
        ? 'SELECT question_id FROM user_question_history WHERE device_id = ? AND category = ? AND difficulty = ?'
        : 'SELECT question_id FROM question_history WHERE session_id = ?';
    const params = deviceId ? [deviceId, category, difficulty] : [sessionId];

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }

        const seenIds = new Set(rows.map(q => q.question_id));

        const availableQuestions = questionBank[category][difficulty].filter(
            q => !seenIds.has(q.id)
        );

        if (availableQuestions.length === 0) {
            return res.json({ success: false, exhausted: true, category, difficulty });
        }

        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        const question = availableQuestions[randomIndex];

        res.json({ success: true, question });
    });
});

// Submit answer
app.post('/api/answer/submit', (req, res) => {
    const { sessionId, questionId, selectedOption, correctOption, attempt, deviceId, category, difficulty } = req.body;

    const isCorrect = selectedOption === correctOption;
    const pointsEarned = isCorrect ? (attempt === 1 ? 2 : 1) : 0;

    // Record in cross-session history
    if (deviceId && category && difficulty) {
        db.run(`INSERT OR IGNORE INTO user_question_history (device_id, question_id, category, difficulty)
                VALUES (?, ?, ?, ?)`,
            [deviceId, questionId, category, difficulty]);
    }

    // Record the answer
    db.run(`INSERT INTO question_history (session_id, question_id, was_correct, attempts, points_earned)
            VALUES (?, ?, ?, ?, ?)`,
        [sessionId, questionId, isCorrect, attempt, pointsEarned],
        function (err) {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }

            // Update game session score
            db.run(`UPDATE game_sessions
                    SET total_score = total_score + ?,
                        questions_answered = questions_answered + 1
                    WHERE id = ?`,
                [pointsEarned, sessionId],
                function (err) {
                    if (err) {
                        return res.status(500).json({ success: false, error: err.message });
                    }

                    // Get updated score
                    db.get('SELECT total_score, questions_answered FROM game_sessions WHERE id = ?',
                        [sessionId],
                        (err, row) => {
                            if (err) {
                                return res.status(500).json({ success: false, error: err.message });
                            }

                            res.json({
                                success: true,
                                isCorrect,
                                pointsEarned,
                                totalScore: row.total_score,
                                questionsAnswered: row.questions_answered
                            });
                        });
                });
        });
});

// Update difficulty
app.post('/api/difficulty/update', (req, res) => {
    const { sessionId, difficulty } = req.body;

    db.run('UPDATE game_sessions SET difficulty_level = ? WHERE id = ?',
        [difficulty, sessionId],
        (err) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            res.json({ success: true });
        });
});

// Complete game session
app.post('/api/session/complete', (req, res) => {
    const { sessionId } = req.body;

    db.run('UPDATE game_sessions SET completed_at = CURRENT_TIMESTAMP WHERE id = ?',
        [sessionId],
        (err) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            res.json({ success: true });
        });
});

// Generate new questions on-demand using OpenAI API
app.post('/api/question/generate', async (req, res) => {
    const { category, difficulty, deviceId } = req.body;

    if (!OpenAI || !process.env.OPENAI_API_KEY) {
        return res.json({ success: false, reason: 'no_api_key' });
    }

    try {
        const client = new OpenAI();

        const categoryDescriptions = {
            maths: 'mathematics (arithmetic, geometry, algebra)',
            science: 'science (physics, chemistry, biology, earth science)',
            riddles: 'riddles and brain teasers',
            spelling: 'spelling (ask which spelling is correct)',
            india: 'India general knowledge (history, geography, culture, famous people)'
        };

        const difficultyDescriptions = {
            easy: 'easy (ages 5-7, simple and straightforward)',
            medium: 'medium (ages 8-10, requires some thinking)',
            hard: 'hard (ages 11-13, challenging)'
        };

        const existingTexts = (questionBank[category]?.[difficulty] || [])
            .slice(-20)
            .map(q => q.question);

        const completion = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            max_tokens: 4000,
            messages: [{
                role: 'user',
                content: `Generate 10 unique multiple-choice quiz questions for children about ${categoryDescriptions[category]}, at ${difficultyDescriptions[difficulty]} level.

Return ONLY a JSON array (no markdown, no explanation) with objects having these fields:
- "question": string (the question text)
- "options": array of exactly 4 strings (answer choices)
- "correct": number (0-based index of the correct answer)

Requirements:
- Questions must be factually accurate
- All 4 options must be plausible but only one correct
- Questions must be age-appropriate
- UNIQUENESS IS CRITICAL: Each question must test a DIFFERENT fact, concept, or skill. Do NOT rephrase existing questions, use the same template with swapped values, or ask the same concept with different numbers.
- Cover DIVERSE topics within the category.
- Do NOT duplicate or closely resemble any of these existing questions: ${JSON.stringify(existingTexts)}`
            }]
        });

        const responseText = completion.choices[0].message.content.trim();
        let generated;
        try {
            generated = JSON.parse(responseText);
        } catch (e) {
            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                generated = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Could not parse AI response as JSON');
            }
        }

        // Validate and assign IDs
        const newQuestions = [];
        for (const q of generated) {
            if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 ||
                typeof q.correct !== 'number' || q.correct < 0 || q.correct > 3) {
                continue;
            }
            const id = getNextQuestionId(category, difficulty);
            newQuestions.push({ id, question: q.question, options: q.options, correct: q.correct });
        }

        if (newQuestions.length === 0) {
            return res.json({ success: false, reason: 'generation_failed' });
        }

        // Add to bank and save
        if (!questionBank[category]) questionBank[category] = {};
        if (!questionBank[category][difficulty]) questionBank[category][difficulty] = [];
        questionBank[category][difficulty].push(...newQuestions);
        saveQuestionBank();

        // Find an unseen question for this device
        const seenIds = new Set();
        if (deviceId) {
            const rows = await new Promise((resolve, reject) => {
                db.all('SELECT question_id FROM user_question_history WHERE device_id = ? AND category = ? AND difficulty = ?',
                    [deviceId, category, difficulty], (err, rows) => err ? reject(err) : resolve(rows));
            });
            rows.forEach(r => seenIds.add(r.question_id));
        }

        const unseen = newQuestions.filter(q => !seenIds.has(q.id));
        if (unseen.length === 0) {
            return res.json({ success: false, reason: 'all_seen' });
        }

        const question = unseen[Math.floor(Math.random() * unseen.length)];
        res.json({ success: true, question });

    } catch (error) {
        console.error('Question generation error:', error.message);
        res.json({ success: false, reason: 'api_error', error: error.message });
    }
});

// Get leaderboard
app.get('/api/leaderboard', (req, res) => {
    db.all(`SELECT
                u.age_group,
                u.category,
                g.total_score,
                g.questions_answered,
                g.difficulty_level,
                g.completed_at
            FROM game_sessions g
            JOIN users u ON g.user_id = u.id
            WHERE g.completed_at IS NOT NULL
            ORDER BY g.total_score DESC
            LIMIT 10`,
        [],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            res.json({ success: true, leaderboard: rows });
        });
});

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Database connection closed');
        process.exit(0);
    });
});
