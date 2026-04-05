// ============================================
// STEM Quest — Badges / Achievements System
// ============================================

const BADGES = [
    {
        id: 'first_steps',
        name: 'First Steps',
        icon: '\u2B50',
        description: 'Complete your first quiz',
        check: (gs) => gs.questionsAnswered > 0
    },
    {
        id: 'streak_master',
        name: 'Streak Master',
        icon: '\uD83D\uDD25',
        description: 'Get a 10-question streak',
        check: (gs) => gs.bestStreak >= 10
    },
    {
        id: 'brain_power',
        name: 'Brain Power',
        icon: '\uD83E\uDDE0',
        description: 'Reach Hard difficulty',
        check: (gs) => gs.maxDifficulty === 'hard'
    },
    {
        id: 'century_club',
        name: 'Century Club',
        icon: '\uD83D\uDCAF',
        description: 'Score 100+ points',
        check: (gs) => gs.currentScore >= 100
    },
    {
        id: 'explorer',
        name: 'Explorer',
        icon: '\uD83C\uDF0D',
        description: 'Answer questions from all 5 categories',
        check: (gs) => {
            if (!gs.categoriesSeen) return false;
            return gs.categoriesSeen.size >= 5;
        }
    },
    {
        id: 'perfect_start',
        name: 'Perfect Start',
        icon: '\uD83C\uDFAF',
        description: 'Get the first 5 questions correct',
        check: (gs) => {
            if (!gs.questionResults || gs.questionResults.length < 5) return false;
            return gs.questionResults.slice(0, 5).every(r => r === true);
        }
    },
    {
        id: 'comeback_kid',
        name: 'Comeback Kid',
        icon: '\uD83D\uDCAA',
        description: 'Reach Medium after being dropped to Easy',
        check: (gs) => gs.hadComeback === true
    }
];

function getBadges() {
    try {
        const stored = localStorage.getItem('stemquest_badges');
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
}

function saveBadge(id) {
    const badges = getBadges();
    if (!badges.includes(id)) {
        badges.push(id);
        localStorage.setItem('stemquest_badges', JSON.stringify(badges));
    }
}

function checkBadgeUnlocks(gameState) {
    const existing = getBadges();
    const newlyUnlocked = [];

    for (const badge of BADGES) {
        if (existing.includes(badge.id)) continue;
        try {
            if (badge.check(gameState)) {
                saveBadge(badge.id);
                newlyUnlocked.push(badge);
            }
        } catch (e) {
            // Skip badge check errors
        }
    }

    return newlyUnlocked;
}

function getAllEarnedBadges() {
    const earned = getBadges();
    return BADGES.filter(b => earned.includes(b.id));
}
