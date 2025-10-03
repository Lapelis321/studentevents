# 🚀 Deploy StudentEvents to the Cloud (24/7 Hosting)

Follow these steps to make your website run without your computer:

## 📋 Prerequisites (5 minutes)

1. **GitHub Account** - If you don't have one, create at [github.com](https://github.com)
2. **Railway Account** - Sign up at [railway.app](https://railway.app) with GitHub
3. **Netlify Account** - Sign up at [netlify.com](https://netlify.com) with GitHub

## 🗄️ Step 1: Deploy Backend to Railway (5 minutes)

1. **Go to Railway:**
   - Visit [railway.app](https://railway.app)
   - Click "Login" → "Login with GitHub"
   - Click "New Project" → "Deploy from GitHub repo"

2. **Connect Repository:**
   - Select your repository (or create one if needed)
   - Set **Root Directory** to: `backend`
   - Click "Deploy"

3. **Set Environment Variables:**
   - In Railway dashboard, go to your project
   - Click "Variables" tab
   - Add these variables:
     ```
     NODE_ENV=production
     FRONTEND_URL=https://your-site-name.netlify.app
     ```
   - (We'll update FRONTEND_URL after frontend deployment)

4. **Get Backend URL:**
   - Copy your Railway URL (looks like: `https://web-production-xxxx.up.railway.app`)
   - Save this URL - you'll need it for the frontend

## 🌐 Step 2: Deploy Frontend to Netlify (3 minutes)

1. **Go to Netlify:**
   - Visit [netlify.com](https://netlify.com)
   - Click "Login" → "Login with GitHub"
   - Click "Add new site" → "Deploy manually"

2. **Upload Files:**
   - Drag and drop your **entire project folder** (not just backend)
   - Wait for deployment (1-2 minutes)

3. **Get Frontend URL:**
   - Copy your Netlify URL (looks like: `https://amazing-site-name.netlify.app`)
   - Save this URL

## 🔧 Step 3: Connect Frontend and Backend (2 minutes)

1. **Update Frontend Config:**
   - In your project, open `scripts/config.js`
   - Replace the API_BASE_URL with your Railway URL:
     ```javascript
     API_BASE_URL: 'https://your-railway-url.up.railway.app/api'
     ```

2. **Update Backend CORS:**
   - Go back to Railway dashboard
   - Update the `FRONTEND_URL` variable with your Netlify URL
   - The backend will restart automatically

3. **Redeploy Frontend:**
   - Drag and drop your updated project folder to Netlify again

## 🎉 Step 4: Test Your Live Website!

Your website is now live at:
- **Frontend:** `https://your-site-name.netlify.app`
- **Backend API:** `https://your-railway-url.up.railway.app/api`

### Test these URLs:
- Homepage: Your Netlify URL
- API Health: `https://your-railway-url.up.railway.app/health`
- Events API: `https://your-railway-url.up.railway.app/api/events`

## 🔄 Making Updates

**To update your website:**

1. **Backend changes:**
   - Push changes to GitHub
   - Railway will auto-deploy

2. **Frontend changes:**
   - Push changes to GitHub
   - Netlify will auto-deploy

## 🎯 Success Checklist

- ✅ Railway backend deployed with environment variables
- ✅ Netlify frontend deployed
- ✅ CORS configured (FRONTEND_URL matches Netlify URL)
- ✅ API endpoints working
- ✅ Website loads and shows events

## 🆘 Troubleshooting

**❌ "CORS Error"**
- Make sure `FRONTEND_URL` in Railway matches your Netlify URL exactly

**❌ "API not found"**
- Check your backend URL in `scripts/config.js`
- Make sure Railway deployment succeeded

**❌ "Site not loading"**
- Check Netlify deployment logs
- Make sure all files were uploaded

## 🎉 Congratulations!

Your website now has:
- ✅ 99.9% uptime
- ✅ Free SSL certificate (HTTPS)
- ✅ Global CDN (fast worldwide)
- ✅ Professional hosting
- ✅ Automatic backups
- ✅ Runs 24/7 without your computer!

**Need help?** Check the detailed `DEPLOYMENT.md` guide.
