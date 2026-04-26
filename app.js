// ============================================
// STEM Quest — Application Logic
// ============================================

// Persistent device ID for cross-session tracking
function getDeviceId() {
    let deviceId = localStorage.getItem('stemquest_device_id');
    if (!deviceId) {
        deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 12);
        localStorage.setItem('stemquest_device_id', deviceId);
    }
    return deviceId;
}

// ============================================
// Game State
// ============================================

const gameState = {
    sessionId: null,
    deviceId: getDeviceId(),
    userId: null,
    gameSessionId: null,
    ageGroup: null,
    displayName: localStorage.getItem('stemquest_display_name') || '',
    authToken: null,
    selectedCharacter: null,
    currentQuestion: null,
    currentScore: 0,
    questionsAnswered: 0,
    questionsCorrect: 0,
    difficulty: 'easy',
    maxDifficulty: 'easy',
    attempt: 1,
    correctStreak: 0,
    winningStreak: 0,
    bestStreak: 0,
    totalQuestions: Infinity, // endless mode
    lives: 5,              // hearts system
    maxLives: 5,
    allCategories: ['maths', 'science', 'riddles', 'spelling', 'india'],
    currentScreen: 'welcome',
    answered: false,
    autoAdvanceTimer: null,
    questionResults: [], // track correct/wrong for progress bar
    isDifficultyChanging: false, // suppress character pop-in during difficulty change
    recentWrong: 0, // track wrong answers in recent window for difficulty downgrade
    categoriesSeen: new Set(),
    hadComeback: false,
    wasDroppedToEasy: false
};

// ============================================
// DOM Elements
// ============================================

const screens = {
    welcome: document.getElementById('welcomeScreen'),
    name: document.getElementById('nameScreen'),
    age: document.getElementById('ageScreen'),
    character: document.getElementById('characterScreen'),
    quiz: document.getElementById('quizScreen'),
    results: document.getElementById('resultsScreen')
};

