const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Initialize SQLite Database
const db = new Database('quiz.db');

// Create tables
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT UNIQUE NOT NULL,
        age_group TEXT NOT NULL,
        category TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS game_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total_score INTEGER DEFAULT 0,
        questions_answered INTEGER DEFAULT 0,
        difficulty_level TEXT DEFAULT 'easy',
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS question_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        question_id TEXT NOT NULL,
        was_correct BOOLEAN NOT NULL,
        attempts INTEGER DEFAULT 1,
        points_earned INTEGER DEFAULT 0,
        answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES game_sessions(id)
    );
`);

console.log('Database initialized successfully');

// Question Bank
const questionBank = {
    maths: {
        easy: [
            {
                id: 'm_e_1',
                question: 'What is 5 + 3?',
                options: ['6', '7', '8', '9'],
                correct: 2
            },
            {
                id: 'm_e_2',
                question: 'How many sides does a triangle have?',
                options: ['2', '3', '4', '5'],
                correct: 1
            },
            {
                id: 'm_e_3',
                question: 'What is 10 - 4?',
                options: ['5', '6', '7', '8'],
                correct: 1
            },
            {
                id: 'm_e_4',
                question: 'Which number comes after 9?',
                options: ['8', '10', '11', '12'],
                correct: 1
            },
            {
                id: 'm_e_5',
                question: 'What is 2 × 3?',
                options: ['4', '5', '6', '7'],
                correct: 2
            },
            {
                id: 'm_e_6',
                question: 'How many corners does a square have?',
                options: ['3', '4', '5', '6'],
                correct: 1
            },
            {
                id: 'm_e_7',
                question: 'What is half of 8?',
                options: ['2', '3', '4', '5'],
                correct: 2
            },
            {
                id: 'm_e_8',
                question: 'What is 7 + 2?',
                options: ['7', '8', '9', '10'],
                correct: 2
            }
        ],
        medium: [
            {
                id: 'm_m_1',
                question: 'What is 12 × 5?',
                options: ['50', '55', '60', '65'],
                correct: 2
            },
            {
                id: 'm_m_2',
                question: 'What is 144 ÷ 12?',
                options: ['10', '11', '12', '13'],
                correct: 2
            },
            {
                id: 'm_m_3',
                question: 'What is the perimeter of a square with side 5 cm?',
                options: ['15 cm', '20 cm', '25 cm', '30 cm'],
                correct: 1
            },
            {
                id: 'm_m_4',
                question: 'What is 15% of 100?',
                options: ['10', '15', '20', '25'],
                correct: 1
            },
            {
                id: 'm_m_5',
                question: 'If a book costs ₹45 and you pay ₹50, how much change?',
                options: ['₹3', '₹4', '₹5', '₹6'],
                correct: 2
            },
            {
                id: 'm_m_6',
                question: 'What is 8 × 7?',
                options: ['54', '56', '58', '60'],
                correct: 1
            }
        ],
        hard: [
            {
                id: 'm_h_1',
                question: 'What is the square root of 144?',
                options: ['10', '11', '12', '13'],
                correct: 2
            },
            {
                id: 'm_h_2',
                question: 'What is 25% of 240?',
                options: ['50', '55', '60', '65'],
                correct: 2
            },
            {
                id: 'm_h_3',
                question: 'If x + 7 = 15, what is x?',
                options: ['6', '7', '8', '9'],
                correct: 2
            },
            {
                id: 'm_h_4',
                question: 'What is the area of a rectangle 8m × 5m?',
                options: ['30 m²', '35 m²', '40 m²', '45 m²'],
                correct: 2
            },
            {
                id: 'm_h_5',
                question: 'What is 15² (15 squared)?',
                options: ['200', '215', '225', '235'],
                correct: 2
            }
        ]
    },
    science: {
        easy: [
            {
                id: 's_e_1',
                question: 'Which planet do we live on?',
                options: ['Mars', 'Earth', 'Venus', 'Jupiter'],
                correct: 1
            },
            {
                id: 's_e_2',
                question: 'How many legs does a spider have?',
                options: ['6', '8', '10', '12'],
                correct: 1
            },
            {
                id: 's_e_3',
                question: 'What do plants need to make food?',
                options: ['Moonlight', 'Sunlight', 'Starlight', 'Firelight'],
                correct: 1
            },
            {
                id: 's_e_4',
                question: 'What color is the sky on a clear day?',
                options: ['Green', 'Red', 'Blue', 'Yellow'],
                correct: 2
            },
            {
                id: 's_e_5',
                question: 'Which animal is known as the King of the Jungle?',
                options: ['Tiger', 'Elephant', 'Lion', 'Bear'],
                correct: 2
            },
            {
                id: 's_e_6',
                question: 'How many bones do sharks have?',
                options: ['Zero', 'Ten', 'Fifty', 'Hundred'],
                correct: 0
            }
        ],
        medium: [
            {
                id: 's_m_1',
                question: 'What is the process by which plants make food?',
                options: ['Respiration', 'Photosynthesis', 'Digestion', 'Absorption'],
                correct: 1
            },
            {
                id: 's_m_2',
                question: 'What is the largest organ in the human body?',
                options: ['Heart', 'Brain', 'Skin', 'Liver'],
                correct: 2
            },
            {
                id: 's_m_3',
                question: 'Which gas do plants absorb from the air?',
                options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'],
                correct: 2
            },
            {
                id: 's_m_4',
                question: 'At what temperature does water boil?',
                options: ['50°C', '75°C', '100°C', '125°C'],
                correct: 2
            },
            {
                id: 's_m_5',
                question: 'What type of animal is a whale?',
                options: ['Fish', 'Mammal', 'Reptile', 'Amphibian'],
                correct: 1
            }
        ],
        hard: [
            {
                id: 's_h_1',
                question: 'What is the speed of light?',
                options: ['300,000 km/s', '150,000 km/s', '450,000 km/s', '600,000 km/s'],
                correct: 0
            },
            {
                id: 's_h_2',
                question: 'Which scientist developed the theory of relativity?',
                options: ['Newton', 'Einstein', 'Galileo', 'Tesla'],
                correct: 1
            },
            {
                id: 's_h_3',
                question: 'What is the smallest unit of life?',
                options: ['Atom', 'Molecule', 'Cell', 'Organ'],
                correct: 2
            },
            {
                id: 's_h_4',
                question: 'How many planets are in our solar system?',
                options: ['7', '8', '9', '10'],
                correct: 1
            }
        ]
    },
    riddles: {
        easy: [
            {
                id: 'r_e_1',
                question: 'I have hands but cannot clap. What am I?',
                options: ['A tree', 'A clock', 'A book', 'A chair'],
                correct: 1
            },
            {
                id: 'r_e_2',
                question: 'What has to be broken before you can use it?',
                options: ['A stick', 'An egg', 'A bottle', 'A door'],
                correct: 1
            },
            {
                id: 'r_e_3',
                question: 'What goes up but never comes down?',
                options: ['A balloon', 'Your age', 'A kite', 'A bird'],
                correct: 1
            },
            {
                id: 'r_e_4',
                question: 'What has keys but no locks?',
                options: ['A car', 'A piano', 'A house', 'A safe'],
                correct: 1
            },
            {
                id: 'r_e_5',
                question: 'I am tall when I am young, and short when I am old. What am I?',
                options: ['A tree', 'A candle', 'A person', 'A building'],
                correct: 1
            }
        ],
        medium: [
            {
                id: 'r_m_1',
                question: 'The more you take, the more you leave behind. What am I?',
                options: ['Money', 'Footsteps', 'Time', 'Food'],
                correct: 1
            },
            {
                id: 'r_m_2',
                question: 'What can travel around the world while staying in a corner?',
                options: ['A bird', 'A stamp', 'A plane', 'A cloud'],
                correct: 1
            },
            {
                id: 'r_m_3',
                question: 'What gets wetter the more it dries?',
                options: ['A sponge', 'A towel', 'Rain', 'Water'],
                correct: 1
            },
            {
                id: 'r_m_4',
                question: 'I have cities but no houses, forests but no trees, and water but no fish. What am I?',
                options: ['A painting', 'A map', 'A dream', 'A story'],
                correct: 1
            }
        ],
        hard: [
            {
                id: 'r_h_1',
                question: 'What can run but never walks, has a mouth but never talks?',
                options: ['A river', 'A car', 'Wind', 'Time'],
                correct: 0
            },
            {
                id: 'r_h_2',
                question: 'I speak without a mouth and hear without ears. I have no body, but come alive with wind. What am I?',
                options: ['A ghost', 'An echo', 'A shadow', 'A thought'],
                correct: 1
            },
            {
                id: 'r_h_3',
                question: 'The more of this there is, the less you see. What is it?',
                options: ['Light', 'Darkness', 'Fog', 'Distance'],
                correct: 1
            }
        ]
    },
    spelling: {
        easy: [
            {
                id: 'sp_e_1',
                question: 'How do you spell the color of the sky?',
                options: ['Blu', 'Blue', 'Bleu', 'Bloo'],
                correct: 1
            },
            {
                id: 'sp_e_2',
                question: 'How do you spell the day after Monday?',
                options: ['Teusday', 'Tuesday', 'Tusday', 'Tuesdy'],
                correct: 1
            },
            {
                id: 'sp_e_3',
                question: 'How do you spell the animal that meows?',
                options: ['Kat', 'Cat', 'Catt', 'Cet'],
                correct: 1
            },
            {
                id: 'sp_e_4',
                question: 'How do you spell the number after seven?',
                options: ['Eigt', 'Eigth', 'Eight', 'Ate'],
                correct: 2
            },
            {
                id: 'sp_e_5',
                question: 'How do you spell where you live?',
                options: ['Hous', 'Howse', 'House', 'Houce'],
                correct: 2
            }
        ],
        medium: [
            {
                id: 'sp_m_1',
                question: 'How do you spell a large gray animal with a trunk?',
                options: ['Elefant', 'Elephant', 'Elephent', 'Eliphant'],
                correct: 1
            },
            {
                id: 'sp_m_2',
                question: 'How do you spell the opposite of easy?',
                options: ['Dificult', 'Difficult', 'Dificolt', 'Difficalt'],
                correct: 1
            },
            {
                id: 'sp_m_3',
                question: 'How do you spell a place with many books?',
                options: ['Libary', 'Library', 'Librairy', 'Librery'],
                correct: 1
            },
            {
                id: 'sp_m_4',
                question: 'How do you spell knowledge?',
                options: ['Knowlege', 'Nowledge', 'Knowledge', 'Knolege'],
                correct: 2
            }
        ],
        hard: [
            {
                id: 'sp_h_1',
                question: 'How do you spell: existing everywhere at the same time?',
                options: ['Ubiquitous', 'Ubiquituous', 'Ubiquitus', 'Ubiquitios'],
                correct: 0
            },
            {
                id: 'sp_h_2',
                question: 'How do you spell: understanding someone\'s feelings?',
                options: ['Empathy', 'Empethey', 'Empathi', 'Empethy'],
                correct: 0
            },
            {
                id: 'sp_h_3',
                question: 'How do you spell: very important or necessary?',
                options: ['Necesary', 'Neccessary', 'Necessary', 'Neccesary'],
                correct: 2
            }
        ]
    },
    india: {
        easy: [
            {
                id: 'i_e_1',
                question: 'What is the capital of India?',
                options: ['Mumbai', 'New Delhi', 'Kolkata', 'Chennai'],
                correct: 1
            },
            {
                id: 'i_e_2',
                question: 'Which is the national bird of India?',
                options: ['Parrot', 'Peacock', 'Pigeon', 'Eagle'],
                correct: 1
            },
            {
                id: 'i_e_3',
                question: 'How many colors are there in the Indian flag?',
                options: ['2', '3', '4', '5'],
                correct: 1
            },
            {
                id: 'i_e_4',
                question: 'What is the national animal of India?',
                options: ['Lion', 'Elephant', 'Tiger', 'Leopard'],
                correct: 2
            },
            {
                id: 'i_e_5',
                question: 'Which river is considered the holiest in India?',
                options: ['Yamuna', 'Ganga', 'Godavari', 'Krishna'],
                correct: 1
            },
            {
                id: 'i_e_6',
                question: 'Who is known as the Father of the Nation in India?',
                options: ['Nehru', 'Gandhi', 'Patel', 'Ambedkar'],
                correct: 1
            }
        ],
        medium: [
            {
                id: 'i_m_1',
                question: 'In which year did India gain independence?',
                options: ['1942', '1945', '1947', '1950'],
                correct: 2
            },
            {
                id: 'i_m_2',
                question: 'Which is the largest state in India by area?',
                options: ['Maharashtra', 'Rajasthan', 'Madhya Pradesh', 'Uttar Pradesh'],
                correct: 1
            },
            {
                id: 'i_m_3',
                question: 'Which festival is known as the Festival of Lights?',
                options: ['Holi', 'Diwali', 'Eid', 'Christmas'],
                correct: 1
            },
            {
                id: 'i_m_4',
                question: 'Where is the Taj Mahal located?',
                options: ['Delhi', 'Jaipur', 'Agra', 'Lucknow'],
                correct: 2
            },
            {
                id: 'i_m_5',
                question: 'Which is the smallest state in India by area?',
                options: ['Sikkim', 'Goa', 'Tripura', 'Manipur'],
                correct: 1
            }
        ],
        hard: [
            {
                id: 'i_h_1',
                question: 'Who was the first President of India?',
                options: ['Dr. Rajendra Prasad', 'Dr. S. Radhakrishnan', 'Zakir Hussain', 'V.V. Giri'],
                correct: 0
            },
            {
                id: 'i_h_2',
                question: 'Which is the longest river in India?',
                options: ['Ganga', 'Yamuna', 'Godavari', 'Brahmaputra'],
                correct: 0
            },
            {
                id: 'i_h_3',
                question: 'When is Republic Day celebrated in India?',
                options: ['15th August', '26th January', '2nd October', '14th November'],
                correct: 1
            },
            {
                id: 'i_h_4',
                question: 'Which Indian city is known as the Silicon Valley of India?',
                options: ['Hyderabad', 'Pune', 'Bangalore', 'Chennai'],
                correct: 2
            }
        ]
    }
};

// API Routes

// Create new user session
app.post('/api/user/create', (req, res) => {
    try {
        const { sessionId, ageGroup, category } = req.body;

        const stmt = db.prepare('INSERT INTO users (session_id, age_group, category) VALUES (?, ?, ?)');
        const result = stmt.run(sessionId, ageGroup, category);

        const gameStmt = db.prepare('INSERT INTO game_sessions (user_id) VALUES (?)');
        const gameResult = gameStmt.run(result.lastInsertRowid);

        res.json({
            success: true,
            userId: result.lastInsertRowid,
            gameSessionId: gameResult.lastInsertRowid
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get question (ensuring no repeats)
app.post('/api/question/get', (req, res) => {
    try {
        const { sessionId, category, difficulty } = req.body;

        // Get already asked questions for this session
        const askedQuestions = db.prepare(`
            SELECT question_id FROM question_history
            WHERE session_id = ?
        `).all(sessionId);

        const askedIds = askedQuestions.map(q => q.question_id);

        // Get available questions from the bank
        const availableQuestions = questionBank[category][difficulty].filter(
            q => !askedIds.includes(q.id)
        );

        if (availableQuestions.length === 0) {
            return res.json({ success: false, message: 'No more questions available' });
        }

        // Return random question
        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        const question = availableQuestions[randomIndex];

        res.json({ success: true, question });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Submit answer
app.post('/api/answer/submit', (req, res) => {
    try {
        const { sessionId, questionId, selectedOption, correctOption, attempt } = req.body;

        const isCorrect = selectedOption === correctOption;
        let pointsEarned = 0;

        if (isCorrect) {
            pointsEarned = attempt === 1 ? 2 : 1;
        }

        // Record the answer
        const stmt = db.prepare(`
            INSERT INTO question_history (session_id, question_id, was_correct, attempts, points_earned)
            VALUES (?, ?, ?, ?, ?)
        `);
        stmt.run(sessionId, questionId, isCorrect, attempt, pointsEarned);

        // Update game session score
        const updateStmt = db.prepare(`
            UPDATE game_sessions
            SET total_score = total_score + ?,
                questions_answered = questions_answered + 1
            WHERE id = ?
        `);
        updateStmt.run(pointsEarned, sessionId);

        // Get updated score
        const scoreStmt = db.prepare('SELECT total_score, questions_answered FROM game_sessions WHERE id = ?');
        const gameData = scoreStmt.get(sessionId);

        res.json({
            success: true,
            isCorrect,
            pointsEarned,
            totalScore: gameData.total_score,
            questionsAnswered: gameData.questions_answered
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update difficulty
app.post('/api/difficulty/update', (req, res) => {
    try {
        const { sessionId, difficulty } = req.body;

        const stmt = db.prepare('UPDATE game_sessions SET difficulty_level = ? WHERE id = ?');
        stmt.run(difficulty, sessionId);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Complete game session
app.post('/api/session/complete', (req, res) => {
    try {
        const { sessionId } = req.body;

        const stmt = db.prepare('UPDATE game_sessions SET completed_at = CURRENT_TIMESTAMP WHERE id = ?');
        stmt.run(sessionId);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get leaderboard
app.get('/api/leaderboard', (req, res) => {
    try {
        const stmt = db.prepare(`
            SELECT
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
            LIMIT 10
        `);

        const leaderboard = stmt.all();
        res.json({ success: true, leaderboard });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
