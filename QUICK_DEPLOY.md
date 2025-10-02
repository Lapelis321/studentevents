# 🚀 Quick Deploy Guide - Get Online in 15 Minutes!

This is a simplified guide to get your StudentEvents website online quickly.

## 📋 What You Need (5 minutes setup)

1. **Supabase Account** (Free database)
   - Go to [supabase.com](https://supabase.com)
   - Click "Start your project" → Sign up with GitHub
   - Create new project (wait 2-3 minutes for setup)

2. **Railway Account** (Free backend hosting)
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - No setup needed yet

3. **Netlify Account** (Free frontend hosting)
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub
   - No setup needed yet

## 🗄️ Step 1: Set Up Database (3 minutes)

1. **In your Supabase dashboard:**
   - Go to Settings → Database
   - Copy the "Connection string" (starts with `postgresql://`)
   - Go to Settings → API
   - Copy "Project URL" and "anon public" key

2. **Run the database setup:**
   - In Supabase dashboard, go to SQL Editor
   - Copy all content from `backend/supabase-setup.sql`
   - Paste and click "Run"
   - ✅ Your database is ready!

## 🚀 Step 2: Deploy Backend (5 minutes)

1. **Open terminal in your project folder**

2. **Login to Railway:**
   ```bash
   railway login
   ```
   - This opens browser → click "Authorize"

3. **Deploy backend:**
   ```bash
   cd backend
   railway init
   railway up
   ```
   - Choose "Empty Project"
   - Wait for deployment (2-3 minutes)

4. **Set environment variables in Railway dashboard:**
   - Go to your Railway project dashboard
   - Click "Variables" tab
   - Add these variables:
   ```
   NODE_ENV=production
   DATABASE_URL=[your-supabase-connection-string]
   SUPABASE_URL=[your-supabase-project-url]
   SUPABASE_ANON_KEY=[your-supabase-anon-key]
   JWT_SECRET=your-super-secret-key-make-it-long-and-random
   FRONTEND_URL=https://your-site-name.netlify.app
   ```

5. **Get your backend URL:**
   - Copy the URL from Railway dashboard (looks like: `https://web-production-xxxx.up.railway.app`)

## 🌐 Step 3: Deploy Frontend (3 minutes)

1. **Update frontend config:**
   - Open `scripts/config.js`
   - Replace `https://your-backend-domain.railway.app` with your actual Railway URL

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Deploy manually"
   - Drag and drop your entire project folder
   - Wait for deployment (1-2 minutes)

3. **Update backend CORS:**
   - Copy your Netlify URL (looks like: `https://amazing-site-name.netlify.app`)
   - Go back to Railway dashboard
   - Update `FRONTEND_URL` variable with your Netlify URL
   - Backend will restart automatically

## 🎉 Step 4: Test Your Live Website!

Your website is now live at:
- **Frontend:** `https://your-site-name.netlify.app`
- **Backend API:** `https://your-backend-name.railway.app/api`

### Test these URLs:
- Homepage: Your Netlify URL
- API Health: `https://your-backend-name.railway.app/health`
- Events API: `https://your-backend-name.railway.app/api/events`

## 🔧 Optional: Set Up Payments (Later)

When you're ready for real payments:

1. **Get Stripe account:**
   - Go to [stripe.com](https://stripe.com)
   - Create account → Get API keys

2. **Add to Railway variables:**
   ```
   STRIPE_SECRET_KEY=sk_live_your_key
   STRIPE_PUBLISHABLE_KEY=pk_live_your_key
   ```

3. **Update frontend config:**
   - Add your Stripe publishable key to `scripts/config.js`

## 🆘 Troubleshooting

### Common Issues:

**❌ "CORS Error"**
- Make sure `FRONTEND_URL` in Railway matches your Netlify URL exactly

**❌ "Database connection failed"**
- Check your `DATABASE_URL` in Railway variables
- Make sure you ran the SQL setup in Supabase

**❌ "API not found"**
- Check your backend URL in `scripts/config.js`
- Make sure Railway deployment succeeded

**❌ "Site not loading"**
- Check Netlify deployment logs
- Make sure all files were uploaded

### Quick Fixes:

1. **Redeploy backend:** In Railway dashboard, click "Deploy"
2. **Redeploy frontend:** Drag and drop your folder to Netlify again
3. **Check logs:** Both Railway and Netlify have deployment logs

## 🎯 Success Checklist

- ✅ Supabase database created and setup
- ✅ Railway backend deployed with environment variables
- ✅ Netlify frontend deployed
- ✅ CORS configured (FRONTEND_URL matches Netlify URL)
- ✅ API endpoints working
- ✅ Website loads and shows events

## 🔄 Making Updates

**To update your website:**

1. **Backend changes:**
   ```bash
   cd backend
   railway up
   ```

2. **Frontend changes:**
   - Just drag and drop your updated folder to Netlify

**Auto-deployment (Advanced):**
- Connect your GitHub repo to Railway and Netlify
- Every code push will auto-deploy!

---

**🎉 Congratulations! Your website is now always online!**

Your site has:
- ✅ 99.9% uptime
- ✅ Free SSL certificate (HTTPS)
- ✅ Global CDN (fast worldwide)
- ✅ Professional hosting
- ✅ Automatic backups

**Need help?** Check the detailed `DEPLOYMENT.md` guide or create an issue on GitHub.
