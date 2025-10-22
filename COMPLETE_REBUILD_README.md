# StudentEvents Platform - Complete Rebuild

## 🎉 Project Overview

A comprehensive event management platform built from scratch with three main sections:
- **Admin Panel** - Full event, booking, worker, and system management
- **Worker/Supervisor Panel** - Ticket verification and participant management
- **Public Website** - Event browsing, booking, and ticket purchasing

All data persists in PostgreSQL database with real-time synchronization across all interfaces.

## 📁 Project Structure

```
fuxarterparty-2/
├── backend-new/              # Backend API (Node.js + Express)
│   ├── server.js            # Main server file
│   ├── middleware/          # Authentication middleware
│   ├── routes/              # API endpoints
│   │   ├── auth.js
│   │   ├── events.js
│   │   ├── bookings.js
│   │   ├── workers.js
│   │   ├── settings.js
│   │   ├── policies.js
│   │   └── payments.js
│   ├── services/            # Business logic
│   │   ├── email.js
│   │   └── tickets.js
│   ├── package.json
│   └── env.example
│
├── frontend-new/            # Frontend (HTML/CSS/JavaScript)
│   ├── index.html           # Public homepage
│   ├── event-details.html   # Event details page
│   ├── booking.html         # Booking form
│   ├── payment-instructions.html  # Bank transfer instructions
│   ├── confirmation.html    # Payment success page
│   ├── rules.html           # Rules & policy page
│   ├── contacts.html        # Contact page
│   │
│   ├── admin/               # Admin panel
│   │   ├── login.html
│   │   ├── dashboard.html
│   │   └── js/
│   │       ├── login.js
│   │       └── dashboard.js
│   │
│   ├── worker/              # Worker/Supervisor panel
│   │   ├── login.html
│   │   ├── dashboard.html
│   │   ├── supervisor.html
│   │   └── js/
│   │       ├── login.js
│   │       ├── worker.js
│   │       └── supervisor.js
│   │
│   ├── styles/              # Global styles
│   │   └── main.css
│   │
│   └── js/                  # Shared JavaScript
│       ├── config.js
│       ├── utils.js
│       ├── home.js
│       ├── event-details.js
│       ├── booking.js
│       ├── payment-instructions.js
│       ├── confirmation.js
│       ├── rules.js
│       └── contacts.js
│
└── database/                # Database schema and seeds
    ├── schema.sql
    └── seed.sql
```

## 🚀 Technology Stack

- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL (Supabase)
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Authentication**: JWT tokens
- **Payments**: Stripe API + Manual Bank Transfer
- **Email**: SendGrid
- **PDF Generation**: PDFKit + QRCode
- **Deployment**: Railway (backend) + Netlify (frontend)

## 🔧 Setup Instructions

### 1. Database Setup (Supabase)

1. Create a Supabase project at https://supabase.com
2. Go to SQL Editor and run `database/schema.sql`
3. Run `database/seed.sql` to create default admin and settings
4. Copy your database connection string (pooler connection recommended)

### 2. Backend Setup

```bash
cd backend-new
npm install
cp env.example .env
```

Edit `.env` file with your credentials:

```env
# Server
PORT=3001
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this

# SendGrid (Email)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=StudentEvents

# Stripe (Payment)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Frontend URL
FRONTEND_URL=https://yourdomain.netlify.app
```

Start the backend:

```bash
npm start
# or for development with auto-restart:
npm run dev
```

### 3. Frontend Setup

1. Update `frontend-new/js/config.js`:

```javascript
const API_BASE_URL = 'https://your-backend.railway.app';
```

2. Test locally:
   - Open `frontend-new/index.html` in a browser
   - Or use a local server: `python -m http.server 8000`

## 🌐 Deployment

### Backend Deployment (Railway)

1. Create Railway account at https://railway.app
2. Create new project from GitHub repo
3. Select `backend-new` folder as root directory
4. Add all environment variables from `.env`
5. Deploy!

Railway will automatically:
- Install dependencies
- Run `npm start`
- Provide a public URL (e.g., `your-app.railway.app`)

### Frontend Deployment (Netlify)

1. Create Netlify account at https://netlify.com
2. Connect your GitHub repository
3. Configure build settings:
   - **Base directory**: `frontend-new`
   - **Publish directory**: `frontend-new` (or `.` if base is set)
4. Add environment variable:
   - Key: `API_BASE_URL`
   - Value: Your Railway backend URL
5. Deploy!

Update `frontend-new/js/config.js` with your production backend URL before deploying.

## 📊 Database Schema

### Tables

- **admin** - Admin user credentials
- **events** - Event information (name, date, location, price, etc.)
- **bookings** - Ticket bookings and participant information
- **workers** - Worker/supervisor accounts
- **settings** - System configuration (payment methods, contact info, etc.)
- **policies** - Terms, privacy policy, rules content

See `database/schema.sql` for complete schema.

## 🔐 Authentication

### Admin Login
- URL: `/admin/login.html`
- Default credentials (from seed.sql):
  - Email: `admin@studentevents.com`
  - Password: `Admin123!`

### Worker/Supervisor Login
- URL: `/worker/login.html`
- Test accounts (from seed.sql):
  - Worker: `worker@test.com` / `Worker123!`
  - Supervisor: `supervisor@test.com` / `Supervisor123!`

