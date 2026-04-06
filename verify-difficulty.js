#!/usr/bin/env node
// Verify difficulty classification of questions using GPT-4o as judge
// Usage: export OPENAI_API_KEY=sk-... && node verify-difficulty.js
// Optional: node verify-difficulty.js --category maths

const fs = require('fs');
const OpenAI = require('openai');

const QUESTIONS_FILE = './questions.json';
const BATCH_SIZE = 15;
const DELAY_MS = 1000;

const args = process.argv.slice(2);
let filterCategory = null;
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--category' && args[i + 1]) filterCategory = args[i + 1];
}

const PROMPT = `You are an expert in children's education. For each question, classify its TRUE difficulty:

- "easy": Simple recall, single-step, basic facts. A 5-7 year old should answer this.
  - Maths: single-digit arithmetic, counting, basic shapes
  - Science: "What color is the sky?", "How many legs does a dog have?"
  - Spelling: 3-4 letter common words

- "medium": Some reasoning, two-step problems, less common facts. An 8-10 year old level.
  - Maths: two-digit arithmetic, simple fractions, basic geometry
  - Science: "What planet is closest to the sun?", "What do plants need to grow?"
  - Spelling: 5-7 letter words

- "hard": Multi-step reasoning, advanced concepts, tricky logic. An 11-13 year old level.
  - Maths: multi-step problems, percentages, algebra concepts, large numbers
  - Science: "What is photosynthesis?", "What is the chemical symbol for gold?"
  - Spelling: 8+ letter complex words

IMPORTANT: Judge the ACTUAL difficulty of the question, not its current label. Many questions are mislabeled.

Return ONLY a valid JSON array (no markdown fences) with objects:
- "index": number (the question's index from input)
- "difficulty": "easy" | "medium" | "hard"

Questions:
`;

async function classifyBatch(questions, client) {
    const formatted = questions.map((q, i) => ({
        index: i,
        question: q.question,
        options: q.options
    }));

    const response = await client.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 4000,
        messages: [{ role: 'user', content: PROMPT + JSON.stringify(formatted, null, 2) }]
    });

    const text = response.choices[0].message.content.trim();
    try {
        return JSON.parse(text);
    } catch (e) {
        const match = text.match(/\[[\s\S]*\]/);
        if (match) return JSON.parse(match[0]);
        return null;
    }
}

async function main() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) { console.error('Set OPENAI_API_KEY'); process.exit(1); }

    const client = new OpenAI({ apiKey });
    const questionBank = JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf-8'));

    const categories = filterCategory ? [filterCategory] : Object.keys(questionBank);
    const difficulties = ['easy', 'medium', 'hard'];

    let totalChecked = 0, totalMoved = 0;
    const moves = [];

    console.log('STEM Quest - Difficulty Verification (GPT-4o Judge)\n');
    console.log('='.repeat(60) + '\n');

    for (const category of categories) {
        if (!questionBank[category]) continue;

        for (const difficulty of difficulties) {
            const questions = questionBank[category]?.[difficulty];
            if (!questions || questions.length === 0) continue;

            console.log(`[${category}/${difficulty}] Checking ${questions.length} questions...`);

            for (let i = 0; i < questions.length; i += BATCH_SIZE) {
                const batch = questions.slice(i, i + BATCH_SIZE);
                const batchNum = Math.floor(i / BATCH_SIZE) + 1;
                const totalBatches = Math.ceil(questions.length / BATCH_SIZE);
                process.stdout.write(`  Batch ${batchNum}/${totalBatches}...`);

                try {
                    const results = await classifyBatch(batch, client);
                    if (!results) {
                        console.log(' ⚠ Failed, skipping');
                        continue;
                    }

                    let batchMoved = 0;
                    for (const r of results) {
                        if (r.index == null || !r.difficulty) continue;
                        totalChecked++;

                        if (r.difficulty !== difficulty) {
                            const q = questions[i + r.index];
                            if (q) {
                                moves.push({
                                    category,
                                    from: difficulty,
                                    to: r.difficulty,
                                    question: q.question,
                                    id: q.id
                                });
                                batchMoved++;
                                totalMoved++;
                            }
                        }
                    }
                    console.log(` ${batchMoved > 0 ? batchMoved + ' to move' : 'OK'}`);
                } catch (err) {
                    console.log(` ⚠ Error: ${err.message}`);
                }

                if (i + BATCH_SIZE < questions.length) {
                    await new Promise(r => setTimeout(r, DELAY_MS));
                }
            }
            console.log('');
        }
    }

    // Apply reclassifications
    if (moves.length > 0) {
        console.log('='.repeat(60));
        console.log(`\nReclassifying ${moves.length} questions:\n`);

        const summary = { 'easy→medium': 0, 'easy→hard': 0, 'medium→easy': 0, 'medium→hard': 0, 'hard→easy': 0, 'hard→medium': 0 };

        for (const move of moves) {
            const key = `${move.from}→${move.to}`;
            summary[key] = (summary[key] || 0) + 1;

            const oldArr = questionBank[move.category][move.from];
            const idx = oldArr.findIndex(q => q.id === move.id);
            if (idx !== -1) {
                const [q] = oldArr.splice(idx, 1);
                if (!questionBank[move.category][move.to]) questionBank[move.category][move.to] = [];
                questionBank[move.category][move.to].push(q);
            }
        }

        console.log('Movement summary:');
        for (const [key, count] of Object.entries(summary)) {
            if (count > 0) console.log(`  ${key}: ${count}`);
        }

        fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questionBank, null, 2));
        console.log(`\n✅ Saved to ${QUESTIONS_FILE}`);
    } else {
        console.log('✅ All questions correctly classified!');
    }

    // Print final counts per slot
    console.log(`\nFinal question counts:`);
    for (const cat of Object.keys(questionBank)) {
        for (const diff of difficulties) {
            const count = questionBank[cat]?.[diff]?.length || 0;
            console.log(`  ${cat}/${diff}: ${count}`);
        }
    }

    console.log(`\nTotal checked: ${totalChecked}, Reclassified: ${totalMoved}`);
}

main().catch(console.error);
