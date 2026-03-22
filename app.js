// Game State
const gameState = {
    sessionId: null,
    userId: null,
    gameSessionId: null,
    ageGroup: null,
    currentQuestion: null,
    currentScore: 0,
    questionsAnswered: 0,
    difficulty: 'easy',
    attempt: 1,
    correctStreak: 0,
    winningStreak: 0,
    totalQuestions: 10,
    allCategories: ['maths', 'science', 'riddles', 'spelling', 'india']
};

// DOM Elements
const welcomeScreen = document.getElementById('welcomeScreen');
const quizScreen = document.getElementById('quizScreen');
const resultsScreen = document.getElementById('resultsScreen');

const ageButtons = document.querySelectorAll('.age-btn');
const startQuizBtn = document.getElementById('startQuizBtn');

const currentScoreEl = document.getElementById('currentScore');
const difficultyLevelEl = document.getElementById('difficultyLevel');
const questionNumEl = document.getElementById('questionNum');
const questionTextEl = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const feedbackMessage = document.getElementById('feedbackMessage');
const nextQuestionBtn = document.getElementById('nextQuestionBtn');
const categoryBadgeEl = document.getElementById('categoryBadge');
const streakBadgeEl = document.getElementById('streakBadge');
const streakCountEl = document.getElementById('streakCount');

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
    if (!gameState.ageGroup) {
        alert('Please select your age group!');
        return;
    }

    gameState.sessionId = generateSessionId();

    try {
        // Create user session with "mixed" category
        const response = await fetch(`${API_URL}/user/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: gameState.sessionId,
                ageGroup: gameState.ageGroup,
                category: 'mixed'
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

// Load Next Question - Mix categories
async function loadNextQuestion() {
    // Check if quiz is complete
    if (gameState.questionsAnswered >= gameState.totalQuestions) {
        completeQuiz();
        return;
    }

    // Reset attempt for new question
    gameState.attempt = 1;

    try {
        // Get random category
        const randomCategory = gameState.allCategories[
            Math.floor(Math.random() * gameState.allCategories.length)
        ];

        const response = await fetch(`${API_URL}/question/get`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: gameState.gameSessionId,
                category: randomCategory,
                difficulty: gameState.difficulty
            })
        });

        const data = await response.json();

        if (data.success && data.question) {
            gameState.currentQuestion = data.question;
            gameState.currentQuestion.category = randomCategory;
            displayQuestion();
        } else {
            // Try another category if no questions available
            const otherCategories = gameState.allCategories.filter(c => c !== randomCategory);
            if (otherCategories.length > 0) {
                const fallbackCategory = otherCategories[Math.floor(Math.random() * otherCategories.length)];
                const fallbackResponse = await fetch(`${API_URL}/question/get`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId: gameState.gameSessionId,
                        category: fallbackCategory,
                        difficulty: gameState.difficulty
                    })
                });
                const fallbackData = await fallbackResponse.json();
                if (fallbackData.success && fallbackData.question) {
                    gameState.currentQuestion = fallbackData.question;
                    gameState.currentQuestion.category = fallbackCategory;
                    displayQuestion();
                } else {
                    completeQuiz();
                }
            } else {
                completeQuiz();
            }
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

    // Display category badge
    const categoryNames = {
        maths: '📊 Maths',
        science: '🔬 Science',
        riddles: '🧩 Riddles',
        spelling: '✏️ Spelling',
        india: '🇮🇳 India Quiz'
    };
    categoryBadgeEl.textContent = categoryNames[gameState.currentQuestion.category] || '';

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
                // Correct answer - increment streaks
                gameState.correctStreak++;
                gameState.winningStreak++;

                // Update streak badge
                if (gameState.winningStreak > 0) {
                    streakBadgeEl.style.display = 'block';
                    streakCountEl.textContent = gameState.winningStreak;
                }

                // Check for 5-question winning streak - CONFETTI!
                if (gameState.winningStreak === 5) {
                    triggerConfetti();
                    showStreakNotification('🎉 AMAZING! 5 in a row!');
                } else if (gameState.winningStreak > 5 && gameState.winningStreak % 5 === 0) {
                    triggerConfetti();
                    showStreakNotification(`🔥 ${gameState.winningStreak} STREAK! Unstoppable!`);
                }

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
                // Wrong answer - reset winning streak
                gameState.correctStreak = 0;
                gameState.winningStreak = 0;
                streakBadgeEl.style.display = 'none';

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

// Confetti Animation
function triggerConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 150;
    const colors = ['#7B68EE', '#FF6B9D', '#49CCF9', '#49E9A6', '#FFC800', '#FF9F40'];

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 6 + 4,
            d: Math.random() * particleCount,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.floor(Math.random() * 10) - 10,
            tiltAngleIncremental: Math.random() * 0.07 + 0.05,
            tiltAngle: 0
        });
    }

    let animationFrame;
    let frameCount = 0;
    const maxFrames = 300;

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p, index) => {
            ctx.beginPath();
            ctx.lineWidth = p.r / 2;
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.x + p.tilt + p.r, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
            ctx.stroke();

            p.tiltAngle += p.tiltAngleIncremental;
            p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
            p.x += Math.sin(p.d);
            p.tilt = Math.sin(p.tiltAngle - index / 3) * 15;

            if (p.y > canvas.height) {
                particles[index] = {
                    ...p,
                    x: Math.random() * canvas.width,
                    y: -20
                };
            }
        });

        frameCount++;
        if (frameCount < maxFrames) {
            animationFrame = requestAnimationFrame(draw);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            cancelAnimationFrame(animationFrame);
        }
    }

    draw();
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
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-weight: 700;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
        font-size: 0.9375rem;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Show Streak Notification
function showStreakNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #FF6B6B, #FF9F40);
        color: white;
        padding: 2rem 3rem;
        border-radius: 12px;
        font-weight: 800;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: bounceIn 0.5s ease;
        font-size: 1.75rem;
        text-align: center;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'bounceOut 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 2500);
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
    gameState.currentQuestion = null;
    gameState.currentScore = 0;
    gameState.questionsAnswered = 0;
    gameState.difficulty = 'easy';
    gameState.attempt = 1;
    gameState.correctStreak = 0;
    gameState.winningStreak = 0;

    // Reset UI
    ageButtons.forEach(b => b.classList.remove('selected'));
    startQuizBtn.style.display = 'none';
    currentScoreEl.textContent = '0';
    difficultyLevelEl.textContent = 'Easy';
    streakBadgeEl.style.display = 'none';

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
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    @keyframes bounceIn {
        0% {
            transform: translate(-50%, -50%) scale(0.3);
            opacity: 0;
        }
        50% {
            transform: translate(-50%, -50%) scale(1.05);
        }
        100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
    }

    @keyframes bounceOut {
        0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(0.3);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