**⚠️ Change these passwords immediately in production!**

## 📋 Features Implemented

### Admin Panel ✅
- ✅ Authentication (login/logout)
- ✅ Dashboard with stats
- ✅ Events Management (CRUD, search, export)
- ✅ Bookings Management (CRUD, search, confirm payment, export)
- ✅ Workers Management (CRUD, role assignment)
- ✅ Settings (payment methods, bank details, contacts, organization)
- ✅ Data management (backup & reset)

### Worker Panel ✅
- ✅ Authentication (login/logout)
- ✅ Ticket verification (QR scan / manual search)
- ✅ Participant lookup
- ✅ Payment status validation

### Supervisor Panel ✅
- ✅ All worker features
- ✅ Full participant list for assigned event
- ✅ Manual payment confirmation
- ✅ Export participants

### Public Website ✅
- ✅ Homepage with event list
- ✅ Event details page
- ✅ Booking flow with multiple attendees
- ✅ Payment methods (Stripe + Bank Transfer)
- ✅ Confirmation page with ticket download
- ✅ Rules & Policy page
- ✅ Contacts page

### Backend API ✅
- ✅ RESTful API with all CRUD endpoints
- ✅ JWT authentication & authorization
- ✅ Database connection pooling
- ✅ Error handling & logging
- ✅ CORS configuration
- ✅ Email service (SendGrid)
- ✅ PDF ticket generation with QR codes
- ✅ Stripe payment integration
- ✅ Bank transfer reference generation

## 🧪 Testing

### Local Testing

1. **Backend**:
   ```bash
   cd backend-new
   npm start
   # Server runs on http://localhost:3001
   ```

2. **Frontend**:
   ```bash
   cd frontend-new
   python -m http.server 8000
   # Open http://localhost:8000
   ```

3. **Test Flow**:
   - Browse events on homepage
   - Select event and book tickets
   - Choose payment method
   - Verify email delivery
   - Test admin panel (manage events, bookings, workers)
   - Test worker panel (verify tickets)

### Production Testing

After deployment, test:
1. ✅ Event browsing
2. ✅ Booking creation
3. ✅ Stripe payment flow
4. ✅ Bank transfer flow
5. ✅ Email delivery
6. ✅ Ticket PDF generation
7. ✅ Admin login and CRUD operations
8. ✅ Worker ticket verification
9. ✅ Supervisor payment confirmation

## 📧 Email Configuration

The system sends emails for:
- Booking confirmations
- Ticket delivery (with PDF attachment)
- Payment confirmations

Configure SendGrid in backend `.env`:
```env
SENDGRID_API_KEY=your_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

## 💳 Payment Configuration

### Stripe
1. Get API keys from https://dashboard.stripe.com/test/apikeys
2. Add to backend `.env`
3. Configure webhook for payment confirmations

### Manual Bank Transfer
1. Admin configures bank details in Settings page
2. System generates unique reference codes per booking
3. Admin manually confirms payments in Bookings page

## 📱 API Endpoints

### Public Endpoints
- `GET /api/events` - List all events
- `GET /api/events/:id` - Get event details
- `POST /api/bookings` - Create booking
- `POST /api/payments/create-checkout` - Create Stripe session
- `GET /api/settings` - Get public settings
- `GET /api/policies` - Get policies

### Admin Endpoints (requires JWT)
- `POST /api/admin/login` - Admin login
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/bookings/:id/confirm` - Confirm payment
- `POST /api/workers` - Create worker
- `PUT /api/settings` - Update settings

### Worker Endpoints (requires JWT)
- `POST /api/worker/login` - Worker login
- `POST /api/workers/verify-ticket` - Verify ticket
- `GET /api/workers/assigned-participants` - Get participants (supervisor only)

See `backend-new/routes/` for complete API documentation.

## 🛠️ Maintenance

### Database Backups
- Regular backups through Supabase dashboard
- Manual backup via Admin Settings → Data Management

### Monitoring
- Check Railway logs for backend errors
- Monitor Netlify deployment status
- Track SendGrid email delivery rates

### Updates
1. Update dependencies: `npm update`
2. Test locally
3. Commit changes
4. Push to GitHub
5. Railway/Netlify auto-deploy

## 🐛 Troubleshooting

### Backend won't start
- Check DATABASE_URL is correct
- Verify all environment variables are set
- Check Railway logs for errors

### Frontend can't connect to backend
- Verify API_BASE_URL in config.js
- Check CORS settings in backend
- Verify backend is running

### Emails not sending
- Check SendGrid API key
- Verify sender email is verified in SendGrid
- Check SendGrid activity logs

### Database connection errors
- Use Supabase pooler connection string
- Check connection limits
- Verify database credentials

## 📝 To-Do / Future Enhancements

- [ ] QR code scanner (camera integration)
- [ ] Email templates customization
- [ ] Multi-language support
- [ ] Analytics dashboard
- [ ] Mobile app
- [ ] Automated tests
- [ ] Redis caching
- [ ] Rate limiting
- [ ] Image upload to cloud storage
- [ ] Advanced search filters

## 📄 License

MIT License - see LICENSE file for details

## 👥 Support

For questions or support:
- Email: support@studentevents.com
- Documentation: This README
- GitHub Issues: [repository]/issues

---

**Built with ❤️ for StudentEvents Platform**

