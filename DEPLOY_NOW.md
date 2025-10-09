# 🚀 DEPLOY NOW - Step by Step Guide

Your code is ready! Follow these steps:

## ✅ Step 1: Deploy Backend to Railway (5 minutes)

1. **Go to Railway**: https://railway.app/new
2. **Click**: "Deploy from GitHub repo"
3. **Select**: `Lapelis321/studentevents` repository
4. **Wait** for Railway to detect the project
5. **Click**: "Add variables" and add these:
   ```
   NODE_ENV=production
   JWT_SECRET=StudentEvents2024SecretKey!ChangeThisInProduction
   PORT=3001
   ```
6. **Click**: Settings (gear icon) on the left
7. **Set these**:
   - Root Directory: `backend`
   - Start Command: `node railway-server.js`
8. **Click**: "Deploy"
9. **Wait** ~2-3 minutes for deployment
10. **Copy your Railway URL** from the "Deployments" tab
    - It will look like: `https://studentevents-production-abc123.up.railway.app`
    - **SAVE THIS URL** - you'll need it!

---

## ✅ Step 2: Deploy Frontend to Netlify (3 minutes)

1. **Go to Netlify**: https://app.netlify.com/start
2. **Click**: "Import an existing project"
3. **Click**: "Deploy with GitHub"
4. **Select**: `Lapelis321/studentevents` repository
5. **Configure**:
   - Build command: `echo "No build needed"`
   - Publish directory: `.`
   - Click "Show advanced" → "New variable"
   - Add variable:
     ```
     Name: API_BASE_URL
     Value: [YOUR RAILWAY URL FROM STEP 1]/api
     ```
     Example: `https://studentevents-production-abc123.up.railway.app/api`
6. **Click**: "Deploy site"
7. **Wait** ~1-2 minutes
8. **Copy your Netlify URL** from the site overview
    - It will look like: `https://amazing-kare-123456.netlify.app`
    - **SAVE THIS URL** - you'll need it!

---

## ✅ Step 3: Connect Frontend & Backend (2 minutes)

Now we need to tell the backend about the frontend:

1. **Go back to Railway**
2. **Click**: Your project → Variables
3. **Add new variable**:
   ```
   FRONTEND_URL=[YOUR NETLIFY URL FROM STEP 2]
   ```
   Example: `https://amazing-kare-123456.netlify.app`
4. **Click**: "Redeploy" (Railway will automatically redeploy)

---

## ✅ Step 4: Test Your Live Site! (2 minutes)

1. **Open your Netlify URL** in a browser
2. **Check homepage** - should load with events
3. **Test Admin Login**:
   - Go to: `https://your-netlify-url.netlify.app/admin/login.html`
   - Email: `admin@studentevents.com`
   - Password: `admin123`
   - Should redirect to admin dashboard
4. **Create a test event** in admin dashboard
5. **Check main page** - your event should appear!

---

## 🎉 You're Live!

Your URLs:
- **Main Site**: https://your-netlify-url.netlify.app
- **Admin**: https://your-netlify-url.netlify.app/admin
- **Worker**: https://your-netlify-url.netlify.app/worker
- **API**: https://your-railway-url.up.railway.app

---

## 🔧 Troubleshooting

### If you see CORS errors:
1. Check that `FRONTEND_URL` in Railway matches your Netlify URL exactly
2. Redeploy Railway after adding the variable

### If API calls fail (404):
1. Check that `API_BASE_URL` in Netlify includes `/api` at the end
2. Test the API directly: `https://your-railway-url.up.railway.app/health`

### If admin login doesn't work:
1. Check browser console for errors
2. Verify the API URL in Netlify environment variables
3. Make sure Railway deployment is successful (green checkmark)

---

## 📝 Next Steps (Optional)

### Custom Domain:
1. **Netlify**: Site settings → Domain management → Add custom domain
2. **Railway**: Settings → Domains → Add custom domain

### Database (if you want data to persist):
1. **Railway**: Add PostgreSQL database
2. Set `DATABASE_URL` environment variable
3. Data will survive server restarts

---

## 💡 Important Notes

- **In-memory storage**: Data resets when Railway restarts (every ~24h or on redeploy)
- **Free tiers**: Both Railway and Netlify have generous free tiers
- **HTTPS**: Automatically enabled on both platforms
- **Admin credentials**: 
  - Email: `admin@studentevents.com`
  - Password: `admin123`
  - **⚠️ CHANGE THIS IN PRODUCTION!**

---

## 🆘 Need Help?

If something isn't working:
1. Check Railway logs: Railway dashboard → Deployments → View logs
2. Check Netlify logs: Netlify dashboard → Deploys → Function logs
3. Check browser console (F12) for frontend errors

**The deployment should take about 10-12 minutes total!**

