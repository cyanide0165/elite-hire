# Elite Hire 2 - Railway Deployment Checklist

## ✅ Pre-Deployment Checklist

### Code Quality
- [x] Fixed import path for ResumeViewer component
- [x] .env.example created with required variables
- [x] next.config.ts configured for deployment
- [x] package.json has build and start scripts

### Requirements
- [ ] GitHub account created
- [ ] Railway account created (https://railway.app)
- [ ] All environment variables ready

---

## 🚀 Deployment Steps (Quick Reference)

### Step 1: Initialize Git (if not already done)
```powershell
cd "e:\elite hire 2 (1)\elite hire 2\elite-hire"
git init
git add .
git commit -m "Initial commit for Railway deployment"
```

### Step 2: Create GitHub Repository
1. Go to https://github.com/new
2. Create repository named `elite-hire`
3. Follow instructions to push your code:
```powershell
git remote add origin https://github.com/YOUR_USERNAME/elite-hire.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy on Railway
1. Visit https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Authorize and select your `elite-hire` repository
4. Railway will auto-detect Node.js and Next.js

### Step 4: Add Database Plugin
1. In Railway dashboard, click "+ Add Plugins"
2. Select PostgreSQL
3. Railway auto-generates `DATABASE_URL`

### Step 5: Configure Environment Variables
In Railway dashboard → Variables tab, add:

**Required:**
- `OPENAI_API_KEY` - Get from https://platform.openai.com/api-keys
- `NODE_ENV=production`

**Optional (if used in app):**
- `REDIS_URL` - Add Redis plugin if needed
- `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET`
- `MONGODB_URI` - If using MongoDB

### Step 6: Deploy
- Push code to GitHub: `git push`
- Railway auto-deploys
- Check logs for errors

---

## 📊 Deployment Info

| Item | Value |
|------|-------|
| **Framework** | Next.js 16.1.3 |
| **Runtime** | Node.js 20+ |
| **Build Time** | ~2-3 minutes |
| **Database** | PostgreSQL (via Railway) |
| **Port** | 3000 (Railway assigns public URL) |

---

## 🔍 After Deployment

### Database Setup
First time deployment, run:
```bash
npx prisma migrate deploy
```

### Access Your App
- Public URL provided by Railway: `https://your-project-random-string.railway.app`
- Share this URL with anyone to access your app

### Monitor & Logs
- Railway dashboard shows real-time logs
- Check "Deployments" tab for build history

---

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check Railway logs, ensure all deps in package.json |
| Database error | Verify PostgreSQL plugin added, env var set |
| App won't start | Check PORT env (Railway sets it automatically) |
| Can't connect to Redis | Add Redis plugin or disable Redis-dependent features |

---

## 📝 Files Modified/Created

- `.env.example` - Template for environment variables
- `RAILWAY_DEPLOYMENT.md` - Detailed deployment guide
- **Fixed**: `src/app/dashboard/candidate/[id]/page.tsx` - Import path fixed

---

**Need help?** 
- Railway Docs: https://docs.railway.app
- Next.js Deployment: https://nextjs.org/docs/deployment
