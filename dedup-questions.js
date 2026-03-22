#!/usr/bin/env node

// =============================================================================
// STEM Quest Quiz - Question Deduplicator
//
// Uses OpenAI embeddings to find and remove semantically similar questions.
//
// Usage:
//   export OPENAI_API_KEY=sk-...
//   node dedup-questions.js                 # Preview duplicates (dry run)
//   node dedup-questions.js --apply         # Actually remove duplicates
//   node dedup-questions.js --threshold 0.9 # Adjust similarity threshold (default: 0.92)
//   node dedup-questions.js --category maths --difficulty easy  # Target specific slot
// =============================================================================

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

const QUESTIONS_FILE = path.join(__dirname, 'questions.json');
const BACKUP_FILE = path.join(__dirname, 'questions.backup.json');

const CATEGORIES = ['maths', 'science', 'riddles', 'spelling', 'india'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

// Parse CLI args
const args = process.argv.slice(2);
let THRESHOLD = 0.92;
let applyChanges = false;
let filterCategory = null;
let filterDifficulty = null;

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--threshold' && args[i + 1]) THRESHOLD = parseFloat(args[i + 1]);
    if (args[i] === '--apply') applyChanges = true;
    if (args[i] === '--category' && args[i + 1]) filterCategory = args[i + 1];
    if (args[i] === '--difficulty' && args[i + 1]) filterDifficulty = args[i + 1];
}

// Cosine similarity between two vectors
function cosineSimilarity(a, b) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Get embeddings in batches (API limit is 2048 inputs per call)
async function getEmbeddings(client, texts) {
    const BATCH_SIZE = 500;
    const allEmbeddings = [];

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
        const batch = texts.slice(i, i + BATCH_SIZE);
        process.stdout.write(`  Getting embeddings ${i + 1}-${Math.min(i + BATCH_SIZE, texts.length)} of ${texts.length}... `);

        const response = await client.embeddings.create({
            model: 'text-embedding-3-small',
            input: batch
        });

        const embeddings = response.data.map(d => d.embedding);
        allEmbeddings.push(...embeddings);
        console.log('done');

        // Rate limit
        if (i + BATCH_SIZE < texts.length) {
            await new Promise(r => setTimeout(r, 500));
        }
    }

    return allEmbeddings;
}

// Find duplicate pairs within a set of questions
function findDuplicates(questions, embeddings, threshold) {
    const duplicatePairs = [];
    const toRemove = new Set();

    for (let i = 0; i < questions.length; i++) {
        if (toRemove.has(i)) continue;

        for (let j = i + 1; j < questions.length; j++) {
            if (toRemove.has(j)) continue;

            const sim = cosineSimilarity(embeddings[i], embeddings[j]);
            if (sim >= threshold) {
                duplicatePairs.push({
                    similarity: sim.toFixed(4),
                    kept: { id: questions[i].id, question: questions[i].question },
                    removed: { id: questions[j].id, question: questions[j].question }
                });
                toRemove.add(j); // Keep the first (earlier ID), remove the later one
            }
        }
    }

    return { duplicatePairs, toRemove };
}

async function main() {
    if (!process.env.OPENAI_API_KEY) {
        console.error('ERROR: OPENAI_API_KEY environment variable not set.');
        process.exit(1);
    }

    const client = new OpenAI();
    const questionBank = JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf-8'));

    const categories = filterCategory ? [filterCategory] : CATEGORIES;
    const difficulties = filterDifficulty ? [filterDifficulty] : DIFFICULTIES;

    console.log(`\nSTEM Quest Quiz - Question Deduplicator`);
    console.log(`Similarity threshold: ${THRESHOLD}`);
    console.log(`Mode: ${applyChanges ? 'APPLY (will modify questions.json)' : 'DRY RUN (preview only)'}`);
    console.log();

    let totalDuplicates = 0;
    let totalQuestions = 0;

    for (const category of categories) {
        for (const difficulty of difficulties) {
            const slotKey = `${category}_${difficulty}`;
            const questions = questionBank[category]?.[difficulty] || [];

            if (questions.length < 2) {
                continue;
            }

            totalQuestions += questions.length;
            console.log(`[${slotKey}] Checking ${questions.length} questions...`);

            // Get embeddings for all question texts
            const texts = questions.map(q => q.question);
            const embeddings = await getEmbeddings(client, texts);

            // Find duplicates
            const { duplicatePairs, toRemove } = findDuplicates(questions, embeddings, THRESHOLD);

            if (duplicatePairs.length === 0) {
                console.log(`  No duplicates found\n`);
                continue;
            }

            totalDuplicates += duplicatePairs.length;
            console.log(`  Found ${duplicatePairs.length} duplicate pairs:`);

            // Show up to 10 examples
            const showCount = Math.min(duplicatePairs.length, 10);
            for (let i = 0; i < showCount; i++) {
                const pair = duplicatePairs[i];
                console.log(`    [${pair.similarity}] "${pair.kept.question.substring(0, 60)}..."`);
                console.log(`             ~ "${pair.removed.question.substring(0, 60)}..."`);
            }
            if (duplicatePairs.length > showCount) {
                console.log(`    ... and ${duplicatePairs.length - showCount} more`);
            }

            // Apply removal
            if (applyChanges && toRemove.size > 0) {
                const filtered = questions.filter((_, idx) => !toRemove.has(idx));
                questionBank[category][difficulty] = filtered;
                console.log(`  Removed ${toRemove.size} questions (${questions.length} -> ${filtered.length})`);
            }

            console.log();
        }
    }

    // Summary
    console.log('='.repeat(50));
    console.log(`Total questions scanned: ${totalQuestions}`);
    console.log(`Total duplicates found: ${totalDuplicates}`);

    if (applyChanges && totalDuplicates > 0) {
        // Backup first
        fs.copyFileSync(QUESTIONS_FILE, BACKUP_FILE);
        console.log(`Backup saved to: ${BACKUP_FILE}`);

        fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questionBank, null, 2));
        console.log(`Updated questions.json saved.`);

        // Print new counts
        console.log(`\nUpdated question bank:`);
        for (const cat of CATEGORIES) {
            for (const diff of DIFFICULTIES) {
                const count = (questionBank[cat]?.[diff] || []).length;
                console.log(`  ${cat} ${diff}: ${count}`);
            }
        }
    } else if (totalDuplicates > 0) {
        console.log(`\nRun with --apply to remove duplicates.`);
    } else {
        console.log(`No duplicates found!`);
    }
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