const els = {
    // Welcome
    beginBtn: document.getElementById('beginBtn'),
    googleBtnContainer: document.getElementById('googleBtnContainer'),
    trophyBtn: document.getElementById('trophyBtn'),

    // Name
    playerNameInput: document.getElementById('playerNameInput'),
    nameNextBtn: document.getElementById('nameNextBtn'),

    // Leaderboard modal
    leaderboardModal: document.getElementById('leaderboardModal'),
    leaderboardList: document.getElementById('leaderboardList'),
    closeLeaderboardBtn: document.getElementById('closeLeaderboardBtn'),
    resultsLeaderboardList: document.getElementById('resultsLeaderboardList'),
    leaderboardSection: document.getElementById('leaderboardSection'),

    // Badges
    badgesSection: document.getElementById('badgesSection'),
    badgesList: document.getElementById('badgesList'),

    // Share
    shareScoreBtn: document.getElementById('shareScoreBtn'),

    // Age
    ageCards: document.querySelectorAll('.age-card'),

    // Character
    characterGrid: document.getElementById('characterGrid'),
    startWithCharacterBtn: document.getElementById('startWithCharacterBtn'),

    // Quiz
    progressSegments: document.getElementById('progressSegments'),
    progressLabel: document.getElementById('progressLabel'), // may be null in new layout
    currentScore: document.getElementById('currentScore'),
    streakBadge: document.getElementById('streakBadge'),
    streakCount: document.getElementById('streakCount'),
    difficultyBadge: document.getElementById('difficultyBadge'),
    categoryBadge: document.getElementById('categoryBadge'),
    characterPanel: document.getElementById('characterPanel'),
    quizCharacterAvatar: document.getElementById('quizCharacterAvatar'),
    speechBubble: document.getElementById('speechBubble'),
    speechText: document.getElementById('speechText'),
    quizCard: document.getElementById('quizCard'),
    questionContainer: document.getElementById('questionContainer'),
    questionText: document.getElementById('questionText'),
    optionsContainer: document.getElementById('optionsContainer'),
    feedbackMessage: document.getElementById('feedbackMessage'),
    nextQuestionBtn: document.getElementById('nextQuestionBtn'),

    // Results
    resultsCharacter: document.getElementById('resultsCharacter'),
    resultsSpeechBubble: document.getElementById('resultsSpeechBubble'),
    resultsSpeechText: document.getElementById('resultsSpeechText'),
    scoreRingCircle: document.getElementById('scoreRingCircle'),
    finalScoreNum: document.getElementById('finalScoreNum'),
    statCorrect: document.getElementById('statCorrect'),
    statDifficulty: document.getElementById('statDifficulty'),
    statStreak: document.getElementById('statStreak'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    changeCharacterBtn: document.getElementById('changeCharacterBtn'),

    // Sound
    soundToggle: document.getElementById('soundToggle'),

    // Notification
    notificationContainer: document.getElementById('notificationContainer')
};

// API Base URL
const API_URL = window.location.origin + '/api';

// ============================================
// Screen Transitions
// ============================================

function switchScreen(targetName) {
    const current = screens[gameState.currentScreen];
    const target = screens[targetName];

    if (current === target) return;

    // Simply hide current, show target
    current.classList.remove('active');
    target.classList.add('active');
    gameState.currentScreen = targetName;
}

// ============================================
// Sound System
// ============================================

els.soundToggle.addEventListener('click', () => {
    SoundSystem.init();
    const enabled = SoundSystem.toggle();
    els.soundToggle.querySelector('.sound-on').style.display = enabled ? '' : 'none';
    els.soundToggle.querySelector('.sound-off').style.display = enabled ? 'none' : '';
});

// Initialize sound on first interaction
document.addEventListener('click', function initSound() {
    SoundSystem.init();
    SoundSystem.welcome();
    document.removeEventListener('click', initSound);
}, { once: true });

// Restore sound icon state
if (localStorage.getItem('stemquest_sound') === 'false') {
    els.soundToggle.querySelector('.sound-on').style.display = 'none';
    els.soundToggle.querySelector('.sound-off').style.display = '';
}

// ============================================
// Welcome Screen
// ============================================

els.beginBtn.addEventListener('click', () => {
    SoundSystem.click();
    switchScreen('name');
});


// ============================================
// Name Input Screen
// ============================================

// Pre-fill name from localStorage
if (gameState.displayName) {
    els.playerNameInput.value = gameState.displayName;
    els.nameNextBtn.disabled = gameState.displayName.trim().length < 2;
}

els.playerNameInput.addEventListener('input', () => {
    const val = els.playerNameInput.value.trim();
    els.nameNextBtn.disabled = val.length < 2;
});

els.nameNextBtn.addEventListener('click', () => {
    const name = els.playerNameInput.value.trim();
    if (name.length < 2) return;
    SoundSystem.click();
    gameState.displayName = name;
    localStorage.setItem('stemquest_display_name', name);
    switchScreen('age');
});

// ============================================
// Trophy / Leaderboard Modal
// ============================================

els.trophyBtn.addEventListener('click', () => {
    SoundSystem.click();
    fetchLeaderboard(els.leaderboardList);
    els.leaderboardModal.style.display = 'flex';
});

els.closeLeaderboardBtn.addEventListener('click', () => {
    els.leaderboardModal.style.display = 'none';
});

els.leaderboardModal.addEventListener('click', (e) => {
    if (e.target === els.leaderboardModal) {
        els.leaderboardModal.style.display = 'none';
    }
});

async function fetchLeaderboard(container) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-tertiary);padding:24px;">Loading...</p>';
    try {
        const headers = { 'Content-Type': 'application/json' };
        if (gameState.authToken) {
            headers['Authorization'] = 'Bearer ' + gameState.authToken;
        }
        const response = await fetch(API_URL + '/leaderboard', { headers });
        const data = await response.json();

        if (data.success && data.leaderboard && data.leaderboard.length > 0) {
            const rankIcons = ['\uD83E\uDD47', '\uD83E\uDD48', '\uD83E\uDD49'];
            container.innerHTML = data.leaderboard.map((entry, i) => {
                const rank = i < 3 ? rankIcons[i] : (i + 1);
                const isMe = entry.display_name === gameState.displayName;
                return `<div class="leaderboard-row${isMe ? ' highlight' : ''}${i < 3 ? ' top-' + (i + 1) : ''}">
                    <span class="lb-rank">${rank}</span>
                    <span class="lb-name">${escapeHtml(entry.display_name || 'Player')}</span>
                    <span class="lb-score">${entry.score} pts</span>
                    <span class="lb-age">${entry.age_group || ''}</span>
                </div>`;
            }).join('');
        } else {
            container.innerHTML = '<p style="text-align:center;color:var(--text-tertiary);padding:24px;">No scores yet. Be the first!</p>';
        }
    } catch (e) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-tertiary);padding:24px;">Could not load leaderboard</p>';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// Share Score
// ============================================

els.shareScoreBtn.addEventListener('click', async () => {
    const text = `I scored ${gameState.currentScore} points on STEM Quest! My best streak was ${gameState.bestStreak} and I reached ${gameState.maxDifficulty} difficulty. Can you beat me?`;

    if (navigator.share) {
        try {
            await navigator.share({ title: 'STEM Quest Score', text });
        } catch (e) {
            // User cancelled or share failed
        }
    } else {
        // Clipboard fallback
        try {
            await navigator.clipboard.writeText(text);
            showNotification('Score copied to clipboard!', 'difficulty');
        } catch (e) {
            showNotification('Could not copy score', 'difficulty');
        }
    }
});

