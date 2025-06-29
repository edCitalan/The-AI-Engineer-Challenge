#!/bin/bash

# Full-Stack Deployment Script
# This script helps prepare and deploy your application to Vercel

echo "🚀 Starting Full-Stack Deployment Process..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  You're not on the main branch. Current branch: $CURRENT_BRANCH"
    echo "   Consider switching to main: git checkout main"
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes. Please commit them first:"
    echo "   git add ."
    echo "   git commit -m 'Prepare for deployment'"
    echo ""
    read -p "Do you want to commit changes now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "Prepare for deployment"
    else
        echo "❌ Please commit changes before deploying"
        exit 1
    fi
fi

# Push to remote repository
echo "📤 Pushing to remote repository..."
git push origin main

echo ""
echo "✅ Code pushed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Click 'Add New' → 'Project'"
echo "3. Import your GitHub repository"
echo "4. Configure environment variables:"
echo "   - OPENAI_API_KEY=your_openai_api_key"
echo "   - NEXT_PUBLIC_API_URL=https://your-deployment-url.vercel.app"
echo "5. Click 'Deploy'"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo ""
echo "🎉 Happy Deploying!" 