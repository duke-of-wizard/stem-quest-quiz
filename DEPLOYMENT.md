# 🚀 Deployment Guide - STEM Quest Quiz

This guide will help you deploy your quiz app to the internet so everyone can access it!

## 📋 Table of Contents

1. [Quick Start (Recommended: Railway)](#quick-start-railway)
2. [Option 1: Deploy to Railway (Easiest)](#option-1-railway)
3. [Option 2: Deploy to Render](#option-2-render)
4. [Option 3: Deploy to Vercel](#option-3-vercel)
5. [Option 4: Deploy to Heroku](#option-4-heroku)
6. [Before Deployment](#before-deployment)
7. [After Deployment](#after-deployment)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Quick Start (Railway)

**Railway is the EASIEST and FREE option. Here's the quick version:**

1. Push your code to GitHub
2. Go to [Railway.app](https://railway.app)
3. Click "Start a New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Done! Railway automatically detects and deploys Node.js apps

**Your app will be live at: `your-app-name.up.railway.app`**

---

## 📦 Before Deployment

### Step 1: Initialize Git Repository

```bash
cd /Users/Hemant/Desktop/quiz

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - STEM Quest Quiz v2.0"
```

### Step 2: Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click **"+"** → **"New repository"**
3. Name it: `stem-quest-quiz`
4. Click **"Create repository"**
5. Follow the instructions to push your code:

```bash
git remote add origin https://github.com/YOUR_USERNAME/stem-quest-quiz.git
git branch -M main
git push -u origin main
```

**✅ Now your code is on GitHub and ready to deploy!**

---

## 🚂 Option 1: Railway (Recommended - FREE & Easy)

### Why Railway?
- ✅ **FREE** (500 hours/month free)
- ✅ **Auto-deployment** from GitHub
- ✅ **Zero configuration** needed
- ✅ **SQLite works** out of the box
- ✅ **Custom domain** support

### Deployment Steps:

1. **Go to Railway**
   - Visit: https://railway.app
   - Click **"Start a New Project"**

2. **Connect GitHub**
   - Click **"Deploy from GitHub repo"**
   - Authorize Railway to access your GitHub
   - Select your repository: `stem-quest-quiz`

3. **Railway Auto-Detects Everything**
   - Railway automatically detects it's a Node.js app
   - Runs `npm install` and `npm start`
   - No configuration needed!

4. **Get Your URL**
   - Click on your deployed service
   - Go to **"Settings"** → **"Networking"**
   - Click **"Generate Domain"**
   - Your app is live at: `your-app-name.up.railway.app`

5. **Done!** 🎉
   - Share the URL with everyone!
   - Railway auto-redeploys when you push to GitHub

### Railway Free Tier:
- 500 hours/month execution time
- 512 MB RAM
- 1 GB storage
- Perfect for this quiz app!

---

## 🎨 Option 2: Render (FREE)

### Why Render?
- ✅ **FREE** tier available
- ✅ **Auto-deployment** from GitHub
- ✅ **Easy setup**
- ⚠️ **Spins down** after 15 min inactivity (free tier)

### Deployment Steps:

1. **Go to Render**
   - Visit: https://render.com
   - Sign up with GitHub

2. **Create New Web Service**
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repository

3. **Configure Service**
   - Name: `stem-quest-quiz`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Click **"Create Web Service"**

4. **Get Your URL**
   - Your app will be at: `stem-quest-quiz.onrender.com`
   - First deployment takes 2-3 minutes

### Render Free Tier:
- FREE forever
- 512 MB RAM
- Auto-sleeps after 15 min (wakes up on first request)
- Good for testing/demo

---

## ⚡ Option 3: Vercel (Easy, but requires changes)

### Why Vercel?
- ✅ **FREE** tier
- ✅ **Super fast** deployment
- ⚠️ **Serverless** - requires code changes for SQLite

### Important Note:
Vercel is serverless, so SQLite needs special handling. I've included a `vercel.json` config, but you might need to switch to a cloud database (like Vercel Postgres) for production.

### Deployment Steps:

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login and Deploy**
   ```bash
   cd /Users/Hemant/Desktop/quiz
   vercel login
   vercel
   ```

3. **Follow Prompts**
   - Setup and deploy? **Y**
   - Which scope? (your account)
   - Link to existing project? **N**
   - Project name: `stem-quest-quiz`
   - Directory: `./`
   - Override settings? **N**

4. **Done!**
   - Your app is live at: `stem-quest-quiz.vercel.app`
   - Run `vercel --prod` to deploy to production

### Vercel Limitations:
- SQLite won't persist between requests (serverless)
- Consider using Vercel Postgres for production
- Free tier: 100 GB bandwidth/month

---

## 🔷 Option 4: Heroku (Paid)

### Why Heroku?
- ✅ **Reliable** and battle-tested
- ✅ **Auto-deployment** from GitHub
- ❌ **No longer FREE** ($7/month minimum)

### Deployment Steps:

1. **Install Heroku CLI**
   ```bash
   brew install heroku/brew/heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create App**
   ```bash
   cd /Users/Hemant/Desktop/quiz
   heroku create stem-quest-quiz
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

5. **Open App**
   ```bash
   heroku open
   ```

### Heroku Pricing:
- Basic: $7/month
- No free tier anymore
- Good for production apps

---

## 🎯 My Recommendation

### For You (Best Options):

1. **🥇 Railway** (BEST)
   - Easiest setup
   - FREE (500 hrs/month)
   - SQLite works perfectly
   - Auto-deploy from GitHub
   - **Start here!**

2. **🥈 Render** (Good Alternative)
   - FREE forever
   - Easy setup
   - Sleeps after 15 min (acceptable for demo)

3. **🥉 Vercel** (If you want speed)
   - Super fast
   - FREE
   - Requires database changes

---

## ✅ After Deployment

### 1. Test Your Live App
- Visit your deployment URL
- Try all features:
  - Age selection ✓
  - Mixed questions ✓
  - Winning streak ✓
  - Confetti animation ✓
  - Score tracking ✓

### 2. Share Your App
Your app is now live! Share the URL:
- `https://your-app-name.up.railway.app` (Railway)
- `https://stem-quest-quiz.onrender.com` (Render)
- `https://stem-quest-quiz.vercel.app` (Vercel)

### 3. Custom Domain (Optional)
All platforms support custom domains:
- Railway: Settings → Networking → Custom Domain
- Render: Settings → Custom Domain
- Vercel: Settings → Domains

### 4. Auto-Deployment
Once set up, every time you push to GitHub:
```bash
git add .
git commit -m "Update questions"
git push
```
Your live app automatically updates! 🎉

---

## 🔧 Troubleshooting

### App Not Starting?

**Check Logs:**
- Railway: Deployments → View Logs
- Render: Logs tab
- Vercel: Deployments → Function Logs

**Common Issues:**

1. **"Cannot find module"**
   ```bash
   # Make sure package.json has all dependencies
   npm install
   git add package*.json
   git commit -m "Update dependencies"
   git push
   ```

2. **Port Error**
   - Fixed! We already use `process.env.PORT || 3000`

3. **Database Error**
   - Railway/Render: SQLite works fine
   - Vercel: Consider switching to Vercel Postgres

### Database Persists?

**Railway/Render**:
- Database persists automatically
- Stored in the container

**Vercel**:
- SQLite doesn't persist (serverless)
- Need cloud database for production

### Need Help?

Each platform has great docs:
- Railway: https://docs.railway.app
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs

---

## 📊 Feature Comparison

| Feature | Railway | Render | Vercel | Heroku |
|---------|---------|--------|--------|--------|
| **Price** | FREE | FREE | FREE | $7/mo |
| **SQLite** | ✅ Yes | ✅ Yes | ⚠️ No* | ✅ Yes |
| **Auto-deploy** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Sleep** | ❌ No | ✅ Yes | ❌ No | ⚠️ Yes |
| **Setup** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Reliability** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

*Vercel needs database changes

---

## 🎉 Ready to Deploy?

**My Recommendation: Start with Railway!**

1. Push code to GitHub ✓
2. Deploy to Railway (5 minutes) ✓
3. Share your quiz with the world! ✓

**Your quiz will be live for everyone to enjoy!** 🚀

---

## 🔗 Quick Links

- **Railway**: https://railway.app
- **Render**: https://render.com
- **Vercel**: https://vercel.com
- **GitHub**: https://github.com

Need help? The Railway Discord community is very helpful!

**Good luck with your deployment!** 🎊
