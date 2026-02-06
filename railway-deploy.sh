#!/bin/bash
# Railway CLI Deployment Setup Script
# Run this after setting up git and GitHub repository

# Prerequisites:
# 1. Install Railway CLI: npm install -g @railway/cli
# 2. GitHub repo created and code pushed
# 3. Run: railway login

# Login to Railway
echo "Logging into Railway..."
railway login

# Create new project
echo "Creating Railway project..."
railway init

# Add PostgreSQL plugin
echo "Adding PostgreSQL database..."
railway add

# Configure environment
echo "Setting up environment variables..."
railway variables set NODE_ENV production
railway variables set DATABASE_URL "postgresql://...[auto-configured]..."

# If you have OpenAI API key, set it:
# railway variables set OPENAI_API_KEY "your-key-here"

# Deploy
echo "Deploying to Railway..."
railway up

# View logs
echo "Checking deployment..."
railway logs

# Get deployment URL
echo "Getting your public URL..."
railway open

echo "✅ Deployment complete!"
echo "Your app is now live on Railway"
echo "Check railway open to see the public URL"
