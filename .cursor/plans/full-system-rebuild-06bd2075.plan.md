<!-- 06bd2075-af48-4392-8b05-eaa61a82e0a3 9267c1f3-fcae-4921-8601-f2331cfe0c2b -->
# Complete Event Management System - Full Rebuild

## Project Overview

Build a comprehensive event management platform from scratch with three main sections: Admin Panel, Worker/Supervisor Panel, and Public Website. All data persists in PostgreSQL database with real-time synchronization.

## Technology Stack

- Backend: Node.js + Express.js
- Database: PostgreSQL (Supabase)
- Frontend: Vanilla HTML/CSS/JavaScript
- Authentication: JWT tokens
- Payments: Stripe API + Manual Bank Transfer
- Email: SendGrid
- PDF Generation: jsPDF + QRCode.js
- Deployment: Railway (backend) + Netlify (frontend)

## Phase 1: Database Foundation

### 1.1 Database Schema Design

Create complete PostgreSQL schema with tables:

- `admin` - Admin credentials
- `events` - Event information
- `bookings` - Participant/ticket bookings
- `workers` - Worker/supervisor accounts
- `settings` - System configuration
- `policies` - Policy content

File: `database/schema.sql`

```sql
-- Admin table
CREATE TABLE admin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  date TIMESTAMP NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  price DECIMAL(10,2) NOT NULL,
  total_tickets INTEGER NOT NULL,
  min_age INTEGER,
  dress_code VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  ticket_number VARCHAR(100) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  quantity INTEGER DEFAULT 1,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_reference VARCHAR(100),
  additional_attendees JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Workers table
CREATE TABLE workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) NOT NULL,
  assigned_event_id UUID REFERENCES events(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Settings table
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  category VARCHAR(50),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Policies table
CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 1.2 Seed Initial Data

File: `database/seed.sql`

- Create default admin account
- Insert sample settings
- Add default policy templates

## Phase 2: Backend API Development

### 2.1 Server Setup

File: `backend/server.js`

- Express server initialization
- CORS configuration
- Database connection pool
- Middleware setup (body-parser, helmet, morgan)
- Error handling

### 2.2 Authentication System

Files: `backend/middleware/auth.js`, `backend/routes/auth.js`

Endpoints:

- `POST /api/admin/login` - Admin authentication
- `POST /api/worker/login` - Worker/supervisor authentication
- JWT token generation and verification middleware

### 2.3 Events API

File: `backend/routes/events.js`

Endpoints:

- `GET /api/events` - List all events (public)
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (admin only)
- `PUT /api/events/:id` - Update event (admin only)
- `DELETE /api/events/:id` - Delete event (admin only)
- `GET /api/events/export` - Export all events

### 2.4 Bookings API

File: `backend/routes/bookings.js`

Endpoints:

- `GET /api/bookings` - List all bookings (admin only)
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings` - Create booking (public)
- `PUT /api/bookings/:id` - Update booking (admin only)
- `DELETE /api/bookings/:id` - Delete booking (admin only)
- `POST /api/bookings/:id/confirm` - Mark as paid and send tickets
- `GET /api/bookings/search` - Search bookings
- `GET /api/bookings/export/:eventId` - Export participants

### 2.5 Workers API

File: `backend/routes/workers.js`

Endpoints:

- `GET /api/workers` - List workers (admin only)
- `GET /api/workers/:id` - Get worker details
- `POST /api/workers` - Create worker (admin only)
- `PUT /api/workers/:id` - Update worker (admin only)
- `DELETE /api/workers/:id` - Delete worker (admin only)
- `GET /api/workers/export` - Export workers
- `POST /api/workers/verify-ticket` - Verify ticket (worker/supervisor)

### 2.6 Settings API

File: `backend/routes/settings.js`

Endpoints:

- `GET /api/settings` - Get all settings
- `GET /api/settings/:key` - Get specific setting
- `PUT /api/settings` - Update settings (admin only)
- `POST /api/settings/reset` - Reset system (admin only)

### 2.7 Policies API

File: `backend/routes/policies.js`

Endpoints:

- `GET /api/policies` - Get all policies
- `GET /api/policies/:type` - Get specific policy
- `PUT /api/policies/:type` - Update policy (admin only)
- `GET /api/policies/:type/pdf` - Download policy as PDF

### 2.8 Payment Integration

File: `backend/routes/payments.js`

- Stripe checkout session creation
- Stripe webhook handler
- Manual bank transfer reference generation
- Payment confirmation logic

### 2.9 Email & Ticket Generation

File: `backend/services/email.js`, `backend/services/tickets.js`

- SendGrid email templates
- PDF ticket generation with QR codes
- Email sending for booking confirmations
- Ticket attachment generation

## Phase 3: Admin Panel Frontend

### 3.1 Admin Login

File: `admin/login.html`, `admin/js/login.js`

- Email/password form
- Authentication with backend
- JWT token storage
- Redirect to dashboard

### 3.2 Admin Dashboard Layout

File: `admin/dashboard.html`, `admin/css/dashboard.css`

- Header with logo, back button, logout
- Navigation menu (Events, Bookings, Workers, Settings)
- Responsive design
- Single-page application structure

### 3.3 Events Management

File: `admin/js/events.js`

- Event list with search/sort
- Create event modal
- Edit event modal
- Delete confirmation
- View event details
- Export functionality
- Real-time database sync

### 3.4 Bookings Management

File: `admin/js/bookings.js`

- Bookings list with filters
- Search by name/email/phone/ticket
- Add participant manually
- Edit/delete bookings
- Mark as paid
- Export participants per event
- Download tickets