// ============================================
// Google SSO
// ============================================

async function initGoogleSSO() {
    try {
        const response = await fetch(API_URL + '/config');
        const config = await response.json();

        if (config.googleClientId && typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.initialize({
                client_id: config.googleClientId,
                callback: handleGoogleSignIn
            });
            google.accounts.id.renderButton(els.googleBtnContainer, {
                theme: 'outline',
                size: 'large',
                width: 280,
                text: 'signin_with'
            });
        } else {
            // Google SSO not configured — show begin button as fallback
            els.beginBtn.style.display = '';
        }
    } catch (e) {
        // Google SSO not available — show begin button as fallback
        els.beginBtn.style.display = '';
    }
}

async function handleGoogleSignIn(response) {
    try {
        const res = await fetch(API_URL + '/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: response.credential })
        });
        const data = await res.json();

        if (data.success) {
            gameState.authToken = data.authToken;
            gameState.userId = data.userId;
            gameState.displayName = data.displayName || '';
            if (data.displayName) {
                localStorage.setItem('stemquest_display_name', data.displayName);
                els.playerNameInput.value = data.displayName;
                els.nameNextBtn.disabled = data.displayName.trim().length < 2;
            }
            switchScreen('name');
        }
    } catch (e) {
        console.error('Google sign-in error:', e);
        switchScreen('name');
    }
}

// Init Google SSO on page load
setTimeout(initGoogleSSO, 500);

// ============================================
// Age Selection
// ============================================

els.ageCards.forEach(card => {
    card.addEventListener('click', () => {
        SoundSystem.click();
        els.ageCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        gameState.ageGroup = card.dataset.age;

        // Auto-advance to character screen after brief delay
        setTimeout(() => switchScreen('character'), 300);
    });
});

// ============================================
// Character Selection
// ============================================

function initCharacterGrid() {
    const grid = els.characterGrid;
    grid.innerHTML = '';

    Object.values(CHARACTERS).forEach(char => {
        const card = document.createElement('button');
        card.className = 'character-card stagger-child';
        card.dataset.character = char.id;

        card.innerHTML = `
            <div class="char-avatar">${getCharacterSVG(char.id, 'happy')}</div>
            <span class="char-name">${char.name}</span>
            <span class="char-tagline">${char.tagline}</span>
        `;

        card.addEventListener('click', () => {
            SoundSystem.click();
            grid.querySelectorAll('.character-card').forEach(c => {
                c.classList.remove('selected');
                c.style.borderColor = '';
            });
            card.classList.add('selected');
            card.style.borderColor = char.color;
            card.style.boxShadow = `0 0 0 1px ${char.color}`;
            grid.classList.add('has-selection');
            gameState.selectedCharacter = char.id;
            els.startWithCharacterBtn.disabled = false;
        });

        grid.appendChild(card);
    });
}

initCharacterGrid();

els.startWithCharacterBtn.addEventListener('click', () => {
    SoundSystem.click();
    startQuiz();
});

// ============================================
// Quiz Flow
// ============================================

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

async function startQuiz() {
    if (!gameState.ageGroup || !gameState.selectedCharacter) return;

    gameState.sessionId = generateSessionId();
    gameState.currentScore = 0;
    gameState.questionsAnswered = 0;
    gameState.questionsCorrect = 0;
    gameState.difficulty = 'easy';
    gameState.maxDifficulty = 'easy';
    gameState.attempt = 1;
    gameState.correctStreak = 0;
    gameState.winningStreak = 0;
    gameState.bestStreak = 0;
    gameState.answered = false;
    gameState.questionResults = [];
    gameState.categoriesSeen = new Set();
    gameState.hadComeback = false;
    gameState.wasDroppedToEasy = false;

    try {
        const headers = { 'Content-Type': 'application/json' };
        if (gameState.authToken) {
            headers['Authorization'] = 'Bearer ' + gameState.authToken;
        }
        const response = await fetch(`${API_URL}/user/create`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                sessionId: gameState.sessionId,
                ageGroup: gameState.ageGroup,
                category: 'mixed',
                displayName: gameState.displayName
            })
        });

        const data = await response.json();

        if (data.success) {
            gameState.userId = data.userId;
            gameState.gameSessionId = data.gameSessionId;

            // Setup quiz UI
            setupQuizUI();
            switchScreen('quiz');

            // Show character greeting
            setTimeout(() => {
                setCharacterExpression('happy');
                showCharacterSpeech('greeting', 5000);
            }, 400);

            loadNextQuestion();
        }
    } catch (error) {
        console.error('Error starting quiz:', error);
    }
}

