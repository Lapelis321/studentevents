# Quick Setup Guide

## 1. Environment Setup

Copy `env.example` to `.env` and fill in your actual values:

```bash
cp env.example .env
```

## 2. Required Services

### Supabase (Database)
1. Create a Supabase project at https://supabase.com
2. Get your connection string from Settings > Database
3. Update `DATABASE_URL` in `.env`

### Stripe (Payments)
1. Create a Stripe account at https://stripe.com
2. Get your test keys from the dashboard
3. Update `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` in `.env`

### SendGrid (Email) - Optional
1. Create a SendGrid account at https://sendgrid.com
2. Get your API key
3. Update `SENDGRID_API_KEY` in `.env`

### Google Sheets (Data Sync) - Optional
1. Create a Google Cloud project
2. Enable Google Sheets API
3. Create a service account and download credentials
4. Update Google Sheets variables in `.env`

## 3. Installation & Running

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Seed the database with sample data
npm run seed

# Start development server
npm run dev
```

## 4. Testing the API

The server will start on http://localhost:3001

### Health Check
```bash
curl http://localhost:3001/health
```

### Register a User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Events
```bash
curl http://localhost:3001/api/events
```

## 5. Sample Accounts (after seeding)

- **Admin**: admin@studentevents.com / admin123
- **Worker**: john.worker@studentevents.com / worker123
- **User**: alice@student.edu / student123

## 6. API Documentation

See the main README.md for complete API documentation.

## 7. Troubleshooting

- Make sure your database is running and accessible
- Check that all environment variables are set correctly
- Verify your Stripe webhook endpoint is configured
- Ensure SendGrid sender email is verified
