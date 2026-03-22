# 🎮 STEM Quest - Features Overview

## Core Features Implemented ✅

### 1. Age-Based Question Selection
- **5-7 years**: Simpler questions, basic concepts
- **8-10 years**: Intermediate difficulty
- **11-13 years**: More challenging content
- Questions are tailored to cognitive level

### 2. Five Question Categories

#### 📊 Mathematics
- Arithmetic (addition, subtraction, multiplication, division)
- Geometry (shapes, perimeters, areas)
- Problem solving
- Algebra basics (for older kids)

#### 🔬 Science
- Nature and animals
- Human body
- Physics basics
- Famous scientists
- Space and planets

#### 🧩 Riddles
- Logic puzzles
- Word play
- Critical thinking
- Pattern recognition

#### ✏️ Spelling
- Common words
- Vocabulary building
- Age-appropriate difficulty
- English language skills

#### 🇮🇳 India Quiz
- Indian geography
- History and independence
- Festivals and culture
- National symbols
- General knowledge about India

### 3. Smart Scoring System

```
First Attempt Correct  → 2 Points ⭐⭐
Second Attempt Correct → 1 Point  ⭐
Both Attempts Wrong    → 0 Points (shows correct answer)
```

- Real-time score updates after each question
- Score persists in database
- Visual feedback with colors and animations

### 4. No Question Repetition

- Each question appears only ONCE per session
- Tracks asked questions in database
- Randomly selects from available questions
- Ensures fresh content throughout the game

### 5. Dynamic Difficulty Progression

**Automatic Difficulty Increase:**
- Answer 3 questions correctly → Move to Medium
- Answer 3 more correctly → Move to Hard
- Visual notification when difficulty changes
- Difficulty badge shows current level

**Difficulty Levels:**
- 🟢 Easy: Foundational concepts
- 🟡 Medium: Intermediate challenges
- 🔴 Hard: Advanced questions

### 6. Second Chance Mechanism

**On Wrong Answer:**
1. First attempt fails → "Try again!" message
2. Wrong answer is highlighted in red
3. That option is disabled
4. Can select from remaining 3 options
5. If correct on 2nd try → earn 1 point
6. If wrong again → show correct answer

### 7. SQLite Database Tracking

**Users Table:**
- Session ID (unique identifier)
- Age group selected
- Category chosen
- Timestamp

**Game Sessions Table:**
- Total score
- Questions answered
- Current difficulty level
- Start and completion times

**Question History Table:**
- Each question answered
- Correct/incorrect status
- Number of attempts
- Points earned
- Timestamp

### 8. ClickUp-Inspired Design

**Color Palette:**
- Primary Purple: `#7B68EE`
- Primary Pink: `#FF6B9D`
- Primary Blue: `#49CCF9`
- Primary Green: `#49E9A6`
- Primary Yellow: `#FFC800`
- Primary Orange: `#FF9F40`

**Design Elements:**
- Gradient backgrounds
- Rounded corners (12px radius)
- Box shadows for depth
- Smooth transitions (0.3s)
- Hover effects on buttons
- Pulse animation for correct answers
- Shake animation for wrong answers

### 9. Game Flow

```
Welcome Screen
    ↓
Select Age Group (5-7, 8-10, 11-13)
    ↓
Choose Category (Maths, Science, etc.)
    ↓
Start Quiz (10 questions)
    ↓
Answer Questions
    ↓
    ├─ Correct → +2 points → Next Question
    ├─ Wrong → Try Again
    │   ├─ Correct → +1 point → Next Question
    │   └─ Wrong → Show Answer → Next Question
    ↓
After 3 Correct → Increase Difficulty
    ↓
Complete 10 Questions
    ↓
Results Screen (Final Score, Stats)
    ↓
Play Again or Exit
```

### 10. Additional Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Accessibility**: Clear fonts, high contrast, readable sizes
- **Animations**: Smooth transitions between screens
- **Feedback**: Visual and textual feedback for every action
- **Progress Tracking**: Question counter shows progress
- **Session Management**: Each play session is tracked separately

## Technical Implementation

### Frontend (Vanilla JavaScript)
- No framework dependencies
- Clean, modular code
- Event-driven architecture
- Async/await for API calls

### Backend (Node.js + Express)
- RESTful API design
- Efficient database queries
- Error handling
- CORS enabled for development

### Database (SQLite)
- Lightweight, file-based
- No separate database server needed
- Fast queries with better-sqlite3
- Automatic schema creation

## Performance

- **Fast Loading**: Minimal dependencies
- **Instant Feedback**: No loading delays
- **Smooth Animations**: Hardware-accelerated CSS
- **Efficient Queries**: Indexed database lookups

## Future Enhancement Ideas

1. **Leaderboard Display**: Show top scores on results screen
2. **Sound Effects**: Audio feedback for correct/wrong answers
3. **Timer Mode**: Add optional countdown timer
4. **Multiplayer**: Compete with friends
5. **Achievements**: Unlock badges for milestones
6. **Parent Dashboard**: Track child's progress over time
7. **More Categories**: Add coding, geography, languages
8. **Custom Quizzes**: Let teachers create their own questions
9. **Adaptive Learning**: AI-powered difficulty adjustment
10. **Offline Mode**: Service worker for offline play

---

**Built with care for young learners! 🚀**