function setupQuizUI() {
    // Build hearts display instead of progress segments
    els.progressSegments.innerHTML = '';
    updateHeartsDisplay();

    // Reset UI
    els.currentScore.textContent = '0';
    els.difficultyBadge.textContent = 'Easy';
    els.streakBadge.style.display = 'none';
    els.nextQuestionBtn.style.display = 'none';

    // Prep character avatar (panel hidden by default)
    updateCharacterAvatar('happy');
    els.characterPanel.classList.remove('pop-in');
}

function updateHeartsDisplay() {
    els.progressSegments.innerHTML = '';
    for (let i = 0; i < gameState.maxLives; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart-icon' + (i < gameState.lives ? ' alive' : ' lost');
        heart.innerHTML = `<svg width="22" height="20" viewBox="0 0 22 20" fill="${i < gameState.lives ? '#FF4B4B' : '#3A3A4A'}"><path d="M11 18.5l-1.4-1.3C3.7 11.7 0 8.4 0 4.5 0 1.4 2.4-1 5.5-1c1.7 0 3.4.8 4.5 2.1C11.1-.2 12.8-1 14.5-1 17.6-1 20 1.4 20 4.5c0 3.9-3.7 7.2-9.6 12.7L11 18.5z" transform="translate(1 1)"/></svg>`;
        if (i >= gameState.lives) {
            heart.style.opacity = '0.3';
        }
        const livesLeft = gameState.lives;
        heart.title = livesLeft <= 1
            ? '❗ Last heart — take your time!'
            : `Hearts: ${livesLeft} left — miss a question twice and you'll lose one!`;
        els.progressSegments.appendChild(heart);
    }
    // Update progress label if it exists
    if (els.progressLabel) els.progressLabel.textContent = `${gameState.questionsAnswered} answered`;
}

// ============================================
// Character System
// ============================================

function updateCharacterAvatar(expression) {
    if (!gameState.selectedCharacter) return;
    els.quizCharacterAvatar.innerHTML = getCharacterSVG(gameState.selectedCharacter, expression);
}

function setCharacterExpression(expression) {
    updateCharacterAvatar(expression);
}

let speechTimeout = null;
let panelTimeout = null;

function showCharacterPopIn(type, duration = 3000) {
    if (!gameState.selectedCharacter) return;
    // Don't show character pop-in during difficulty transitions to avoid animation collision
    if (gameState.isDifficultyChanging) return;

    const msg = getCharacterMessage(gameState.selectedCharacter, type);
    if (!msg) return;

    clearTimeout(speechTimeout);
    clearTimeout(panelTimeout);

    // Update avatar and speech
    const char = CHARACTERS[gameState.selectedCharacter];
    if (char) {
        document.getElementById('characterGuideBadge').textContent = char.name;
    }
    els.speechText.textContent = msg;

    // Set accent border color
    els.characterPanel.style.borderLeftColor = char.color;
    els.characterPanel.style.borderLeftWidth = '4px';

    // Pop in the whole panel
    els.characterPanel.classList.add('pop-in');

    // Bounce the avatar
    els.quizCharacterAvatar.classList.remove('bounce');
    void els.quizCharacterAvatar.offsetHeight;
    els.quizCharacterAvatar.classList.add('bounce');

    // Auto-hide after duration
    panelTimeout = setTimeout(() => {
        els.characterPanel.classList.remove('pop-in');
    }, duration);
}

// Keep backward compat — these now delegate to popIn
function showCharacterSpeech(type, duration = 3000) {
    showCharacterPopIn(type, duration);
}

function showCharacterHint(category) {
    const hintEl = document.getElementById('characterHint');
    if (!hintEl || !gameState.selectedCharacter) return;

    const char = CHARACTERS[gameState.selectedCharacter];
    if (char && char.categoryHints && char.categoryHints[category]) {
        hintEl.textContent = char.categoryHints[category];
    } else {
        hintEl.textContent = '';
    }
}

// ============================================
// Question Loading
// ============================================

const categoryNames = {
    maths: 'Maths',
    science: 'Science',
    riddles: 'Riddles',
    spelling: 'Spelling',
    india: 'India'
};

async function fetchQuestion(category, difficulty) {
    const response = await fetch(`${API_URL}/question/get`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sessionId: gameState.gameSessionId,
            category: category,
            difficulty: difficulty,
            deviceId: gameState.deviceId,
            userId: gameState.userId
        })
    });
    return response.json();
}

