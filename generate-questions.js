#!/usr/bin/env node

// =============================================================================
// STEM Quest Quiz - Bulk Question Generator
//
// Generates questions using the Anthropic Claude API and saves them to questions.json
//
// Usage:
//   1. Get an API key from https://platform.openai.com/api-keys
//   2. Export it:  export OPENAI_API_KEY=sk-...
//   3. Run:       node generate-questions.js
//   4. The script saves progress after each batch and can be resumed if interrupted
//
// Options:
//   --target N    Questions per category per difficulty (default: 1000)
//   --batch N     Questions per API call (default: 20)
//   --category X  Only generate for a specific category
//   --difficulty X Only generate for a specific difficulty
// =============================================================================

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

const QUESTIONS_FILE = path.join(__dirname, 'questions.json');
const PROGRESS_FILE = path.join(__dirname, 'generate-progress.json');

const CATEGORIES = ['maths', 'science', 'riddles', 'spelling', 'india'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

const categoryIdPrefix = { maths: 'm', science: 's', riddles: 'r', spelling: 'sp', india: 'i' };
const difficultyIdPrefix = { easy: 'e', medium: 'm', hard: 'h' };

const categoryDescriptions = {
    maths: 'mathematics (arithmetic, geometry, algebra, number puzzles, fractions, percentages)',
    science: 'science (physics, chemistry, biology, earth science, space, human body, animals)',
    riddles: 'riddles and brain teasers (wordplay, logic puzzles, lateral thinking)',
    spelling: 'spelling (ask "How do you spell..." with one correct and three plausible misspellings)',
    india: 'India general knowledge (history, geography, culture, festivals, famous people, landmarks, states, rivers)'
};

const difficultyDescriptions = {
    easy: 'easy difficulty (suitable for ages 5-7, simple vocabulary, basic concepts)',
    medium: 'medium difficulty (suitable for ages 8-10, requires some reasoning)',
    hard: 'hard difficulty (suitable for ages 11-13, challenging concepts, requires thinking)'
};

// Parse CLI args
const args = process.argv.slice(2);
let TARGET_PER_SLOT = 1000;
let BATCH_SIZE = 20;
let filterCategory = null;
let filterDifficulty = null;

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--target' && args[i + 1]) TARGET_PER_SLOT = parseInt(args[i + 1], 10);
    if (args[i] === '--batch' && args[i + 1]) BATCH_SIZE = parseInt(args[i + 1], 10);
    if (args[i] === '--category' && args[i + 1]) filterCategory = args[i + 1];
    if (args[i] === '--difficulty' && args[i + 1]) filterDifficulty = args[i + 1];
}

function loadProgress() {
    try {
        return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
    } catch (e) {
        return {};
    }
}

