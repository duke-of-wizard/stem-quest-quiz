// Game State
const gameState = {
    sessionId: null,
    userId: null,
    gameSessionId: null,
    ageGroup: null,
    category: null,
    currentQuestion: null,
    currentScore: 0,
    questionsAnswered: 0,
    difficulty: 'easy',
    attempt: 1,
    correctStreak: 0,
    totalQuestions: 10
};

// DOM Elements
const welcomeScreen = document.getElementById('welcomeScreen');
const quizScreen = document.getElementById('quizScreen');
const resultsScreen = document.getElementById('resultsScreen');

const ageButtons = document.querySelectorAll('.age-btn');
const categoryButtons = document.querySelectorAll('.category-btn');
const startQuizBtn = document.getElementById('startQuizBtn');
const categorySelection = document.querySelector('.category-selection');

const currentScoreEl = document.getElementById('currentScore');
const difficultyLevelEl = document.getElementById('difficultyLevel');
const questionNumEl = document.getElementById('questionNum');
const questionTextEl = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const feedbackMessage = document.getElementById('feedbackMessage');
const nextQuestionBtn = document.getElementById('nextQuestionBtn');

const finalScoreEl = document.getElementById('finalScore');
const totalQuestionsEl = document.getElementById('totalQuestions');
const finalDifficultyEl = document.getElementById('finalDifficulty');
const playAgainBtn = document.getElementById('playAgainBtn');

// API Base URL
const API_URL = 'http://localhost:3000/api';

// Event Listeners
ageButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        ageButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        gameState.ageGroup = btn.dataset.age;
        categorySelection.style.display = 'block';
    });
});

categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        categoryButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        gameState.category = btn.dataset.category;
        startQuizBtn.style.display = 'block';
    });
});

startQuizBtn.addEventListener('click', startQuiz);
nextQuestionBtn.addEventListener('click', loadNextQuestion);
playAgainBtn.addEventListener('click', resetGame);

// Generate unique session ID
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Start Quiz
async function startQuiz() {
    if (!gameState.ageGroup || !gameState.category) {
        alert('Please select both age group and category!');
        return;
    }

    gameState.sessionId = generateSessionId();

    try {
        // Create user session
        const response = await fetch(`${API_URL}/user/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: gameState.sessionId,
                ageGroup: gameState.ageGroup,
                category: gameState.category
            })
        });

        const data = await response.json();

        if (data.success) {
            gameState.userId = data.userId;
            gameState.gameSessionId = data.gameSessionId;

            // Switch to quiz screen
            switchScreen('quiz');
            loadNextQuestion();
        } else {
            alert('Error starting quiz. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error connecting to server. Make sure the server is running!');
    }
}

// Load Next Question
async function loadNextQuestion() {
    // Check if quiz is complete
    if (gameState.questionsAnswered >= gameState.totalQuestions) {
        completeQuiz();
        return;
    }

    // Reset attempt for new question
    gameState.attempt = 1;

    try {
        const response = await fetch(`${API_URL}/question/get`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: gameState.gameSessionId,
                category: gameState.category,
                difficulty: gameState.difficulty
            })
        });

        const data = await response.json();

        if (data.success && data.question) {
            gameState.currentQuestion = data.question;
            displayQuestion();
        } else {
            // No more questions, end quiz
            completeQuiz();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading question. Please try again.');
    }
}

// Display Question
function displayQuestion() {
    // Update question number
    questionNumEl.textContent = gameState.questionsAnswered + 1;

    // Display question
    questionTextEl.textContent = gameState.currentQuestion.question;

    // Clear previous options
    optionsContainer.innerHTML = '';
    feedbackMessage.style.display = 'none';
    feedbackMessage.className = 'feedback-message';
    nextQuestionBtn.style.display = 'none';

    // Create option buttons
    gameState.currentQuestion.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.dataset.index = index;
        btn.addEventListener('click', () => handleAnswer(index));
        optionsContainer.appendChild(btn);
    });
}

// Handle Answer Selection
async function handleAnswer(selectedIndex) {
    const correctIndex = gameState.currentQuestion.correct;
    const isCorrect = selectedIndex === correctIndex;

    // Disable all option buttons
    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach(btn => btn.classList.add('disabled'));

    // Highlight selected answer
    optionButtons[selectedIndex].classList.add(isCorrect ? 'correct' : 'incorrect');

    try {
        // Submit answer to backend
        const response = await fetch(`${API_URL}/answer/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: gameState.gameSessionId,
                questionId: gameState.currentQuestion.id,
                selectedOption: selectedIndex,
                correctOption: correctIndex,
                attempt: gameState.attempt
            })
        });

        const data = await response.json();

        if (data.success) {
            // Update score
            gameState.currentScore = data.totalScore;
            currentScoreEl.textContent = gameState.currentScore;

            if (isCorrect) {
                // Correct answer
                gameState.correctStreak++;
                gameState.questionsAnswered++;

                feedbackMessage.className = 'feedback-message success';
                feedbackMessage.textContent = gameState.attempt === 1
                    ? `🎉 Excellent! You earned ${data.pointsEarned} points!`
                    : `✓ Correct! You earned ${data.pointsEarned} point!`;
                feedbackMessage.style.display = 'block';

                // Check if difficulty should increase
                if (gameState.correctStreak >= 3) {
                    increaseDifficulty();
                    gameState.correctStreak = 0;
                }

                // Show next question button
                nextQuestionBtn.style.display = 'block';
            } else {
                // Wrong answer
                gameState.correctStreak = 0;

                if (gameState.attempt === 1) {
                    // First attempt - give another try
                    gameState.attempt = 2;

                    feedbackMessage.className = 'feedback-message retry';
                    feedbackMessage.textContent = '❌ Not quite! Try again!';
                    feedbackMessage.style.display = 'block';

                    // Re-enable buttons for second attempt
                    optionButtons.forEach(btn => {
                        if (btn.dataset.index !== selectedIndex.toString()) {
                            btn.classList.remove('disabled');
                        }
                    });
                } else {
                    // Second attempt - highlight correct answer and move on
                    gameState.questionsAnswered++;
                    optionButtons[correctIndex].classList.add('correct');

                    feedbackMessage.className = 'feedback-message error';
                    feedbackMessage.textContent = `❌ The correct answer was: ${gameState.currentQuestion.options[correctIndex]}`;
                    feedbackMessage.style.display = 'block';

                    // Show next question button
                    nextQuestionBtn.style.display = 'block';
                }
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error submitting answer. Please try again.');
    }
}