async function fetchGeneratedQuestion(category, difficulty) {
    if (!navigator.onLine) return null;
    try {
        const response = await fetch(`${API_URL}/question/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                category: category,
                difficulty: difficulty,
                deviceId: gameState.deviceId
            })
        });
        const data = await response.json();
        return (data.success && data.question) ? data : null;
    } catch (e) {
        return null;
    }
}

async function loadNextQuestion() {
    // Clear auto-advance timer
    clearTimeout(gameState.autoAdvanceTimer);

    if (gameState.lives <= 0) {
        completeQuiz();
        return;
    }

    gameState.attempt = 1;
    gameState.answered = false;
    els.nextQuestionBtn.style.display = 'none';

    // Update progress
    updateProgress();

    try {
        const shuffled = [...gameState.allCategories].sort(() => Math.random() - 0.5);

        for (const category of shuffled) {
            const data = await fetchQuestion(category, gameState.difficulty);

            if (data.success && data.question) {
                gameState.currentQuestion = data.question;
                gameState.currentQuestion.category = category;
                displayQuestion();
                return;
            }

            if (data.exhausted) {
                const generated = await fetchGeneratedQuestion(category, gameState.difficulty);
                if (generated) {
                    gameState.currentQuestion = generated.question;
                    gameState.currentQuestion.category = category;
                    displayQuestion();
                    return;
                }
            }
        }

        // Try other difficulties
        const otherDiffs = ['easy', 'medium', 'hard'].filter(d => d !== gameState.difficulty);
        for (const diff of otherDiffs) {
            for (const category of shuffled) {
                const data = await fetchQuestion(category, diff);
                if (data.success && data.question) {
                    gameState.currentQuestion = data.question;
                    gameState.currentQuestion.category = category;
                    displayQuestion();
                    return;
                }
            }
        }

        completeQuiz();
    } catch (error) {
        console.error('Error loading question:', error);
    }
}

function displayQuestion() {
    // Update category badge
    const cat = gameState.currentQuestion.category;
    els.categoryBadge.textContent = categoryNames[cat] || cat;

    // Track category for badges
    gameState.categoriesSeen.add(cat);

    // Slide transition for question text
    const container = els.questionContainer;
    container.classList.add('slide-out');

    setTimeout(() => {
        // Update question text
        els.questionText.textContent = gameState.currentQuestion.question;

        container.classList.remove('slide-out');
        container.classList.add('slide-in');

        setTimeout(() => container.classList.remove('slide-in'), 500);
    }, 200);

    // Clear hint
    document.getElementById('characterHint').textContent = '';

    // Clear and build options
    els.optionsContainer.innerHTML = '';
    els.feedbackMessage.style.display = 'none';
    els.feedbackMessage.className = 'feedback-message';

    const letters = ['A', 'B', 'C', 'D'];

    gameState.currentQuestion.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.dataset.index = index;

        btn.innerHTML = `
            <span class="option-letter">${letters[index]}</span>
            <span class="option-text">${option}</span>
            <span class="option-shortcut">${index + 1}</span>
        `;

        btn.addEventListener('click', () => handleAnswer(index));
        els.optionsContainer.appendChild(btn);
    });

    // Update progress label
    if (els.progressLabel) els.progressLabel.textContent = `${gameState.questionsAnswered + 1} answered`;
}

// ============================================
// Progress Bar
// ============================================

function updateProgress() {
    updateHeartsDisplay();
}

// ============================================
// Answer Handling
// ============================================

async function handleAnswer(selectedIndex) {
    if (gameState.answered && gameState.attempt !== 2) return;

    const correctIndex = gameState.currentQuestion.correct;
    const isCorrect = selectedIndex === correctIndex;

    const optionButtons = document.querySelectorAll('.option-btn');

    // Disable all buttons
    optionButtons.forEach(btn => btn.classList.add('disabled'));

    // Highlight selected
    optionButtons[selectedIndex].classList.add(isCorrect ? 'correct' : 'incorrect');

    // Play sound
    if (isCorrect) {
        SoundSystem.correct();
    } else {
        SoundSystem.wrong();
    }

    try {
        const response = await fetch(`${API_URL}/answer/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: gameState.gameSessionId,
                questionId: gameState.currentQuestion.id,
                selectedOption: selectedIndex,
                correctOption: correctIndex,
                attempt: gameState.attempt,
                deviceId: gameState.deviceId,
                userId: gameState.userId,
                category: gameState.currentQuestion.category,
                difficulty: gameState.difficulty
            })
        });

        const data = await response.json();

        if (data.success) {
            gameState.currentScore = data.totalScore;
            animateScore(data.totalScore);

            if (isCorrect) {
                gameState.answered = true;
                gameState.correctStreak++;
                gameState.winningStreak++;
                gameState.questionsCorrect++;
                gameState.recentWrong = Math.max(0, gameState.recentWrong - 1); // reduce wrong counter on correct

                if (gameState.winningStreak > gameState.bestStreak) {
                    gameState.bestStreak = gameState.winningStreak;
                }

                // Update streak badge
                if (gameState.winningStreak > 1) {
                    els.streakBadge.style.display = '';
                    els.streakCount.textContent = gameState.winningStreak;
                }

                // Streak milestones
                if (gameState.winningStreak === 5 || (gameState.winningStreak > 5 && gameState.winningStreak % 5 === 0)) {
                    // Big milestone: confetti + center notification only (no toast — avoid collision)
                    SoundSystem.streak();
                    triggerConfetti();
                    showNotification(
                        gameState.winningStreak === 5
                            ? 'AMAZING! 5 in a row!'
                            : `${gameState.winningStreak} STREAK! Unstoppable!`,
                        'streak'
                    );
                } else if (gameState.winningStreak === 3) {
                    // Small milestone: character toast only
                    setCharacterExpression('excited');
                    showCharacterPopIn('streak3', 2500);
                }

                gameState.questionsAnswered++;
                gameState.questionResults.push(true);
                updateProgress();

                // Feedback
                els.feedbackMessage.className = 'feedback-message success';
                els.feedbackMessage.textContent = gameState.attempt === 1
                    ? `Excellent! +${data.pointsEarned} points`
                    : `Correct! +${data.pointsEarned} point`;
                els.feedbackMessage.style.display = 'block';

                // Difficulty increase
                if (gameState.correctStreak >= 3) {
                    increaseDifficulty();
                    gameState.correctStreak = 0;
                }

                // Check badge unlocks after each answer
                const newBadgesOnAnswer = checkBadgeUnlocks(gameState);
                newBadgesOnAnswer.forEach(badge => {
                    showNotification(`${badge.icon} ${badge.name} unlocked!`, 'difficulty');
                });

                // Auto-advance after 1.5s
                els.nextQuestionBtn.style.display = 'flex';
                gameState.autoAdvanceTimer = setTimeout(() => {
                    loadNextQuestion();
                }, 1500);

            } else {
                // Wrong answer
                gameState.correctStreak = 0;
                gameState.winningStreak = 0;
                els.streakBadge.style.display = 'none';

                if (gameState.attempt === 1) {
                    gameState.attempt = 2;

                    setCharacterExpression('thinking');
                    showCharacterPopIn('retry', 2500);

                    els.feedbackMessage.className = 'feedback-message retry';
                    els.feedbackMessage.textContent = 'Not quite! Try again';
                    els.feedbackMessage.style.display = 'block';

                    // Re-enable remaining buttons
                    optionButtons.forEach(btn => {
                        if (btn.dataset.index !== selectedIndex.toString()) {
                            btn.classList.remove('disabled');
                        }
                    });
                } else {
                    // Second attempt wrong — lose a life
                    gameState.answered = true;
                    gameState.questionsAnswered++;
                    gameState.questionResults.push(false);
                    gameState.lives--;
                    gameState.recentWrong++;

                    // Animate the lost heart
                    updateProgress();

                    optionButtons[correctIndex].classList.add('correct');

                    setCharacterExpression('sad');
                    showCharacterPopIn('encouragement', 3000);

                    els.feedbackMessage.className = 'feedback-message error';
                    if (gameState.lives <= 0) {
                        els.feedbackMessage.textContent = `The answer was: ${gameState.currentQuestion.options[correctIndex]}. No lives left!`;
                    } else {
                        els.feedbackMessage.textContent = `The answer was: ${gameState.currentQuestion.options[correctIndex]}`;
                    }
                    els.feedbackMessage.style.display = 'block';

                    // Check for difficulty downgrade (3 wrong in last 5)
                    if (gameState.recentWrong >= 3) {
                        decreaseDifficulty();
                        gameState.recentWrong = 0;
                    }

                    els.nextQuestionBtn.style.display = 'flex';

                    // Reset expression after panel hides
                    setTimeout(() => setCharacterExpression('neutral'), 3200);
                }
            }
        }
    } catch (error) {
        console.error('Error submitting answer:', error);
    }
}

