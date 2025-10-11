# 🚀 Migrate Frontend from Netlify to Vercel

**Date:** October 11, 2025  
**Reason:** Netlify site paused due to usage limits  
**Solution:** Move to Vercel (unlimited bandwidth on free tier)

---

## ✅ **Why Vercel?**

| Feature | Netlify Free | Vercel Free |
|---------|--------------|-------------|
| **Bandwidth** | 100GB/month | **Unlimited** ✅ |
| **Build Minutes** | 300 min/month | 6000 min/month |
| **Concurrent Builds** | 1 | 1 |
| **Sites** | Unlimited | Unlimited |
| **Custom Domains** | Yes | Yes |
| **HTTPS** | Yes | Yes |
| **Edge Network** | Yes | Yes |

**Verdict:** Vercel is better for free tier usage!

---

## 📋 **Migration Steps**

### Step 1: Create Vercel Account (2 minutes)

1. Go to: https://vercel.com/signup
2. Sign up with GitHub account (easiest)
3. Authorize Vercel to access your GitHub repositories

---

### Step 2: Import Project from GitHub (3 minutes)

1. Click **"Add New..."** → **"Project"**
2. Find your repository: `Lapelis321/studentevents`
3. Click **"Import"**

---

### Step 3: Configure Build Settings (2 minutes)

Vercel will auto-detect settings, but verify:

**Framework Preset:** Other (or None)  
**Root Directory:** `./` (leave blank)  
**Build Command:** Leave empty (static site)  
**Output Directory:** `./` (leave blank)  

Click **"Deploy"**

---

### Step 4: Wait for Deployment (1-2 minutes)

Vercel will:
- ✅ Clone your repository
- ✅ Build the site (instant for static HTML)
- ✅ Deploy to global CDN
- ✅ Generate a URL like: `studentevents.vercel.app`

---

### Step 5: Update API URL (if needed) (Optional)

Your code already forces the production API URL:

```javascript
// In index.html, checkout.html, event-details.html:
window.API_BASE_URL = 'https://studentevents-production.up.railway.app/api';
```

This will work on Vercel automatically! ✅

---

### Step 6: Set Up Custom Domain (Optional)

If you want to keep `afterstateevents.netlify.app` or use your own domain:

1. Go to Vercel project settings
2. Click **"Domains"**
3. Add your custom domain
4. Follow DNS instructions

---

## 🎯 **What Changes (and What Doesn't)**

### ✅ **Stays The Same:**
- All your code (HTML, CSS, JavaScript)
- Backend on Railway (no changes needed)
- Database on Supabase (no changes needed)
- API endpoints (same URLs)
- Admin dashboard
- All functionality

### 🔄 **Changes:**
- Frontend URL: `afterstateevents.netlify.app` → `studentevents.vercel.app`
- Hosting provider: Netlify → Vercel
- Deployment method: Git push auto-deploys on both

---

## 📝 **No Code Changes Required!**

Your application will work **exactly the same** on Vercel because:

1. ✅ It's static HTML/CSS/JS (no server-side rendering)
2. ✅ API URLs are hardcoded to Railway backend
3. ✅ No build step required
4. ✅ All paths are relative
5. ✅ No Netlify-specific features used

---

## 🚦 **Quick Start Guide**

### Option A: Import via Vercel Dashboard (Easiest)

**5 Simple Steps:**

1. **Go to:** https://vercel.com/new
2. **Sign in** with GitHub
3. **Import** `Lapelis321/studentevents` repository
4. **Click Deploy** (use default settings)
5. **Done!** Your site is live at `studentevents.vercel.app`

---

### Option B: Deploy via Vercel CLI (Advanced)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to your project
cd "C:\Users\Ignas\Desktop\nuotraukos video muzika ir projektai\apps\Cursor\fuxarterparty 2"

# Login to Vercel
vercel login

# Deploy
vercel
```

---

## 🧪 **Testing After Migration**

Once deployed to Vercel, test these URLs:

1. **Main Page:** `https://studentevents.vercel.app/`
   - Should show events from database
   - ✅ No 503 errors!

2. **Event Details:** `https://studentevents.vercel.app/event-details.html?id=2571f42a-...`
   - Should load event data from Railway API
   - ✅ Status badges should display correctly

