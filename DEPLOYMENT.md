# 🚀 Deployment Guide - StudentEvents

This guide will help you deploy your StudentEvents application to make it always online.

## 📋 Prerequisites

Before deploying, you'll need accounts for:
- [Supabase](https://supabase.com) (Database)
- [Railway](https://railway.app) or [Render](https://render.com) (Backend hosting)
- [Netlify](https://netlify.com) or [Vercel](https://vercel.com) (Frontend hosting)
- [Stripe](https://stripe.com) (Payments)
- [SendGrid](https://sendgrid.com) (Email - optional)

## 🗄️ Step 1: Set Up Database (Supabase)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (2-3 minutes)
3. Go to Settings > Database and copy:
   - Database URL
   - Project URL
   - API Keys (anon public and service_role)

## 🔧 Step 2: Configure Environment Variables

### Backend Environment Variables

Create a `.env` file in the `backend` directory with these values:

```bash
# Copy from .env.production template and fill in real values
NODE_ENV=production
PORT=3001

# Supabase (from Step 1)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]

# Generate a strong JWT secret (use a password generator)
JWT_SECRET=[STRONG-RANDOM-STRING-HERE]

# Stripe (get from stripe.com dashboard)
STRIPE_SECRET_KEY=sk_live_[YOUR-LIVE-KEY]
STRIPE_PUBLISHABLE_KEY=pk_live_[YOUR-LIVE-KEY]
STRIPE_WEBHOOK_SECRET=whsec_[YOUR-WEBHOOK-SECRET]

# SendGrid (optional - for emails)
SENDGRID_API_KEY=SG.[YOUR-API-KEY]
FROM_EMAIL=noreply@yourdomain.com

# Will be updated after frontend deployment
FRONTEND_URL=https://yourdomain.netlify.app
```

## 🚀 Step 3: Deploy Backend

### Option A: Railway (Recommended)

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login and deploy:
   ```bash
   cd backend
   railway login
   railway init
   railway up
   ```

3. Set environment variables in Railway dashboard
4. Your backend will be available at: `https://[project-name].railway.app`

### Option B: Render

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add all environment variables in Render dashboard

## 🌐 Step 4: Deploy Frontend

### Option A: Netlify (Recommended)

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Update `scripts/config.js` with your backend URL:
   ```javascript
   return 'https://your-actual-backend-domain.railway.app/api';
   ```

3. Deploy:
   ```bash
   netlify deploy --prod --dir=.
   ```

### Option B: Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Update `vercel.json` with your backend URL
3. Deploy:
   ```bash
   vercel --prod
   ```

## 🔄 Step 5: Update Configuration

1. **Update Backend CORS**: Update `FRONTEND_URL` in your backend environment variables with your actual frontend domain

2. **Update Frontend API URL**: Update `scripts/config.js` with your actual backend domain

3. **Set up Stripe Webhooks**: 
   - Go to Stripe Dashboard > Webhooks
   - Add endpoint: `https://your-backend-domain.railway.app/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`

## 🛡️ Step 6: Security & Performance

### SSL Certificate
- Both Netlify/Vercel and Railway/Render provide free SSL certificates automatically

### Environment Variables Security
- Never commit `.env` files to Git
- Use your hosting platform's environment variable settings
- Rotate secrets regularly

### Performance Optimization
- Enable gzip compression (automatic on most platforms)
- Use CDN (automatic on Netlify/Vercel)
- Monitor performance with built-in analytics

## 📊 Step 7: Monitoring & Maintenance

### Uptime Monitoring
Set up [UptimeRobot](https://uptimerobot.com) (free) to monitor your site:
- Monitor your frontend URL
- Monitor your backend health endpoint: `/health`
- Set up email alerts for downtime

### Error Monitoring
Consider adding [Sentry](https://sentry.io) for error tracking:
```javascript
// Add to your main.js
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN"
});
```

## 🚨 Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure `FRONTEND_URL` in backend matches your frontend domain exactly

2. **Database Connection**: Check your `DATABASE_URL` format and ensure your hosting service allows external connections

3. **Environment Variables**: Double-check all environment variables are set correctly in your hosting dashboard

4. **Build Failures**: Check build logs in your hosting platform dashboard

### Health Checks:

- Backend health: `https://your-backend-domain.railway.app/health`
- Frontend: Should load your homepage
- API test: `https://your-backend-domain.railway.app/api/events`

## 📞 Support

If you encounter issues:
1. Check the hosting platform's documentation
2. Review build logs in your hosting dashboard
3. Test locally first to ensure everything works
4. Check environment variables are correctly set

## 🎉 Success!

Once deployed, your website will be:
- ✅ Always online (99.9% uptime)
- ✅ Automatically backed up
- ✅ Secured with HTTPS
- ✅ Globally distributed via CDN
- ✅ Automatically updated when you push code changes

Your live URLs will be:
- Frontend: `https://your-site-name.netlify.app`
- Backend API: `https://your-backend-name.railway.app/api`

## 🔄 Continuous Deployment

Both platforms support automatic deployment from Git:
- Push to your main branch
- Automatic build and deployment
- Zero downtime deployments
- Rollback capability if needed
