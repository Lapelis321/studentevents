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

## 🚀 Quick Start - Get Online in 15 Minutes!

**Want to deploy immediately?** Follow our [Quick Deploy Guide](QUICK_DEPLOY.md)

For detailed setup instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)

## 🛠️ Technology Stack

### Frontend
- **HTML5/CSS3/JavaScript** - Modern vanilla JS approach
- **Responsive Design** - Mobile-first design
- **Progressive Web App** features

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
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
│   ├── 📁 src/             # TypeScript source code
│   ├── 📁 dist/            # Compiled JavaScript
│   ├── 📄 package.json     # Backend dependencies
│   └── 📄 railway.json     # Railway deployment config
├── 📁 scripts/             # Frontend JavaScript
├── 📁 styles/              # CSS stylesheets
├── 📁 admin/               # Admin dashboard
├── 📁 worker/              # Worker interface
├── 📄 index.html           # Homepage
├── 📄 netlify.toml         # Netlify deployment config
├── 📄 QUICK_DEPLOY.md      # 15-minute deployment guide
└── 📄 DEPLOYMENT.md        # Detailed deployment guide
```

## 🎯 Live Demo

- **Homepage**: [Your deployed site URL]
- **Admin Panel**: [Your site]/admin/
- **Worker Interface**: [Your site]/worker/

### Demo Accounts (after deployment)
- **Admin**: admin@studentevents.com / admin123
- **Worker**: john.worker@studentevents.com / worker123

## 🔧 Local Development

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL (or use Supabase)

### Setup
1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd studentevents
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your actual values
   ```

4. **Run database migrations**
   ```bash
   npm run seed
   ```

5. **Start development servers**
   ```bash
   # Backend (Terminal 1)
   npm run dev

   # Frontend (Terminal 2)
   cd ..
   python -m http.server 8000
   ```

6. **Open in browser**
   - Frontend: http://localhost:8000
   - Backend API: http://localhost:3001

## 🚀 Deployment

### Quick Deployment (15 minutes)
Follow our [Quick Deploy Guide](QUICK_DEPLOY.md) for the fastest way to get online.

### Automated Deployment
```bash
# Deploy everything
npm run deploy

# Deploy backend only
npm run deploy:backend

# Deploy frontend only
npm run deploy:frontend
```

### Manual Deployment
See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Event Endpoints
- `GET /api/events` - Get all active events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create event (Admin only)
- `PUT /api/events/:id` - Update event (Admin only)

### Ticket Endpoints
- `POST /api/tickets/purchase` - Purchase tickets
- `GET /api/tickets/my-tickets` - Get user's tickets
- `POST /api/tickets/validate` - Validate ticket (Worker only)

### Full API documentation available at `/api/docs` (when deployed)

## 🔐 Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** with bcrypt
- **CORS Protection** configured for your domain
- **Rate Limiting** to prevent abuse
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
- Uptime monitoring (via UptimeRobot)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [Quick Deploy Guide](QUICK_DEPLOY.md) - Get online in 15 minutes
- [Deployment Guide](DEPLOYMENT.md) - Detailed deployment instructions

### Getting Help
- Check the [Issues](../../issues) page
- Review the troubleshooting sections in our guides
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

**🚀 Ready to get started?** Follow our [Quick Deploy Guide](QUICK_DEPLOY.md) and have your event ticketing system online in just 15 minutes!

**⭐ If this project helped you, please give it a star on GitHub!**