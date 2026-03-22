# 🚀 STEM Quest - Kids Quiz App

An interactive STEM quiz application designed for kids to learn Math, Science, Riddles, Spelling, and India-specific knowledge through engaging gameplay.

## Features

- **Age-Appropriate Content**: Questions tailored for 5-7, 8-10, and 11-13 age groups
- **Multiple Categories**:
  - 📊 Mathematics
  - 🔬 Science
  - 🧩 Riddles
  - ✏️ Spelling
  - 🇮🇳 India Quiz
- **Smart Scoring System**:
  - 2 points for correct answer on first attempt
  - 1 point for correct answer on second attempt
  - Instant feedback and answer highlighting
- **Dynamic Difficulty**: Automatically increases difficulty after 3 consecutive correct answers
- **No Repeated Questions**: Each question appears only once per session
- **Score Tracking**: Real-time score updates and session history stored in database
- **ClickUp-Inspired Design**: Vibrant, modern UI with smooth animations

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js + Express
- **Database**: SQLite (sqlite3)
- **Design**: ClickUp-inspired color scheme with gradient backgrounds

## Prerequisites

You need to have **Node.js** installed on your system.

**To install Node.js on macOS:**

1. **Using Homebrew** (recommended):
   ```bash
   brew install node
   ```

2. **Or download from official website**:
   - Visit https://nodejs.org/
   - Download the LTS version for macOS
   - Run the installer

## Installation

1. **Navigate to the project directory**:
   ```bash
   cd /Users/Hemant/Desktop/quiz
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

   This will install:
   - express (web server)
   - sqlite3 (database)
   - cors (cross-origin support)
   - nodemon (dev tool)

## Running the Application

1. **Start the server**:
   ```bash
   npm start
   ```

   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

2. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

## How to Play

1. **Select Age Group**: Choose your age range (5-7, 8-10, or 11-13 years)
2. **Choose Category**: Pick from Math, Science, Riddles, Spelling, or India Quiz
3. **Start Quiz**: Click "Start Quiz!" to begin
4. **Answer Questions**:
   - Select the correct answer from 4 options
   - Get 2 points for first-attempt correct answers
   - Get a second chance if wrong - earn 1 point if correct
   - See the correct answer highlighted if wrong on second attempt
5. **Progress Through Difficulty**: Answer 3 questions correctly to unlock harder questions
6. **Complete Quiz**: Answer 10 questions to see your final score

## Database Schema

The app tracks:
- **Users**: Session ID, age group, category
- **Game Sessions**: Total score, questions answered, difficulty level
- **Question History**: Individual answers, attempts, points earned

## Project Structure

```
quiz/
├── index.html          # Main HTML file
├── style.css           # ClickUp-inspired styling
├── app.js              # Frontend game logic
├── server.js           # Backend API and question bank
├── package.json        # Dependencies
├── quiz.db             # SQLite database (auto-created)
└── README.md           # This file
```

## API Endpoints

- `POST /api/user/create` - Create new user session
- `POST /api/question/get` - Get next question (no repeats)
- `POST /api/answer/submit` - Submit answer and get feedback
- `POST /api/difficulty/update` - Update difficulty level
- `POST /api/session/complete` - Mark session as complete
- `GET /api/leaderboard` - Get top 10 scores

## Design Features

- Gradient backgrounds inspired by ClickUp
- Smooth animations and transitions
- Responsive design for all screen sizes
- Color-coded feedback (green for correct, red for incorrect, yellow for retry)
- Real-time score updates
- Difficulty badge with dynamic colors

## Future Enhancements

- Leaderboard display
- More question categories
- Timer for questions
- Sound effects
- Multiplayer mode
- Parent dashboard
- Progress tracking over time

## License

MIT License - Feel free to use and modify for educational purposes!

---

Built with ❤️ for young learners
