# 🎫 StudentEvents - Event Ticketing System

A modern, full-stack event ticketing platform designed for student organizations and educational institutions.

## 🌟 Features

- **Event Management**: Create, update, and manage events
- **Ticket Sales**: Secure online ticket purchasing with Stripe
- **User Authentication**: JWT-based authentication system
- **QR Code Tickets**: Digital tickets with QR codes for validation
- **Worker Dashboard**: Staff interface for ticket validation
- **Admin Panel**: Complete administrative control
- **Email Notifications**: Automated email confirmations
- **Mobile Responsive**: Works perfectly on all devices
- **Real-time Updates**: Live ticket availability updates

## 🌐 Live Deployment

### Production URLs
- **Frontend**: https://afterstateevents.netlify.app
- **Backend API**: https://studentevents-production.up.railway.app
- **Admin Panel**: https://afterstateevents.netlify.app/admin
- **Worker Panel**: https://afterstateevents.netlify.app/worker

### Deployment Status
- ✅ **Backend (Railway)**: Fully operational
- ⚠️ **Frontend (Netlify)**: Requires manual deployment trigger

**See [DEPLOYMENT_STATUS_REPORT.md](./DEPLOYMENT_STATUS_REPORT.md) for detailed deployment information.**

## 🚀 Quick Start
### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL (or use Supabase)

### Local Development Setup

1. **Clone and setup environment**
   ```bash
   git clone <your-repo-url>
   cd studentevents
   node setup-environment.js
   ```

2. **Configure environment variables**
   ```bash
   # Copy and edit the environment file
   cp backend/env.example backend/.env
   # Edit backend/.env with your actual API keys
   ```

3. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Start development servers**
   ```bash
   # Backend (Terminal 1)
   cd backend
   npm start

   # Frontend (Terminal 2)
   python -m http.server 8000
   ```

5. **Open in browser**
   - Frontend: http://localhost:8000
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/health

## 🛠️ Technology Stack

### Frontend
- **HTML5/CSS3/JavaScript** - Modern vanilla JS approach
- **Responsive Design** - Mobile-first design
- **Progressive Web App** features

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database (via Supabase)
- **JWT** authentication
- **Stripe** payment processing
- **SendGrid** email service
- **QR Code** generation

### Hosting & Deployment
- **Railway** - Backend hosting
- **Netlify** - Frontend hosting
- **Supabase** - Database hosting
- **Automatic HTTPS** and CDN

## 📁 Project Structure

```
studentevents/
├── 📁 backend/              # Node.js API server
│   ├── 📄 railway-server.js # Main server file
│   ├── 📄 package.json      # Backend dependencies
│   ├── 📄 railway.json      # Railway deployment config
│   ├── 📄 Procfile          # Heroku deployment config
│   └── 📄 env.example       # Environment variables template
├── 📁 scripts/              # Frontend JavaScript
├── 📁 styles/               # CSS stylesheets
├── 📁 admin/                # Admin dashboard
├── 📁 worker/               # Worker interface
├── 📄 index.html            # Homepage
├── 📄 netlify.toml          # Netlify deployment config
└── 📄 setup-environment.js  # Environment setup script
```

## 🎯 Live Demo

- **Homepage**: [Your deployed site URL]
- **Admin Panel**: [Your site]/admin/
- **Worker Interface**: [Your site]/worker/

### Demo Accounts
- **Admin**: admin@studentevents.com / admin123
- **Worker**: john.worker@studentevents.com / worker123

## 🚀 Deployment

### Backend Deployment (Railway)

1. **Connect to Railway**
   ```bash
   cd backend
   railway login
   railway up
   ```

2. **Set environment variables in Railway dashboard**
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://your-netlify-url.netlify.app`
   - `DATABASE_URL=your-supabase-connection-string`
   - `JWT_SECRET=your-secret-key`
   - `STRIPE_SECRET_KEY=your-stripe-key`

### Frontend Deployment (Netlify)

1. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop your project folder
   - Wait for deployment

2. **Update API configuration**
   - Edit `scripts/config.js`
   - Update `API_BASE_URL` with your Railway URL

### Database Setup (Supabase)

1. **Create Supabase project**
2. **Run SQL setup script**
   ```sql
   -- Copy contents from backend/supabase-setup.sql
   ```
3. **Get connection string**
4. **Update Railway environment variables**

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/admin/login` - Admin login
- `POST /api/worker/login` - Worker login

### Event Endpoints
- `GET /api/events` - Get all active events
- `GET /api/events/:id` - Get event by ID

### Health Check
- `GET /health` - Server health status
- `GET /api/health` - API health status

## 🔐 Security Features

- **JWT Authentication** with secure token handling
- **CORS Protection** configured for your domain
- **Input Validation** and sanitization
- **HTTPS Enforcement** in production
- **Environment Variable** protection

## 🎨 Customization

### Branding
- Update colors in `styles/main.css`
- Replace logo and images
- Modify text content in HTML files

### Features
- Add new event types
- Customize ticket validation flow
- Integrate additional payment methods
- Add social media sharing

## 📊 Analytics & Monitoring

### Built-in Analytics
- Event attendance tracking
- Revenue reporting
- User registration metrics
- Ticket sales analytics

### Monitoring
- Health check endpoints
- Error logging
- Performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

### Getting Help
- Check the [Issues](../../issues) page
- Review the troubleshooting sections
- Contact the development team

### Common Issues
- **CORS Errors**: Check FRONTEND_URL environment variable
- **Database Issues**: Verify DATABASE_URL and run migrations
- **Payment Issues**: Confirm Stripe keys and webhook setup

## 🎉 Success Stories

This system has been successfully deployed by:
- University student organizations
- Educational institutions
- Community event organizers
- Non-profit organizations

---

**🚀 Ready to get started?** Run `node setup-environment.js` and have your event ticketing system running locally in just 5 minutes!

**⭐ If this project helped you, please give it a star on GitHub!**