function saveProgress(progress) {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

function getNextId(questions, category, difficulty) {
    const prefix = `${categoryIdPrefix[category]}_${difficultyIdPrefix[difficulty]}_`;
    let maxNum = 0;
    for (const q of questions) {
        const num = parseInt(q.id.replace(prefix, ''), 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
    }
    return maxNum;
}

// LLM-as-judge: verify generated questions have correct answers
async function verifyBatch(questions, client) {
    if (!questions.length) return questions;

    const questionsForVerification = questions.map((q, i) => ({
        index: i,
        question: q.question,
        option_0: q.options[0],
        option_1: q.options[1],
        option_2: q.options[2],
        option_3: q.options[3],
        claimed_correct_index: q.correct,
        claimed_correct_text: q.options[q.correct]
    }));

    try {
        const verification = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            max_tokens: 4000,
            messages: [{
                role: 'user',
                content: `You are a fact-checker for a children's quiz.

For each question, verify if claimed_correct_text is the right answer. "correct_index" in your response must be the OPTION NUMBER (0-3) whose TEXT is correct.

Return ONLY a valid JSON array (no markdown fences) with objects:
- "index": number (question index)
- "verdict": "correct" | "wrong" | "ambiguous"
- "correct_index": number (0-3, the option number with the right answer text)

For maths, compute the answer then find the matching option. If no option is right, verdict is "ambiguous".

Questions:
${JSON.stringify(questionsForVerification)}`
            }]
        });

        const verifyText = verification.choices[0].message.content.trim();
        let verdicts;
        try {
            verdicts = JSON.parse(verifyText);
        } catch (e) {
            const jsonMatch = verifyText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                verdicts = JSON.parse(jsonMatch[0]);
            } else {
                console.log('    Could not parse verification response, keeping all questions');
                return questions;
            }
        }

        const verified = [];
        let fixed = 0, dropped = 0;
        for (const v of verdicts) {
            const q = questions[v.index];
            if (!q) continue;

            if (v.verdict === 'correct') {
                verified.push(q);
            } else if (v.verdict === 'wrong' && typeof v.correct_index === 'number' && v.correct_index >= 0 && v.correct_index <= 3) {
                q.correct = v.correct_index;
                verified.push(q);
                fixed++;
            } else {
                dropped++;
            }
        }

        if (fixed > 0) console.log(`    Fixed ${fixed} wrong answers`);
        if (dropped > 0) console.log(`    Dropped ${dropped} ambiguous questions`);
        return verified;
    } catch (e) {
        console.error('    Verification failed, keeping all questions:', e.message);
        return questions;
    }
}

async function generateBatch(client, category, difficulty, existingQuestions, batchSize) {
    const sampleTexts = existingQuestions.slice(-30).map(q => q.question);

    const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 8000,
        messages: [{
            role: 'user',
            content: `Generate ${batchSize} unique multiple-choice quiz questions for children about ${categoryDescriptions[category]}, at ${difficultyDescriptions[difficulty]} level.

Return ONLY a valid JSON array (no markdown fences, no explanation) with objects having these fields:
- "question": string (the question text)
- "options": array of exactly 4 strings (answer choices)
- "correct": number (0-based index of the correct answer, 0 to 3)

Critical requirements:
- Every question must be factually accurate and verifiable
- All 4 options must be plausible but only one correct
- Questions must be age-appropriate for the difficulty level
- UNIQUENESS IS CRITICAL: Each question must test a DIFFERENT fact, concept, or skill. Do NOT:
  - Ask the same concept with different numbers (e.g., "What is 3+4?" and "What is 5+6?" are too similar)
  - Rephrase an existing question (e.g., "What planet is largest?" vs "Which is the biggest planet?")
  - Ask about the same narrow topic repeatedly (e.g., multiple questions about the capital of India)
  - Use the same question template with swapped values
- Cover DIVERSE topics within the category. Each question should feel fresh and different.
- Here are recent existing questions to AVOID resembling:
${JSON.stringify(sampleTexts)}
- For spelling questions: frame as "How do you spell..." with exactly one correct spelling and three common misspellings
- Vary the position of the correct answer (don't always put it at the same index)`
        }]
    });

    const text = completion.choices[0].message.content.trim();
    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch (e) {
        const match = text.match(/\[[\s\S]*\]/);
        if (match) {
            parsed = JSON.parse(match[0]);
        } else {
            throw new Error('Failed to parse response as JSON');
        }
    }

    // Validate each question
    const valid = [];
    const seenTexts = new Set(existingQuestions.map(q => q.question.toLowerCase().trim()));

    for (const q of parsed) {
        if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 ||
            typeof q.correct !== 'number' || q.correct < 0 || q.correct > 3) {
            continue;
        }
        const normalizedText = q.question.toLowerCase().trim();
        if (seenTexts.has(normalizedText)) continue;
        seenTexts.add(normalizedText);
        valid.push({ question: q.question, options: q.options, correct: q.correct });
    }

    // LLM-as-judge: verify answers before returning
    if (valid.length > 0) {
        console.log(`    Verifying ${valid.length} questions...`);
        const verified = await verifyBatch(valid, client);
        return verified;
    }

    return valid;
}

