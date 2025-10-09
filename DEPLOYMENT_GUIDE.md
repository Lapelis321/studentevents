# 🚀 Deployment Guide

## Overview
- **Frontend**: Netlify (static hosting)
- **Backend**: Railway (Node.js API)

## Prerequisites
1. GitHub account
2. Netlify account
3. Railway account

---

## Step 1: Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

## Step 2: Deploy Backend to Railway

### Option A: Using Railway CLI
```bash
cd backend
railway login
railway link
railway up
```

### Option B: Using Railway Dashboard
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect Node.js
5. Set the following environment variables:
   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=your-secret-key-here-change-this
   FRONTEND_URL=https://your-netlify-site.netlify.app
   ```
6. Set Root Directory: `backend`
7. Set Start Command: `node railway-server.js`
8. Click "Deploy"

### Get Your Railway URL
After deployment, Railway will provide a URL like:
`https://your-project-name.up.railway.app`

---

## Step 3: Deploy Frontend to Netlify

### Option A: Using Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

### Option B: Using Netlify Dashboard
1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select your repository
4. Configure build settings:
   - **Build command**: `echo No build needed`
   - **Publish directory**: `.` (root)
5. Add environment variable:
   ```
   API_BASE_URL=https://your-railway-url.up.railway.app/api
   ```
6. Click "Deploy site"

### Get Your Netlify URL
After deployment, Netlify will provide a URL like:
`https://your-site-name.netlify.app`

---

## Step 4: Update Environment Variables

### Update Frontend (Netlify)
Go to Site settings → Environment variables:
```
API_BASE_URL=https://your-railway-url.up.railway.app/api
```

### Update Backend (Railway)
Go to Project → Variables:
```
FRONTEND_URL=https://your-netlify-site.netlify.app
```

After updating, **redeploy both services**.

---

## Step 5: Update Frontend Config

Create `scripts/config-production.js` with your Railway URL:
```javascript
window.CONFIG = {
    API_BASE_URL: 'https://your-railway-url.up.railway.app/api'
};
```

Then update `index.html`, `admin/index.html`, `admin/login.html`, `worker/login.html` to include:
```html
<script src="/scripts/config-production.js"></script>
```

---

## Step 6: Test Your Deployment

1. **Test Backend Health**:
   ```
   https://your-railway-url.up.railway.app/health
   ```
   Should return: `{"status":"healthy",...}`

2. **Test Frontend**:
   ```
   https://your-netlify-site.netlify.app
   ```
   Should load the homepage

3. **Test Admin Login**:
   ```
   https://your-netlify-site.netlify.app/admin/login.html
   Email: admin@studentevents.com
   Password: admin123
   ```

---

## Quick Commands Summary

```bash
# 1. Commit and push
git add .
git commit -m "Deploy to production"
git push origin main

# 2. Deploy backend (Railway CLI)
cd backend
railway up

# 3. Deploy frontend (Netlify CLI)
netlify deploy --prod

# 4. Check logs
railway logs
netlify logs
```

---

## Troubleshooting

### CORS Errors
- Check `FRONTEND_URL` in Railway matches your Netlify URL
- Ensure Railway backend URL is in Netlify config

### 404 Errors on API Calls
- Verify `API_BASE_URL` in Netlify environment variables
- Check Railway deployment logs for errors

### Database Connection Issues
- Railway provides PostgreSQL add-on if needed
- Current setup uses in-memory storage (data resets on restart)

---

## Next Steps After Deployment

1. **Custom Domain** (Optional):
   - Netlify: Site settings → Domain management
   - Railway: Settings → Domains

2. **Add Database** (Optional):
   - Railway: Add PostgreSQL database
   - Update `DATABASE_URL` environment variable
   - Run migrations

3. **SSL/HTTPS**:
   - Both Netlify and Railway provide free SSL
   - Automatically enabled

---

## Monitoring

- **Railway**: Dashboard → Metrics (CPU, Memory, Network)
- **Netlify**: Analytics → Usage statistics
- **Logs**: Available in both dashboards

---

## Cost Estimate

- **Railway**: Free tier - $5/month for hobby plan
- **Netlify**: Free tier - 100GB bandwidth/month
- **Total**: Free for small projects, ~$5/month for production

---

## Support

If you encounter issues:
1. Check deployment logs in Railway/Netlify
2. Verify environment variables
3. Test API health endpoint
4. Check browser console for errors

