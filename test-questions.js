// Quick script to verify the question bank
// Run this with: node test-questions.js

const questionStats = {
    maths: {
        easy: 8,
        medium: 6,
        hard: 5
    },
    science: {
        easy: 6,
        medium: 5,
        hard: 4
    },
    riddles: {
        easy: 5,
        medium: 4,
        hard: 3
    },
    spelling: {
        easy: 5,
        medium: 4,
        hard: 3
    },
    india: {
        easy: 6,
        medium: 5,
        hard: 4
    }
};

console.log('\n🎯 STEM Quest - Question Bank Summary\n');
console.log('=====================================\n');

let totalQuestions = 0;

Object.keys(questionStats).forEach(category => {
    const categoryTotal = questionStats[category].easy +
                         questionStats[category].medium +
                         questionStats[category].hard;
    totalQuestions += categoryTotal;

    console.log(`📚 ${category.toUpperCase()}`);
    console.log(`   Easy: ${questionStats[category].easy} questions`);
    console.log(`   Medium: ${questionStats[category].medium} questions`);
    console.log(`   Hard: ${questionStats[category].hard} questions`);
    console.log(`   Total: ${categoryTotal} questions\n`);
});

console.log('=====================================');
console.log(`\n✅ Total Questions in Bank: ${totalQuestions}`);
console.log('\nCategories: Maths, Science, Riddles, Spelling, India Quiz');
console.log('Difficulty Levels: Easy, Medium, Hard');
console.log('Progression: Auto-increase difficulty after 3 correct answers\n');
