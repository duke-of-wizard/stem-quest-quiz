#!/usr/bin/env node
// Verify and fix all existing questions in questions.json using LLM-as-judge
// Usage: export OPENAI_API_KEY=sk-... && node verify-questions.js
// Optional: node verify-questions.js --category maths --difficulty easy

const fs = require('fs');
const OpenAI = require('openai');

const QUESTIONS_FILE = './questions.json';
const BATCH_SIZE = 20; // Questions per verification call
const DELAY_MS = 1000; // Delay between API calls to avoid rate limits

const args = process.argv.slice(2);
let filterCategory = null;
let filterDifficulty = null;

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--category' && args[i + 1]) filterCategory = args[i + 1];
    if (args[i] === '--difficulty' && args[i + 1]) filterDifficulty = args[i + 1];
}

async function verifyBatch(questions, client) {
    const questionsForVerification = questions.map((q, i) => ({
        index: i,
        question: q.question,
        options: q.options,
        claimed_correct: q.correct,
        claimed_answer: q.options[q.correct]
    }));

    const verification = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 4000,
        messages: [{
            role: 'user',
            content: `You are a strict fact-checker for a children's quiz. For each question below, verify if the claimed correct answer is actually correct.

Return ONLY a valid JSON array (no markdown fences) with objects:
- "index": number (the question index)
- "verdict": "correct" | "wrong" | "ambiguous"
- "correct_index": number (the actual correct 0-based index if verdict is "wrong", otherwise same as claimed)
- "reason": string (brief explanation if wrong or ambiguous)

Be very strict:
- For maths: compute the exact answer
- For science: verify the fact
- For spelling: check if the "correct" option is actually spelled correctly
- For India GK: verify the fact
- For riddles: verify the logic

Questions to verify:
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
            throw new Error('Could not parse verification response');
        }
    }

    return verdicts;
}

async function main() {
    if (!process.env.OPENAI_API_KEY) {
        console.error('ERROR: OPENAI_API_KEY environment variable not set.');
        console.error('Run: export OPENAI_API_KEY=sk-...');
        process.exit(1);
    }

    const client = new OpenAI();
    const questionBank = JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf-8'));

    const categories = filterCategory ? [filterCategory] : Object.keys(questionBank);
    let totalQuestions = 0;
    let totalFixed = 0;
    let totalDropped = 0;
    let totalCorrect = 0;

    console.log('STEM Quest - Question Verification Script');
    console.log('=========================================\n');

    for (const category of categories) {
        const difficulties = filterDifficulty ? [filterDifficulty] : Object.keys(questionBank[category] || {});

        for (const difficulty of difficulties) {
            const questions = questionBank[category]?.[difficulty];
            if (!questions || questions.length === 0) continue;

            console.log(`\n[${category}/${difficulty}] Verifying ${questions.length} questions...`);

            const verifiedQuestions = [];
            let fixed = 0;
            let dropped = 0;
            let correct = 0;

            // Process in batches
            for (let i = 0; i < questions.length; i += BATCH_SIZE) {
                const batch = questions.slice(i, i + BATCH_SIZE);
                const batchNum = Math.floor(i / BATCH_SIZE) + 1;
                const totalBatches = Math.ceil(questions.length / BATCH_SIZE);

                process.stdout.write(`  Batch ${batchNum}/${totalBatches} (${batch.length} questions)... `);

                try {
                    const verdicts = await verifyBatch(batch, client);

                    for (const v of verdicts) {
                        const q = batch[v.index];
                        if (!q) continue;

                        if (v.verdict === 'correct') {
                            verifiedQuestions.push(q);
                            correct++;
                        } else if (v.verdict === 'wrong' && typeof v.correct_index === 'number' && v.correct_index >= 0 && v.correct_index <= 3) {
                            const oldAnswer = q.options[q.correct];
                            q.correct = v.correct_index;
                            const newAnswer = q.options[q.correct];
                            verifiedQuestions.push(q);
                            fixed++;
                            console.log(`\n    FIXED: "${q.question}"`);
                            console.log(`      Was: "${oldAnswer}" -> Now: "${newAnswer}" (${v.reason || ''})`);
                        } else {
                            dropped++;
                            console.log(`\n    DROPPED: "${q.question}" (${v.reason || 'ambiguous'})`);
                        }
                    }

                    // Handle questions not in verdicts (keep them)
                    const verifiedIndices = new Set(verdicts.map(v => v.index));
                    for (let j = 0; j < batch.length; j++) {
                        if (!verifiedIndices.has(j)) {
                            verifiedQuestions.push(batch[j]);
                            correct++;
                        }
                    }

                    console.log(`OK (${correct} correct, ${fixed} fixed, ${dropped} dropped so far)`);
                } catch (e) {
                    console.log(`ERROR: ${e.message} - keeping batch as-is`);
                    verifiedQuestions.push(...batch);
                }

                // Rate limit delay
                if (i + BATCH_SIZE < questions.length) {
                    await new Promise(r => setTimeout(r, DELAY_MS));
                }
            }

            // Update the question bank
            questionBank[category][difficulty] = verifiedQuestions;

            console.log(`  Result: ${correct} correct, ${fixed} fixed, ${dropped} dropped (${verifiedQuestions.length} remaining)`);

            totalQuestions += questions.length;
            totalFixed += fixed;
            totalDropped += dropped;
            totalCorrect += correct;
        }
    }

    // Save
    fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questionBank, null, 2));

    console.log('\n=========================================');
    console.log(`DONE! Verified ${totalQuestions} questions total`);
    console.log(`  Correct: ${totalCorrect}`);
    console.log(`  Fixed:   ${totalFixed}`);
    console.log(`  Dropped: ${totalDropped}`);
    console.log(`  Saved to ${QUESTIONS_FILE}`);
}

main().catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
});