// Increase Difficulty
async function increaseDifficulty() {
    let newDifficulty = gameState.difficulty;

    if (gameState.difficulty === 'easy') {
        newDifficulty = 'medium';
        difficultyLevelEl.textContent = 'Medium';
        showDifficultyNotification('🎯 Difficulty increased to Medium!');
    } else if (gameState.difficulty === 'medium') {
        newDifficulty = 'hard';
        difficultyLevelEl.textContent = 'Hard';
        showDifficultyNotification('🔥 Difficulty increased to Hard!');
    }

    if (newDifficulty !== gameState.difficulty) {
        gameState.difficulty = newDifficulty;

        try {
            await fetch(`${API_URL}/difficulty/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: gameState.gameSessionId,
                    difficulty: newDifficulty
                })
            });
        } catch (error) {
            console.error('Error updating difficulty:', error);
        }
    }
}

// Show Difficulty Notification
function showDifficultyNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #49E9A6, #49CCF9);
        color: white;
        padding: 1rem 2rem;
        border-radius: 12px;
        font-weight: 700;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideIn 0.5s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Complete Quiz
async function completeQuiz() {
    try {
        await fetch(`${API_URL}/session/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: gameState.gameSessionId
            })
        });

        // Show results
        finalScoreEl.textContent = gameState.currentScore;
        totalQuestionsEl.textContent = gameState.questionsAnswered;
        finalDifficultyEl.textContent = gameState.difficulty.charAt(0).toUpperCase() + gameState.difficulty.slice(1);

        switchScreen('results');
    } catch (error) {
        console.error('Error:', error);
    }
}

// Reset Game
function resetGame() {
    // Reset game state
    gameState.sessionId = null;
    gameState.userId = null;
    gameState.gameSessionId = null;
    gameState.ageGroup = null;
    gameState.category = null;
    gameState.currentQuestion = null;
    gameState.currentScore = 0;
    gameState.questionsAnswered = 0;
    gameState.difficulty = 'easy';
    gameState.attempt = 1;
    gameState.correctStreak = 0;

    // Reset UI
    ageButtons.forEach(b => b.classList.remove('selected'));
    categoryButtons.forEach(b => b.classList.remove('selected'));
    categorySelection.style.display = 'none';
    startQuizBtn.style.display = 'none';
    currentScoreEl.textContent = '0';
    difficultyLevelEl.textContent = 'Easy';

    switchScreen('welcome');
}

// Switch Screen
function switchScreen(screen) {
    welcomeScreen.classList.remove('active');
    quizScreen.classList.remove('active');
    resultsScreen.classList.remove('active');

    if (screen === 'welcome') {
        welcomeScreen.classList.add('active');
    } else if (screen === 'quiz') {
        quizScreen.classList.add('active');
    } else if (screen === 'results') {
        resultsScreen.classList.add('active');
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
