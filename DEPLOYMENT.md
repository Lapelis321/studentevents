# 🚀 Deployment Guide

## Quick Deployment (15 minutes)

### Step 1: Backend Deployment (Railway)

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy to Railway**
   ```bash
   cd backend
   railway login
   railway up
   ```

3. **Set environment variables in Railway dashboard**
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://your-netlify-url.netlify.app`
   - `DATABASE_URL=your-supabase-connection-string`
   - `JWT_SECRET=your-secret-key`
   - `STRIPE_SECRET_KEY=your-stripe-key`

### Step 2: Frontend Deployment (Netlify)

1. **Go to [netlify.com](https://netlify.com)**
2. **Sign up with GitHub**
3. **Click "Add new site" → "Deploy manually"**
4. **Drag and drop your entire project folder**
5. **Wait for deployment (1-2 minutes)**

### Step 3: Database Setup (Supabase)

1. **Go to [supabase.com](https://supabase.com)**
2. **Create new project**
3. **Go to SQL Editor**
4. **Run the setup script from `backend/supabase-setup.sql`**
5. **Copy the connection string**
6. **Add to Railway environment variables**

### Step 4: Connect Frontend to Backend

1. **Get your Railway URL** (e.g., `https://your-app.railway.app`)
2. **Update `scripts/config.js`**
   ```javascript
   // Change this line:
   return window.API_BASE_URL || 'https://your-railway-url.up.railway.app/api';
   ```
3. **Redeploy to Netlify**

## Environment Variables

### Required for Production

```bash
# Server
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://username:password@db.supabase.co:5432/postgres

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# Stripe
STRIPE_SECRET_KEY=sk_live_your_live_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_key

# Frontend
FRONTEND_URL=https://your-netlify-url.netlify.app
```

## Testing Your Deployment

### Health Checks
- Backend: `https://your-railway-url.railway.app/health`
- Frontend: `https://your-netlify-url.netlify.app`

### Admin Access
- URL: `https://your-netlify-url.netlify.app/admin/`
- Login: admin@studentevents.com / admin123

### Worker Access
- URL: `https://your-netlify-url.netlify.app/worker/`
- Login: john.worker@studentevents.com / worker123

## Troubleshooting

### Common Issues

**CORS Errors**
- Make sure `FRONTEND_URL` in Railway matches your Netlify URL exactly

**API Not Found**
- Check your backend URL in `scripts/config.js`
- Make sure Railway deployment succeeded

**Site Not Loading**
- Check Netlify deployment logs
- Make sure all files were uploaded

**Database Connection Issues**
- Verify `DATABASE_URL` is correct
- Check Supabase project is active
- Run the SQL setup script

## Success Checklist

- ✅ Railway backend deployed with environment variables
- ✅ Netlify frontend deployed
- ✅ Supabase database configured
- ✅ CORS configured (FRONTEND_URL matches Netlify URL)
- ✅ API endpoints working
- ✅ Website loads and shows events
- ✅ Admin login works
- ✅ Worker login works

## Next Steps

1. **Customize branding** - Update colors, logos, text
2. **Add real events** - Replace sample data with your events
3. **Set up real Stripe keys** - For production payments
4. **Configure email** - Set up SendGrid for notifications
5. **Go live** - Start selling tickets!

---

**🎉 Congratulations! Your event ticketing system is now live and ready to use!**