// ============================================
// Score Animation
// ============================================

function animateScore(target) {
    const el = els.currentScore;
    const current = parseInt(el.textContent) || 0;
    if (current === target) return;

    const start = performance.now();
    const duration = 300;

    function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(current + (target - current) * eased);
        if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
}

// ============================================
// Difficulty
// ============================================

async function increaseDifficulty() {
    let newDifficulty = gameState.difficulty;

    if (gameState.difficulty === 'easy') {
        newDifficulty = 'medium';
    } else if (gameState.difficulty === 'medium') {
        newDifficulty = 'hard';
    }

    if (newDifficulty !== gameState.difficulty) {
        gameState.isDifficultyChanging = true;
        gameState.difficulty = newDifficulty;

        // Track max difficulty
        const levels = { easy: 0, medium: 1, hard: 2 };
        if (levels[newDifficulty] > levels[gameState.maxDifficulty]) {
            gameState.maxDifficulty = newDifficulty;
        }

        // Track comeback badge
        if (newDifficulty === 'medium' && gameState.wasDroppedToEasy) {
            gameState.hadComeback = true;
        }

        els.difficultyBadge.textContent = newDifficulty.charAt(0).toUpperCase() + newDifficulty.slice(1);

        SoundSystem.levelUp();
        showNotification(`Level up! ${els.difficultyBadge.textContent} mode`, 'difficulty');

        // Clear flag after notification animation completes
        setTimeout(() => { gameState.isDifficultyChanging = false; }, 2700);

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

async function decreaseDifficulty() {
    let newDifficulty = gameState.difficulty;

    if (gameState.difficulty === 'hard') {
        newDifficulty = 'medium';
    } else if (gameState.difficulty === 'medium') {
        newDifficulty = 'easy';
    }

    if (newDifficulty !== gameState.difficulty) {
        gameState.isDifficultyChanging = true;
        gameState.difficulty = newDifficulty;

        // Track if dropped to easy for comeback badge
        if (newDifficulty === 'easy') {
            gameState.wasDroppedToEasy = true;
        }

        els.difficultyBadge.textContent = newDifficulty.charAt(0).toUpperCase() + newDifficulty.slice(1);
        showNotification(`Easing up: ${els.difficultyBadge.textContent} mode`, 'difficulty');

        setTimeout(() => { gameState.isDifficultyChanging = false; }, 2700);

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

// ============================================
// Notifications
// ============================================

function showNotification(message, type = 'difficulty') {
    const el = document.createElement('div');
    el.className = `notification ${type}`;
    el.textContent = message;

    if (type === 'streak') {
        document.body.appendChild(el);
    } else {
        els.notificationContainer.appendChild(el);
    }

    setTimeout(() => {
        el.classList.add('exit');
        setTimeout(() => el.remove(), 200);
    }, 2500);
}

// ============================================
// Confetti
// ============================================

function triggerConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const char = CHARACTERS[gameState.selectedCharacter];
    const charColor = char ? char.color : '#6C5CE7';

    const particles = [];
    const particleCount = 120;
    const colors = ['#58CC02', '#1CB0F6', '#FF4B4B', '#FFC800', '#CE82FF', '#FF9600'];

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 5 + 3,
            d: Math.random() * particleCount,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.floor(Math.random() * 10) - 10,
            tiltAngleIncremental: Math.random() * 0.07 + 0.05,
            tiltAngle: 0
        });
    }

    let frameCount = 0;
    const maxFrames = 240;

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
                particles[index] = { ...p, x: Math.random() * canvas.width, y: -20 };
            }
        });

        frameCount++;
        if (frameCount < maxFrames) {
            requestAnimationFrame(draw);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    draw();
}

