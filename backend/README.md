# StudentEvents Backend API

A comprehensive backend API for a Student Event Ticketing Website built with Node.js, Express, TypeScript, and Supabase PostgreSQL.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (Admin, Worker, User)
- **Event Management**: Create, update, delete, and manage events
- **Ticket System**: Purchase tickets, generate QR codes, validate tickets
- **Payment Processing**: Stripe integration with webhooks
- **Email Service**: SendGrid integration for ticket delivery
- **Google Sheets Integration**: Automatic data synchronization
- **PDF Generation**: Generate ticket PDFs with QR codes
- **Worker Management**: Assign workers to events for ticket validation
- **Real-time Validation**: QR code scanning and ticket validation

## 🛠 Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: Supabase PostgreSQL
- **Authentication**: JWT + bcryptjs
- **Payments**: Stripe
- **Email**: SendGrid
- **PDF Generation**: PDFKit
- **QR Codes**: qrcode
- **Google Sheets**: googleapis
- **Security**: Helmet, CORS

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # Database configuration and initialization
│   ├── controllers/
│   │   ├── authController.ts    # Authentication endpoints
│   │   ├── eventController.ts   # Event management endpoints
│   │   ├── ticketController.ts  # Ticket operations endpoints
│   │   ├── workerController.ts  # Worker management endpoints
│   │   └── webhookController.ts # Stripe webhook handlers
│   ├── middleware/
│   │   └── auth.ts              # Authentication and authorization middleware
│   ├── models/
│   │   ├── User.ts              # User model and database operations
│   │   ├── Event.ts             # Event model and database operations
│   │   ├── Ticket.ts            # Ticket model and database operations
│   │   └── Worker.ts            # Worker model and database operations
│   ├── routes/
│   │   ├── auth.ts              # Authentication routes
│   │   ├── events.ts            # Event routes
│   │   ├── tickets.ts           # Ticket routes
│   │   ├── workers.ts           # Worker routes
│   │   └── webhooks.ts          # Webhook routes
│   ├── services/
│   │   ├── emailService.ts      # SendGrid email service
│   │   ├── googleSheetsService.ts # Google Sheets integration
│   │   └── stripeService.ts     # Stripe payment service
│   ├── utils/
│   │   ├── pdfGenerator.ts      # PDF ticket generation
│   │   └── qrGenerator.ts       # QR code generation
│   ├── scripts/
│   │   └── seed.ts              # Database seeding script
│   └── index.ts                 # Main application entry point
├── env.example                  # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Setup Instructions

### 1. Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account and project
- Stripe account (for payments)
- SendGrid account (for emails)
- Google Cloud account (for Sheets integration)

### 2. Installation

```bash
# Clone the repository
git clone <repository-url>
cd backend

# Install dependencies
npm install

# Copy environment variables
cp env.example .env
```

### 3. Environment Configuration

Edit the `.env` file with your actual credentials:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration (Supabase)
DATABASE_URL=postgresql://username:password@db.supabase.co:5432/postgres
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# SendGrid Configuration
SENDGRID_API_KEY=SG.your_sendgrid_api_key
FROM_EMAIL=noreply@studentevents.com
FROM_NAME=StudentEvents

# Google Sheets Configuration
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id

# Frontend URL (for CORS and redirects)
FRONTEND_URL=http://localhost:8000
```

### 4. Database Setup

The application will automatically create the required tables when you first run it. To seed the database with sample data:

```bash
# Run the seed script
npm run seed
```

This creates:
- Admin user: `admin@studentevents.com` / `admin123`
- Worker users: `john.worker@studentevents.com` / `worker123`
- Sample events and worker assignments

### 5. Running the Application

```bash
# Development mode (with auto-reload)
npm run dev

# Production build
npm run build
npm start
```

The API will be available at `http://localhost:3001`

## 📚 API Documentation

### Authentication Endpoints

```
POST /api/auth/register     # Register new user
POST /api/auth/login        # User login
GET  /api/auth/profile      # Get user profile
PUT  /api/auth/profile      # Update user profile
POST /api/auth/change-password # Change password
POST /api/auth/refresh-token   # Refresh JWT token
```

