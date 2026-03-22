#!/usr/bin/env node
// Verify and fix all existing questions in questions.json using LLM-as-judge
// Usage: export OPENAI_API_KEY=sk-... && node verify-questions.js
// Optional: node verify-questions.js --category maths --difficulty easy

const fs = require('fs');
const OpenAI = require('openai');

const QUESTIONS_FILE = './questions.json';
const BATCH_SIZE = 15; // Questions per verification call
const DELAY_MS = 1500; // Delay between API calls to avoid rate limits
const MATH_MODEL = 'gpt-5.4'; // Latest model for maths verification

const args = process.argv.slice(2);
let filterCategory = null;
let filterDifficulty = null;

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--category' && args[i + 1]) filterCategory = args[i + 1];
    if (args[i] === '--difficulty' && args[i + 1]) filterDifficulty = args[i + 1];
}

async function verifyBatch(questions, client, model = 'gpt-4o-mini') {
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

    const verification = await client.chat.completions.create({
        model: model,
        max_completion_tokens: 4000,
        messages: [{
            role: 'user',
            content: `You are a strict fact-checker for a children's quiz.

For each question, I give you the question text, four options (option_0 through option_3), and the claimed_correct_index (which option is marked as correct).

Your job: verify if claimed_correct_text is ACTUALLY the right answer to the question.

IMPORTANT: "correct_index" in your response must refer to the OPTION NUMBER (0, 1, 2, or 3) whose TEXT is the right answer. For example, if option_2 has text "6" and 6 is the right answer, correct_index should be 2.

Return ONLY a valid JSON array (no markdown fences) with objects:
- "index": number (the question's index field from input)
- "verdict": "correct" | "wrong" | "ambiguous"
- "correct_index": number (0-3, the option number that has the RIGHT answer text. Same as claimed if verdict is "correct")
- "reason": string (brief explanation if wrong or ambiguous)

Rules:
- For maths: compute the exact numerical answer, then find which option matches that number
- For science/GK: verify the fact, then find which option matches
- For spelling: the correct option must be spelled correctly
- If no option has the right answer, verdict is "ambiguous"

Questions:
${JSON.stringify(questionsForVerification, null, 2)}`
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
                    const model = category === 'maths' ? MATH_MODEL : 'gpt-4o-mini';
                    const verdicts = await verifyBatch(batch, client, model);

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
