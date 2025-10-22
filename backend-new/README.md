# StudentEvents Backend API v2.0.0

Complete rebuild of the backend API with full database integration.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (Supabase recommended)
- npm or yarn

### Installation

```bash
cd backend-new
npm install
```

### Configuration

1. Copy `env.example` to `.env`
2. Update environment variables:
   - `DATABASE_URL` - PostgreSQL connection string
   - `JWT_SECRET` - Secret key for JWT tokens
   - `SENDGRID_API_KEY` - SendGrid API key for emails
   - `STRIPE_SECRET_KEY` - Stripe secret key for payments

### Database Setup

```bash
# Run schema creation
psql $DATABASE_URL < ../database/schema.sql

# Run seed data
psql $DATABASE_URL < ../database/seed.sql
```

### Start Server

```bash
npm start
```

Server will start on http://localhost:3001

## 📚 API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/worker/login` - Worker/supervisor login

### Events (Public & Admin)
- `GET /api/events` - List all events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (admin)
- `PUT /api/events/:id` - Update event (admin)
- `DELETE /api/events/:id` - Delete event (admin)
- `GET /api/events/export/all` - Export events (admin)

### Bookings
- `GET /api/bookings` - List bookings (admin)
- `GET /api/bookings/search?q=query` - Search bookings (admin)
- `GET /api/bookings/:id` - Get booking
- `POST /api/bookings` - Create booking (public)
- `PUT /api/bookings/:id` - Update booking (admin)
- `DELETE /api/bookings/:id` - Delete booking (admin)
- `POST /api/bookings/:id/confirm` - Confirm payment (admin)
- `GET /api/bookings/export/:event_id` - Export participants (admin)

### Workers
- `GET /api/workers` - List workers (admin)
- `GET /api/workers/:id` - Get worker (admin)
- `POST /api/workers` - Create worker (admin)
- `PUT /api/workers/:id` - Update worker (admin)
- `DELETE /api/workers/:id` - Delete worker (admin)
- `POST /api/workers/verify-ticket` - Verify ticket (worker/supervisor)
- `GET /api/workers/export/all` - Export workers (admin)

### Settings
- `GET /api/settings` - Get all settings
- `GET /api/settings/:key` - Get specific setting
- `PUT /api/settings` - Update settings (admin)
- `POST /api/settings/reset` - Reset system (admin)

### Policies
- `GET /api/policies` - Get all policies
- `GET /api/policies/:type` - Get specific policy
- `PUT /api/policies/:type` - Update policy (admin)
- `GET /api/policies/:type/pdf` - Download policy as PDF

### Payments
- `POST /api/payments/create-checkout-session` - Create Stripe session
- `POST /api/payments/webhook` - Stripe webhook handler
- `GET /api/payments/bank-details` - Get bank transfer details

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Get token from login endpoints:
- Admin: `POST /api/admin/login`
- Worker: `POST /api/worker/login`

## 📦 Project Structure

```
backend-new/
├── server.js              # Main server file
├── middleware/
│   └── auth.js           # Authentication middleware
├── routes/
│   ├── auth.js           # Login endpoints
│   ├── events.js         # Events CRUD
│   ├── bookings.js       # Bookings management
│   ├── workers.js        # Workers management
│   ├── settings.js       # System settings
│   ├── policies.js       # Policy content
│   └── payments.js       # Payment processing
├── services/
│   ├── email.js          # Email sending
│   └── tickets.js        # PDF ticket generation
└── package.json
```

## 🗄️ Database Schema

See `../database/schema.sql` for complete schema definition.

### Main Tables:
- `admin` - Administrator accounts
- `events` - Event information
- `bookings` - Ticket bookings
- `workers` - Worker/supervisor accounts
- `settings` - System configuration
- `policies` - Policy content

## 🚀 Deployment

### Railway
1. Connect GitHub repository
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

### Environment Variables (Production)
```
NODE_ENV=production
PORT=3001
DATABASE_URL=<postgresql-connection-string>
JWT_SECRET=<strong-secret-key>
SENDGRID_API_KEY=<sendgrid-api-key>
SENDGRID_FROM_EMAIL=<verified-email>
STRIPE_SECRET_KEY=<stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<webhook-secret>
FRONTEND_URL=<netlify-frontend-url>
```

## 📧 Email Configuration

Uses SendGrid for email delivery:
- Booking confirmations
- Ticket delivery with PDF attachments
- Payment notifications

Configure:
1. Create SendGrid account
2. Verify sender email
3. Get API key
4. Set environment variables

## 💳 Payment Integration

### Stripe
- Checkout sessions for card payments
- Webhook for payment confirmation
- Automatic booking status updates

### Bank Transfer
- Manual payment with reference codes
- 24-hour payment deadline
- Admin confirmation required

## 🔧 Development

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## 📝 API Testing

Use tools like:
- Postman
- Insomnia
- curl

Example:
```bash
# Health check
curl http://localhost:3001/health

# Get events
curl http://localhost:3001/api/events

# Admin login
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@studentevents.com","password":"admin123"}'
```

## 🐛 Troubleshooting

### Database Connection Errors
- Verify `DATABASE_URL` is correct
- Check database is accessible
- Ensure SSL settings match database requirements

### Authentication Errors
- Check `JWT_SECRET` is set
- Verify token is included in Authorization header
- Check token hasn't expired

### Email Not Sending
- Verify SendGrid API key is valid
- Check sender email is verified in SendGrid
- Review SendGrid logs for errors

## 📄 License

MIT

## 👥 Support

For issues or questions:
- Email: support@studentevents.com
- GitHub Issues: [repository-url]


