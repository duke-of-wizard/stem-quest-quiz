# Quick Setup Guide

## Step 1: Install Node.js

Before you can run this app, you need Node.js installed.

### Check if Node.js is already installed:
```bash
node --version
npm --version
```

If you see version numbers, you're good to go! Skip to Step 2.

### If not installed, install Node.js:

**Option A: Using Homebrew (easiest for Mac)**
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node
```

**Option B: Download from website**
1. Go to https://nodejs.org/
2. Click on the big green "Download Node.js (LTS)" button
3. Open the downloaded file and follow the installer
4. Restart your terminal after installation

## Step 2: Install Project Dependencies

Open Terminal and run:

```bash
cd /Users/Hemant/Desktop/quiz
npm install
```

This will install all required packages (Express, SQLite, etc.)

## Step 3: Start the Application

```bash
npm start
```

You should see:
```
Database initialized successfully
Server running on http://localhost:3000
```

## Step 4: Open in Browser

Open your web browser and go to:
```
http://localhost:3000
```

## Troubleshooting

### "npm: command not found"
- Node.js is not installed or not in your PATH
- Try closing and reopening Terminal after installing Node.js
- Make sure the Node.js installer completed successfully

### "Port 3000 is already in use"
- Another application is using port 3000
- Stop the other application or change the port in server.js (line 5)

### "Cannot find module 'express'"
- Dependencies weren't installed
- Run `npm install` again in the quiz folder

### Database errors
- The app will automatically create `quiz.db` on first run
- Make sure you have write permissions in the quiz folder

## Development Mode (Auto-restart on changes)

```bash
npm run dev
```

This uses nodemon to automatically restart the server when you make changes to the code.

## Stopping the Server

Press `Ctrl + C` in the terminal where the server is running.

---

Need help? Check the main README.md for more details!