### 3.5 Workers Management

File: `admin/js/workers.js`

- Workers list
- Add worker form
- Edit worker
- Delete worker
- Assign to events
- Export workers list

### 3.6 Settings Page

File: `admin/js/settings.js`

- Payment method selector
- Bank transfer settings
- Contact information
- Organization details
- Policy editor (WYSIWYG or textarea)
- Data management (reset with backup)

## Phase 4: Worker/Supervisor Panel

### 4.1 Worker Login

File: `worker/login.html`, `worker/js/login.js`

- Email/password authentication
- Role-based redirect (Worker vs Supervisor)

### 4.2 Worker Dashboard

File: `worker/dashboard.html`, `worker/js/worker.js`

- QR code scanner
- Manual ticket search
- Ticket validation display
- Participant info display

### 4.3 Supervisor Dashboard

File: `worker/supervisor.html`, `worker/js/supervisor.js`

- All worker features
- Full participant list for assigned event
- Manual payment confirmation
- Add participants manually

## Phase 5: Public Website

### 5.1 Homepage

File: `index.html`, `js/home.js`, `css/main.css`

- Header with navigation
- Hero section
- Event list (cards)
- Event filtering/sorting
- Responsive design

### 5.2 Event Details

File: `js/event-details.js`

- Full event information
- Image gallery
- Buy tickets button
- Event metadata (age, dress code, etc.)

### 5.3 Booking Flow

File: `booking.html`, `js/booking.js`

- Ticket quantity selector
- Attendee information forms (multiple if quantity > 1)
- Terms & policy checkbox
- Form validation
- Submit booking

### 5.4 Payment Pages

Files: `js/stripe-checkout.js`, `js/bank-transfer.js`

Stripe flow:

- Redirect to Stripe checkout
- Handle callback
- Show confirmation with tickets

Manual bank transfer:

- Display bank details
- Show reference number
- Pending payment notice
- Download pending ticket (with watermark)

### 5.5 Confirmation Page

File: `confirmation.html`, `js/confirmation.js`

- Payment success message
- Ticket download
- Email notification display
- Support contact info

### 5.6 Rules & Policy

File: `rules.html`, `js/rules.js`

- Load policy from database
- Display formatted content
- PDF download button

### 5.7 Contacts Page

File: `contacts.html`, `js/contacts.js`

- Organization contact info from database
- Support hours
- Contact form (optional)

## Phase 6: Integration & Testing

### 6.1 Frontend-Backend Integration

- API endpoint configuration
- Error handling
- Loading states
- Success/error notifications

### 6.2 Database Connection Testing

- Test all CRUD operations
- Verify foreign key constraints
- Test cascading deletes
- Validate data integrity

### 6.3 Authentication Flow Testing

- Test admin login/logout
- Test worker login/logout
- Test token expiration
- Test unauthorized access prevention

### 6.4 Payment Testing

- Test Stripe integration (test mode)
- Test manual bank transfer flow
- Test payment confirmation
- Test ticket generation

### 6.5 Email Testing

- Test booking confirmation emails
- Test ticket delivery
- Test multiple attendees
- Verify email templates

## Phase 7: Deployment

### 7.1 Backend Deployment (Railway)

- Environment variables configuration
- Database connection string
- SendGrid API key
- Stripe API keys
- Deploy to Railway

### 7.2 Frontend Deployment (Netlify)

- API URL configuration
- Deploy to Netlify
- Custom domain setup (optional)

### 7.3 Database Setup (Supabase)

- Run schema migration
- Run seed scripts
- Configure connection pooling
- Set up backups

## Phase 8: Documentation

### 8.1 API Documentation

- Document all endpoints
- Request/response examples
- Authentication requirements

### 8.2 User Guides

- Admin panel guide
- Worker panel guide
- Public website guide

### 8.3 Deployment Guide

- Environment setup
- Database migration
- Production deployment steps

### To-dos

- [ ] Create complete database schema with all tables (admin, events, bookings, workers, settings, policies)
- [ ] Create seed data script with default admin, settings, and policies
- [ ] Initialize Express server with middleware, CORS, database connection, error handling
- [ ] Build authentication system with JWT for admin and workers
- [ ] Create events API with all CRUD endpoints
- [ ] Create bookings API with CRUD, search, export, and confirmation
- [ ] Create workers API with CRUD and ticket verification
- [ ] Create settings API for system configuration
- [ ] Create policies API for terms, privacy, etc.
- [ ] Integrate Stripe and manual bank transfer payment methods
- [ ] Build email service with SendGrid and PDF ticket generation
- [ ] Build admin login page with authentication
- [ ] Create admin dashboard layout with navigation
- [ ] Build admin events management page with full CRUD
- [ ] Build admin bookings management with search, filter, export
- [ ] Build admin workers management page
- [ ] Build admin settings page with all configuration options
- [ ] Build worker/supervisor login with role-based routing
- [ ] Build worker dashboard with QR scanning and ticket validation
- [ ] Build supervisor dashboard with additional permissions
- [ ] Build public homepage with event list
- [ ] Build event details page
- [ ] Build complete booking flow with forms and validation
- [ ] Build payment pages for both Stripe and bank transfer
- [ ] Build confirmation page with ticket download
- [ ] Build rules & policy page with dynamic content
- [ ] Build contacts page with organization info
- [ ] Test all frontend-backend integrations and database operations
- [ ] Deploy database schema and seed data to Supabase
- [ ] Deploy backend API to Railway with environment variables
- [ ] Deploy frontend to Netlify and configure API URLs
- [ ] Complete end-to-end testing on production environment