### Event Endpoints

```
GET  /api/events            # Get all active events
GET  /api/events/:id        # Get event by ID
POST /api/events            # Create event (Admin only)
PUT  /api/events/:id        # Update event (Admin only)
DELETE /api/events/:id      # Delete event (Admin only)
GET  /api/events/admin/all  # Get all events for admin
GET  /api/events/:id/stats  # Get event statistics
```

### Ticket Endpoints

```
POST /api/tickets/purchase     # Create payment intent for ticket
POST /api/tickets/confirm      # Confirm ticket purchase
GET  /api/tickets/my-tickets   # Get user's tickets
GET  /api/tickets/:id          # Get ticket by ID
GET  /api/tickets/:id/download # Download ticket PDF
POST /api/tickets/validate     # Validate ticket (Worker only)
GET  /api/tickets/admin/all    # Get all tickets (Admin only)
GET  /api/tickets/admin/stats  # Get ticket statistics
GET  /api/tickets/event/:id    # Get tickets for event
```

### Worker Endpoints

```
POST /api/workers/assign       # Assign worker to event (Admin only)
DELETE /api/workers/remove     # Remove worker from event (Admin only)
GET  /api/workers/all          # Get all workers (Admin only)
GET  /api/workers/available    # Get available workers (Admin only)
GET  /api/workers/my-events    # Get worker's assigned events
GET  /api/workers/event/:id    # Get workers for event
```

### Webhook Endpoints

```
POST /api/webhooks/stripe      # Stripe webhook handler
GET  /api/webhooks/health      # Webhook health check
```

## 🔐 Authentication & Roles

The API uses JWT tokens for authentication with three user roles:

- **Admin**: Full access to all endpoints, can manage events and workers
- **Worker**: Can validate tickets and view assigned events
- **User**: Can purchase tickets and view their own tickets

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 💳 Payment Flow

1. User initiates ticket purchase (`POST /api/tickets/purchase`)
2. Server creates Stripe Payment Intent
3. Frontend handles payment with Stripe
4. User confirms purchase (`POST /api/tickets/confirm`)
5. Server creates ticket and sends email
6. Stripe webhook confirms payment success

## 📧 Email Integration

The system automatically sends emails for:
- Welcome messages for new users
- Ticket confirmations with PDF attachments
- Password reset instructions (if implemented)

## 📊 Google Sheets Integration

Ticket data is automatically synced to Google Sheets:
- New tickets are added when purchased
- Ticket status updates when validated
- Bulk sync available for existing data

## 🎫 QR Code System

Each ticket gets a unique QR code in format: `TICKET-{UUID}`
- QR codes are embedded in PDF tickets
- Workers can scan codes to validate tickets
- Prevents duplicate usage and fraud

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm run seed        # Seed database with sample data
```

### Database Schema

The application creates these tables:
- `users` - User accounts with roles
- `events` - Event information and settings
- `tickets` - Purchased tickets with QR codes
- `workers` - Worker assignments to events

## 🚀 Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Use production database URL
3. Configure production Stripe keys
4. Set up proper CORS origins
5. Configure email service

### Recommended Platforms

- **Heroku**: Easy deployment with add-ons
- **Railway**: Simple Node.js hosting
- **DigitalOcean App Platform**: Scalable hosting
- **AWS/GCP/Azure**: Full cloud solutions

## 🛡 Security Features

- Helmet.js for security headers
- CORS configuration
- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting (recommended for production)

## 📝 Testing

To test the API:

1. Start the server: `npm run dev`
2. Use the seed data: `npm run seed`
3. Test endpoints with Postman or curl
4. Check the health endpoint: `GET /health`

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection**: Check DATABASE_URL and network access
2. **Stripe Webhooks**: Ensure webhook endpoint is publicly accessible
3. **Email Delivery**: Verify SendGrid API key and sender verification
4. **Google Sheets**: Check service account permissions

### Logs

The application provides detailed logging:
- Server startup and configuration
- Database operations
- Payment processing
- Email delivery status
- Error details in development mode

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the troubleshooting section
- Review the API documentation
- Contact: support@studentevents.com