async function main() {
    if (!process.env.OPENAI_API_KEY) {
        console.error('ERROR: OPENAI_API_KEY environment variable not set.');
        console.error('Get your API key from https://platform.openai.com/api-keys');
        console.error('Then run: export OPENAI_API_KEY=sk-...');
        process.exit(1);
    }

    const client = new OpenAI();
    const questionBank = JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf-8'));
    const progress = loadProgress();

    const categories = filterCategory ? [filterCategory] : CATEGORIES;
    const difficulties = filterDifficulty ? [filterDifficulty] : DIFFICULTIES;

    let totalGenerated = 0;
    let totalSlots = categories.length * difficulties.length;
    let slotsCompleted = 0;

    console.log(`\nSTEM Quest Quiz - Question Generator`);
    console.log(`Target: ${TARGET_PER_SLOT} questions per category per difficulty`);
    console.log(`Batch size: ${BATCH_SIZE} questions per API call`);
    console.log(`Categories: ${categories.join(', ')}`);
    console.log(`Difficulties: ${difficulties.join(', ')}\n`);

    for (const category of categories) {
        for (const difficulty of difficulties) {
            const slotKey = `${category}_${difficulty}`;

            if (!questionBank[category]) questionBank[category] = {};
            if (!questionBank[category][difficulty]) questionBank[category][difficulty] = [];

            const existing = questionBank[category][difficulty];
            const currentCount = existing.length;

            if (currentCount >= TARGET_PER_SLOT) {
                console.log(`[${slotKey}] Already at ${currentCount}/${TARGET_PER_SLOT} - skipping`);
                slotsCompleted++;
                continue;
            }

            const needed = TARGET_PER_SLOT - currentCount;
            console.log(`\n[${slotKey}] Have ${currentCount}, need ${needed} more`);

            let generated = 0;
            let failures = 0;
            const MAX_FAILURES = 3;

            while (generated < needed && failures < MAX_FAILURES) {
                const batchSize = Math.min(BATCH_SIZE, needed - generated);
                process.stdout.write(`  Generating batch of ${batchSize}... `);

                try {
                    const batch = await generateBatch(client, category, difficulty, existing, batchSize);

                    // Assign IDs
                    let nextNum = getNextId(existing, category, difficulty);
                    const prefix = `${categoryIdPrefix[category]}_${difficultyIdPrefix[difficulty]}_`;

                    for (const q of batch) {
                        nextNum++;
                        q.id = prefix + nextNum;
                        existing.push(q);
                    }

                    generated += batch.length;
                    totalGenerated += batch.length;
                    failures = 0;

                    console.log(`got ${batch.length} (total: ${existing.length}/${TARGET_PER_SLOT})`);

                    // Save after each batch
                    fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questionBank, null, 2));
                    progress[slotKey] = existing.length;
                    saveProgress(progress);

                    // Rate limit: wait 1 second between API calls
                    await new Promise(r => setTimeout(r, 1000));

                } catch (error) {
                    failures++;
                    console.log(`FAILED (${error.message}) - attempt ${failures}/${MAX_FAILURES}`);
                    await new Promise(r => setTimeout(r, 2000));
                }
            }

            if (failures >= MAX_FAILURES) {
                console.log(`  Skipping ${slotKey} after ${MAX_FAILURES} consecutive failures`);
            }

            slotsCompleted++;
            console.log(`  Progress: ${slotsCompleted}/${totalSlots} slots processed`);
        }
    }

    // Final save
    fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questionBank, null, 2));

    // Print summary
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Generation complete!`);
    console.log(`Total new questions generated: ${totalGenerated}`);
    console.log(`\nQuestion bank summary:`);
    for (const cat of CATEGORIES) {
        for (const diff of DIFFICULTIES) {
            const count = (questionBank[cat]?.[diff] || []).length;
            const status = count >= TARGET_PER_SLOT ? 'DONE' : `${count}/${TARGET_PER_SLOT}`;
            console.log(`  ${cat} ${diff}: ${status}`);
        }
    }
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
