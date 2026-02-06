# Railway Deployment Guide for Elite Hire 2

## Quick Setup Steps

### 1. Prerequisites
- Railway Account: https://railway.app
- GitHub Account (Railway deploys from GitHub)

### 2. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/elite-hire.git
git push -u origin main
```

### 3. Connect Railway to GitHub
1. Go to railway.app and sign in
2. Create a new project
3. Select "Deploy from GitHub repo"
4. Authorize Railway with GitHub
5. Select the `elite-hire` repository

### 4. Configure Environment Variables
In Railway dashboard, add these variables:

**Database Setup:**
- `DATABASE_URL` - Railway will auto-generate this if you add PostgreSQL plugin
- To add PostgreSQL: Click "+ Add Plugins" → PostgreSQL

**Required API Keys:**
- `OPENAI_API_KEY` - Your OpenAI API key
- `REDIS_URL` - Optional (for job queue; Railway can add Redis plugin)
- `MONGODB_URI` - If using MongoDB instead of PostgreSQL
- `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET` - If using LinkedIn integration

### 5. Set Build & Start Commands
Railway auto-detects Next.js, but verify:
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Node Version**: 20.x or 22.x

### 6. Deploy
Railway will automatically build and deploy when you push to GitHub.
- Your app will be available at: `https://your-project-name-random-string.railway.app`

### 7. Database Migration (First Time Only)
After deployment, run migrations:
```bash
npx prisma migrate deploy
```

---

## Important Notes

⚠️ **Database Considerations:**
- Local SQLite (dev.db) won't work in production
- Railway's PostgreSQL plugin is recommended
- Update your DATABASE_URL in Railway dashboard

⚠️ **Redis Queue:**
- Some features require Redis (BullMQ queue)
- Add Redis plugin if needed from Railway dashboard

⚠️ **Environment Variables:**
- Never commit `.env` file
- Add all secrets in Railway dashboard
- Reference `.env.example` for required variables

---

## Troubleshooting

**Build fails:**
- Check logs in Railway dashboard
- Ensure all dependencies are in package.json
- Verify NODE_ENV is set correctly

**App crashes after deploy:**
- Check Railway logs (dark icon on project)
- Verify DATABASE_URL and other env vars are set
- Check disk space and memory allocation

**Database connection error (Postgres.railway.internal):**
- **Symptom**: `PrismaClientInitializationError` or `Table does not exist`
- **Fix**:
  1. Ensure `DATABASE_URL` is correct in Railway Variables.
  2. The project is configured to use `prisma db push` to automatically sync your schema.
  3. If tables are missing, redeploying usually fixes it.

---

## Next Steps

1. **Create GitHub repo** and push code
2. **Go to railway.app** and connect your repo
3. **Add PostgreSQL plugin** in Railway
4. **Set environment variables** in Railway dashboard
5. **Deploy** by pushing to GitHub
6. Check logs for any errors

Need help? Visit: https://docs.railway.app/deploy/deployments


**How to Seed Database (Job Roles Not Showing):**
1. Go to Railway Dashboard -> Deployments.
2. Click the latest ACTIVE deployment.
3. Click 'Shell' (or 'Console' / 'Terminal').
4. Run this command:
   `ash
   npm run db:seed
   ``n5. Restart your app or just refresh the page.