3. **Admin Dashboard:** `https://studentevents.vercel.app/admin/`
   - Should allow login and event management
   - ✅ No `toFixed` errors!

4. **Checkout:** `https://studentevents.vercel.app/checkout.html`
   - Should load Stripe payment form
   - ✅ Ready for purchases!

---

## 🔄 **Auto-Deployment Setup**

Vercel automatically deploys when you push to GitHub:

```bash
# Make any changes to your code
git add .
git commit -m "Update feature"
git push origin main
```

**Vercel will:**
1. Detect the push
2. Build and deploy automatically
3. Update your live site in ~30 seconds
4. Send you a deployment notification

---

## 🎨 **Vercel Dashboard Features**

After deploying, you'll have access to:

- **Deployments:** View all deployments and rollback if needed
- **Analytics:** See page views and performance (free tier)
- **Logs:** Real-time deployment logs
- **Domains:** Manage custom domains
- **Preview Deployments:** Each PR gets a preview URL
- **Environment Variables:** Not needed for your frontend

---

## ⚠️ **Important Notes**

### 1. Update Links
After deploying to Vercel, you may want to update any hardcoded references:

- Update your GitHub README if it links to the live site
- Update any documentation with new URL
- Share new URL with users

### 2. Netlify Cleanup (Optional)
Once Vercel is working:
- You can delete the Netlify site
- Or leave it paused (no cost)

### 3. Future Pushes
Every `git push` will deploy to **both** Netlify and Vercel if both are connected.
- Netlify will fail (paused)
- Vercel will succeed ✅

---

## 📊 **Expected Results**

| Metric | Before (Netlify) | After (Vercel) |
|--------|------------------|----------------|
| **Status** | 🔴 503 Error | 🟢 Online |
| **Bandwidth** | ❌ Exceeded | ✅ Unlimited |
| **Build Time** | ~30 seconds | ~20 seconds |
| **Deploy Speed** | Fast | Fast |
| **Cost** | $0 | $0 |

---

## 🎉 **Benefits of Vercel**

1. **No More 503 Errors** - Unlimited bandwidth
2. **Faster Deployments** - Optimized build pipeline
3. **Better Analytics** - Free analytics included
4. **Preview Deployments** - Each PR gets a preview URL
5. **Edge Network** - Global CDN for fast loading
6. **No Usage Limits** - Never get paused again

---

## 🔧 **Troubleshooting**

### Issue: "Build Failed"
**Solution:** Vercel doesn't need a build step for static sites. Leave build command empty.

### Issue: "404 Not Found" on pages
**Solution:** Your routes are correct. This shouldn't happen with static HTML.

### Issue: "API calls failing"
**Solution:** Check Railway backend is running. Frontend → Railway connection is independent of hosting.

---

## ✅ **Success Checklist**

After migration, verify:

- [ ] Main page loads without 503 error
- [ ] Events display from database (not mock data)
- [ ] Event details page works with UUID
- [ ] Admin dashboard loads and functions
- [ ] Status badges show correctly
- [ ] Checkout page loads Stripe form
- [ ] No console errors
- [ ] All pages load quickly

---

## 📞 **Next Steps**

1. **Deploy to Vercel** (5 minutes)
2. **Test all pages** (5 minutes)
3. **Update documentation with new URL** (2 minutes)
4. **Continue with remaining TODOs:**
   - Set up SendGrid for emails
   - Test checkout flow
   - Enable RLS on database

---

## 🌟 **Why This Solves The Problem**

**The 503 errors you're seeing are NOT code bugs** - they're Netlify's way of saying "you've used your free tier bandwidth limit."

By moving to Vercel:
- ✅ All your fixes (status badges, UUID support, toFixed errors) will work
- ✅ No more bandwidth limits
- ✅ Same code, better hosting
- ✅ Your backend (Railway) and database (Supabase) stay the same

---

**Time to Complete:** 5-10 minutes  
**Difficulty:** Easy (just click buttons)  
**Risk:** None (can keep Netlify as backup)

**Ready to migrate? Go to:** https://vercel.com/new

---

**Last Updated:** October 11, 2025  
**Status:** Ready to Execute

