@echo off
echo 🚀 Starting Full-Stack Deployment Process...

REM Check if git is initialized
if not exist ".git" (
    echo ❌ Git repository not found. Please initialize git first:
    echo    git init
    echo    git add .
    echo    git commit -m "Initial commit"
    pause
    exit /b 1
)

REM Check for uncommitted changes
git diff-index --quiet HEAD
if errorlevel 1 (
    echo ⚠️  You have uncommitted changes. Please commit them first:
    echo    git add .
    echo    git commit -m "Prepare for deployment"
    echo.
    set /p commit_now="Do you want to commit changes now? (y/n): "
    if /i "%commit_now%"=="y" (
        git add .
        git commit -m "Prepare for deployment"
    ) else (
        echo ❌ Please commit changes before deploying
        pause
        exit /b 1
    )
)

REM Push to remote repository
echo 📤 Pushing to remote repository...
git push origin main

echo.
echo ✅ Code pushed successfully!
echo.
echo 📋 Next Steps:
echo 1. Go to https://vercel.com/dashboard
echo 2. Click 'Add New' → 'Project'
echo 3. Import your GitHub repository
echo 4. Configure environment variables:
echo    - OPENAI_API_KEY=your_openai_api_key
echo    - NEXT_PUBLIC_API_URL=https://your-deployment-url.vercel.app
echo 5. Click 'Deploy'
echo.
echo 📖 For detailed instructions, see DEPLOYMENT_GUIDE.md
echo.
echo 🎉 Happy Deploying!
pause 