// ============================================
// Complete Quiz
// ============================================

async function completeQuiz() {
    try {
        const headers = { 'Content-Type': 'application/json' };
        if (gameState.authToken) {
            headers['Authorization'] = 'Bearer ' + gameState.authToken;
        }
        await fetch(`${API_URL}/session/complete`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                sessionId: gameState.gameSessionId,
                displayName: gameState.displayName,
                score: gameState.currentScore,
                ageGroup: gameState.ageGroup,
                questionsAnswered: gameState.questionsAnswered,
                maxDifficulty: gameState.maxDifficulty
            })
        });
    } catch (error) {
        console.error('Error completing session:', error);
    }

    SoundSystem.complete();

    // Check for badge unlocks
    const newBadges = checkBadgeUnlocks(gameState);
    newBadges.forEach(badge => {
        showNotification(`${badge.icon} ${badge.name} unlocked!`, 'difficulty');
    });

    // Setup results screen
    setupResultsScreen();
    switchScreen('results');
}

function setupResultsScreen() {
    // Character celebration
    if (gameState.selectedCharacter) {
        els.resultsCharacter.innerHTML = getCharacterSVG(gameState.selectedCharacter, 'excited');
        els.resultsSpeechText.textContent = getCharacterMessage(gameState.selectedCharacter, 'complete');
        els.resultsSpeechBubble.classList.add('visible');
    }

    // Animate score ring — base max on questions answered
    const maxScore = Math.max(gameState.questionsAnswered * 2, 1);
    const percentage = Math.min(gameState.currentScore / maxScore, 1);
    const circumference = 2 * Math.PI * 52; // r=52
    const offset = circumference * (1 - percentage);

    setTimeout(() => {
        els.scoreRingCircle.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)';
        els.scoreRingCircle.style.strokeDashoffset = offset;
    }, 300);

    // Animate score number
    animateNumber(els.finalScoreNum, 0, gameState.currentScore, 1500, 300);

    // Stats
    els.statCorrect.textContent = `${gameState.questionsCorrect}/${gameState.questionsAnswered}`;
    els.statDifficulty.textContent = gameState.maxDifficulty.charAt(0).toUpperCase() + gameState.maxDifficulty.slice(1);
    els.statStreak.textContent = gameState.bestStreak;

    // Show leaderboard in results
    fetchLeaderboard(els.resultsLeaderboardList);

    // Show badges
    const earned = getAllEarnedBadges();
    if (earned.length > 0) {
        els.badgesSection.style.display = '';
        els.badgesList.innerHTML = earned.map(b =>
            `<div class="badge-card">
                <span class="badge-icon">${b.icon}</span>
                <span class="badge-name">${b.name}</span>
            </div>`
        ).join('');
    } else {
        els.badgesSection.style.display = 'none';
    }
}

