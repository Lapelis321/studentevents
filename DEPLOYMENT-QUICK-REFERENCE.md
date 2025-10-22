# 🎯 Deployment Quick Reference Card

## 📋 Checklist

- [ ] Supabase account created
- [ ] Railway account created  
- [ ] Netlify account created
- [ ] SendGrid account created
- [ ] Database schema deployed
- [ ] Database seed data deployed
- [ ] Backend deployed to Railway
- [ ] Environment variables configured
- [ ] Frontend API URL updated
- [ ] Frontend deployed to Netlify
- [ ] CORS updated with Netlify URL
- [ ] Admin login tested
- [ ] Public booking tested
- [ ] Email delivery tested
- [ ] Default passwords changed

---

## 🔗 Quick Links

| Service | Purpose | URL |
|---------|---------|-----|
| Supabase | Database | https://app.supabase.com |
| Railway | Backend API | https://railway.app |
| Netlify | Frontend | https://app.netlify.com |
| SendGrid | Email | https://app.sendgrid.com |
| Stripe | Payments | https://dashboard.stripe.com |

---

## 📂 Files to Use

| Step | File | Purpose |
|------|------|---------|
| Database Schema | `database/schema.sql` | Copy to Supabase SQL Editor |
| Database Seed | `database/seed.sql` | Copy to Supabase SQL Editor |
| Backend Config | `backend-new/env.example` | Reference for environment variables |
| Frontend Config | `frontend-new/js/config.js` | Update API_BASE_URL |

---

## 🔑 Default Credentials (CHANGE AFTER DEPLOYMENT!)

| Account | Email | Password |
|---------|-------|----------|
| Admin | admin@studentevents.com | Admin123! |
| Worker | worker@test.com | Worker123! |
| Supervisor | supervisor@test.com | Supervisor123! |

---

## 🚀 Deployment Order

1. **Supabase** (Database)
   - Run `schema.sql`
   - Run `seed.sql`
   - Copy connection string

2. **Railway** (Backend)
   - Set root directory: `backend-new`
   - Add environment variables
   - Generate domain
   - Copy Railway URL

3. **Netlify** (Frontend)
   - Update `config.js` with Railway URL
   - Commit and push
   - Set base directory: `frontend-new`
   - Deploy
   - Copy Netlify URL

4. **Update Backend**
   - Set `FRONTEND_URL` in Railway to Netlify URL

---

## 🔧 Environment Variables (Railway)

```env
PORT=3001
NODE_ENV=production
DATABASE_URL=<from Supabase>
JWT_SECRET=<generate random 32+ chars>
SENDGRID_API_KEY=<from SendGrid>
SENDGRID_FROM_EMAIL=<your verified email>
SENDGRID_FROM_NAME=StudentEvents
STRIPE_SECRET_KEY=<from Stripe>
STRIPE_PUBLISHABLE_KEY=<from Stripe>
STRIPE_WEBHOOK_SECRET=<after webhook setup>
FRONTEND_URL=<your Netlify URL>
```

---

## 🧪 Testing Checklist

**Public Site:**
- [ ] Homepage loads
- [ ] Event details page works
- [ ] Booking form submits
- [ ] Stripe payment works (test card: 4242 4242 4242 4242)
- [ ] Confirmation page shows
- [ ] Email received with PDF

**Admin Panel:**
- [ ] Login works
- [ ] Can create event
- [ ] Can view bookings
- [ ] Can confirm payment
- [ ] Can create worker

**Worker Panel:**
- [ ] Login works
- [ ] Can search ticket
- [ ] Shows correct status

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend won't start | Check DATABASE_URL and Railway logs |
| Frontend can't connect | Check API_BASE_URL in config.js |
| CORS error | Update FRONTEND_URL in Railway |
| No emails | Check SendGrid API key and sender verification |
| Database error | Verify connection string format (use pooler port 6543) |
| Login doesn't work | Check JWT_SECRET is set in Railway |

---

## 📊 Your URLs (Fill in after deployment)

- **Database**: `postgresql://postgres.xxxxx:password@....pooler.supabase.com:6543/postgres`
- **Backend API**: `https://________________________.up.railway.app`
- **Frontend**: `https://________________________.netlify.app`
- **Admin Panel**: `https://________________________.netlify.app/admin/login.html`
- **Worker Panel**: `https://________________________.netlify.app/worker/login.html`

---

## 💰 Cost Estimate

| Service | Plan | Cost |
|---------|------|------|
| Supabase | Free | $0 |
| Railway | Hobby | $5/month |
| Netlify | Free | $0 |
| SendGrid | Free (100/day) | $0 |
| Stripe | Pay per transaction | Free to start |
| **TOTAL** | | **$5/month** |

---

## ⏱️ Time Estimate

| Step | Time |
|------|------|
| Database setup | 10 min |
| Backend deployment | 15 min |
| Frontend deployment | 10 min |
| Testing & config | 10 min |
| **TOTAL** | **45 min** |

---

## 🎯 Success Criteria

✅ Homepage displays events  
✅ Can create booking and complete payment  
✅ Receive confirmation email with PDF ticket  
✅ Admin can login and manage events  
✅ Worker can verify tickets  

---

*For detailed instructions, see: `DEPLOY-NOW.md`*

