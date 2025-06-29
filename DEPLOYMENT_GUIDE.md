# Full-Stack Deployment Guide

This guide will help you deploy your full-stack application (FastAPI backend + Next.js frontend) to Vercel.

## Project Structure

```
The-AI-Engineer-Challenge/
├── api/                    # FastAPI backend
│   ├── app.py             # Main FastAPI application
│   ├── requirements.txt   # Python dependencies
│   └── vercel.json        # Backend Vercel configuration
├── frontend-app/          # Next.js frontend
│   ├── src/app/           # Next.js app directory
│   ├── package.json       # Node.js dependencies
│   └── vercel.json        # Frontend Vercel configuration
└── vercel.json            # Root Vercel configuration
```

## Prerequisites

1. **GitHub Account**: Your code should be in a GitHub repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **OpenAI API Key**: For the chat functionality

## Step 1: Prepare Your Repository

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Ensure your repository is public** (or connect your private repo to Vercel)

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)

2. **Import Project**:
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select the repository containing your full-stack project

3. **Configure Project Settings**:
   - **Framework Preset**: Select "Other" (since we have a custom configuration)
   - **Root Directory**: Leave as `/` (root)
   - **Build Command**: Leave empty (handled by vercel.json)
   - **Output Directory**: Leave empty (handled by vercel.json)

4. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add the following variables:
     ```
     OPENAI_API_KEY=your_openai_api_key_here
     NEXT_PUBLIC_API_URL=https://your-vercel-deployment-url.vercel.app
     ```

5. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project or create new
   - Set environment variables when prompted

## Step 3: Configure Environment Variables

After deployment, you need to set up environment variables:

### Backend Environment Variables (in Vercel Dashboard)

1. Go to your project in Vercel Dashboard
2. Navigate to "Settings" → "Environment Variables"
3. Add:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

### Frontend Environment Variables

1. In the same Environment Variables section
2. Add:
   ```
   NEXT_PUBLIC_API_URL=https://your-vercel-deployment-url.vercel.app
   ```
   (Replace with your actual Vercel deployment URL)

## Step 4: Verify Deployment

1. **Check Backend Health**:
   - Visit: `https://your-deployment-url.vercel.app/`
   - Should show: `{"message": "OpenAI Chat API is running", "status": "active", "version": "1.0.0"}`

2. **Check API Endpoint**:
   - Visit: `https://your-deployment-url.vercel.app/api/health`
   - Should show: `{"status": "ok"}`

3. **Test Frontend**:
   - Visit: `https://your-deployment-url.vercel.app/`
   - Should show your chat interface

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - The backend is configured to allow Vercel domains
   - If you get CORS errors, check that your frontend URL is in the allowed origins

2. **Environment Variables Not Working**:
   - Ensure variables are set in Vercel Dashboard
   - Redeploy after adding environment variables
   - Check that `NEXT_PUBLIC_` prefix is used for frontend variables

3. **Build Failures**:
   - Check the build logs in Vercel Dashboard
   - Ensure all dependencies are in `requirements.txt` and `package.json`

4. **API Not Responding**:
   - Check that `OPENAI_API_KEY` is set correctly
   - Verify the API endpoint is accessible

### Debugging Steps

1. **Check Vercel Logs**:
   - Go to your project in Vercel Dashboard
   - Click on "Functions" to see serverless function logs

2. **Test API Locally**:
   ```bash
   cd api
   pip install -r requirements.txt
   python app.py
   ```

3. **Test Frontend Locally**:
   ```bash
   cd frontend-app
   npm install
   npm run dev
   ```

## Custom Domain (Optional)

1. **Add Custom Domain**:
   - Go to Vercel Dashboard → Your Project → Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update Environment Variables**:
   - Update `NEXT_PUBLIC_API_URL` to use your custom domain
   - Update CORS origins in `api/app.py` if needed

## Monitoring and Analytics

1. **Vercel Analytics**: Enable in project settings
2. **Function Logs**: Monitor API performance
3. **Error Tracking**: Set up error monitoring

## Cost Optimization

- **Vercel Hobby Plan**: Free tier includes 100GB bandwidth/month
- **Serverless Functions**: Pay per execution
- **OpenAI API**: Pay per token usage

## Security Considerations

1. **API Keys**: Never commit API keys to Git
2. **Environment Variables**: Use Vercel's secure environment variable storage
3. **CORS**: Configure allowed origins properly
4. **Rate Limiting**: Consider implementing rate limiting for production

## Next Steps

After successful deployment:

1. **Set up monitoring** and error tracking
2. **Configure custom domain** if needed
3. **Set up CI/CD** for automatic deployments
4. **Implement caching** for better performance
5. **Add authentication** if required

## Support

If you encounter issues:

1. Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
2. Review build logs in Vercel Dashboard
3. Check FastAPI and Next.js documentation
4. Ensure all environment variables are configured correctly

---

**Happy Deploying! 🚀** 