function animateNumber(el, from, to, duration, delay = 0) {
    setTimeout(() => {
        const start = performance.now();
        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(from + (to - from) * eased);
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }, delay);
}

// ============================================
// Reset / Play Again
// ============================================

els.playAgainBtn.addEventListener('click', () => {
    SoundSystem.click();
    resetQuizState();

    // Reset score ring
    els.scoreRingCircle.style.transition = 'none';
    els.scoreRingCircle.style.strokeDashoffset = 327;

    startQuiz();
});

els.changeCharacterBtn.addEventListener('click', () => {
    SoundSystem.click();
    resetQuizState();

    // Reset score ring
    els.scoreRingCircle.style.transition = 'none';
    els.scoreRingCircle.style.strokeDashoffset = 327;

    // Reset character selection
    gameState.selectedCharacter = null;
    els.startWithCharacterBtn.disabled = true;
    els.characterGrid.querySelectorAll('.character-card').forEach(c => {
        c.classList.remove('selected');
        c.style.borderColor = '';
        c.style.boxShadow = '';
    });
    els.characterGrid.classList.remove('has-selection');

    switchScreen('character');
});

function resetQuizState() {
    clearTimeout(gameState.autoAdvanceTimer);
    gameState.sessionId = null;
    gameState.userId = null;
    gameState.gameSessionId = null;
    gameState.currentQuestion = null;
    gameState.currentScore = 0;
    gameState.questionsAnswered = 0;
    gameState.questionsCorrect = 0;
    gameState.difficulty = 'easy';
    gameState.maxDifficulty = 'easy';
    gameState.attempt = 1;
    gameState.correctStreak = 0;
    gameState.winningStreak = 0;
    gameState.bestStreak = 0;
    gameState.answered = false;
    gameState.questionResults = [];
    gameState.lives = gameState.maxLives;
    gameState.isDifficultyChanging = false;
    gameState.recentWrong = 0;
    gameState.categoriesSeen = new Set();
    gameState.hadComeback = false;
    gameState.wasDroppedToEasy = false;
}

// ============================================
// Keyboard Shortcuts
// ============================================

document.addEventListener('keydown', (e) => {
    // Only in quiz screen
    if (gameState.currentScreen !== 'quiz') return;

    const keyMap = { '1': 0, '2': 1, '3': 2, '4': 3, 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
    const key = e.key.toLowerCase();

    if (keyMap[key] !== undefined) {
        const optionButtons = document.querySelectorAll('.option-btn');
        const btn = optionButtons[keyMap[key]];

        if (btn && !btn.classList.contains('disabled') && !btn.classList.contains('correct') && !btn.classList.contains('incorrect')) {
            e.preventDefault();
            handleAnswer(keyMap[key]);
        }
    }

    if ((e.key === 'Enter' || e.key === ' ') && gameState.answered) {
        e.preventDefault();
        clearTimeout(gameState.autoAdvanceTimer);
        loadNextQuestion();
    }
});

// ============================================
// Next Question Button
// ============================================

els.nextQuestionBtn.addEventListener('click', () => {
    clearTimeout(gameState.autoAdvanceTimer);
    SoundSystem.click();
    loadNextQuestion();
});
