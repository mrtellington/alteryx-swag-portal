# Alteryx Swag Portal

A secure, private ordering portal for Alteryx employees to order exclusive company swag. Built with Next.js, Supabase, and Tailwind CSS.

## 🚀 **Quick Start**

### For Development
```bash
git clone <your-repo-url>
cd alteryx-swag-portal
npm install
cp env.example .env.local
# Configure your environment variables
npm run dev
```

### For Production Deployment
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete production deployment instructions.

**Quick Deployment Checklist:** [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

## 🚀 **Deployment Status**
- ✅ GitHub repository configured
- ✅ Google Cloud project setup
- ✅ Supabase database configured
- ✅ SMTP email configured
- ✅ GitHub Secrets added
- 🔄 **Deploying to Google Cloud Run...**

## Features

- 🔐 **Secure Authentication**: Supabase Auth with email confirmation
- 🛍️ **Product Catalog**: Display swag items with size selection
- 🛒 **Shopping Cart**: Add items to cart with size selection
- 📍 **Address Validation**: Google Places API integration for address autocomplete
- 📧 **Email Notifications**: Order confirmation emails via SMTP
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS
- 📱 **Mobile Friendly**: Optimized for all device sizes
- 🔒 **Row Level Security**: Database security with RLS policies
- 🚀 **Production Ready**: Deployed on Google Cloud Run with CI/CD

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Email**: Nodemailer with SMTP
- **Maps**: Google Places API for address validation
- **Deployment**: Google Cloud Run with GitHub Actions CI/CD
- **Styling**: Tailwind CSS with custom Alteryx branding

## Environment Variables

Copy `env.example` to `.env.local` and configure:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Application Configuration
NEXT_PUBLIC_APP_URL=your_app_url
WEBHOOK_SECRET=your_webhook_secret
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

The application is automatically deployed to Google Cloud Run via GitHub Actions when changes are pushed to the main branch.

## License

Private - Alteryx Internal Use Only
# Trigger deployment with fixed GCP service account key
