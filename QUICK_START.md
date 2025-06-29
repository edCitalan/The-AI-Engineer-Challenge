# 🚀 Quick Start - Deploy Your Full-Stack App

## What We've Set Up

Your project is now ready for deployment with:

✅ **Backend**: FastAPI with OpenAI integration  
✅ **Frontend**: Next.js with Fallout-themed UI  
✅ **Vercel Configuration**: Optimized for full-stack deployment  
✅ **CORS**: Configured for Vercel domains  
✅ **Environment Variables**: Ready for configuration  

## 🎯 Immediate Next Steps

### 1. Push to GitHub
```bash
# If you haven't already
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. **Important**: Select "Other" as Framework Preset
5. Click "Deploy"

### 3. Configure Environment Variables
After deployment, in Vercel Dashboard:
- Go to Settings → Environment Variables
- Add:
  ```
  OPENAI_API_KEY=your_openai_api_key_here
  NEXT_PUBLIC_API_URL=https://your-deployment-url.vercel.app
  ```

### 4. Test Your Deployment
- **Backend**: Visit `https://your-url.vercel.app/` (should show API status)
- **Frontend**: Visit `https://your-url.vercel.app/` (should show chat interface)

## 🔧 Quick Commands

**Windows Users:**
```cmd
deploy.bat
```

**Mac/Linux Users:**
```bash
./deploy.sh
```

## 📚 Detailed Guide

For complete instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 🆘 Troubleshooting

**Common Issues:**
- **CORS Errors**: Backend is configured for Vercel domains
- **Build Failures**: Check Vercel logs for specific errors
- **API Not Working**: Ensure `OPENAI_API_KEY` is set correctly

**Need Help?**
- Check the detailed deployment guide
- Review Vercel build logs
- Ensure all environment variables are configured

---

**Ready to deploy? Let's go! 🚀** 