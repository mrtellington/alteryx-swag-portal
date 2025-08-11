# Alteryx Swag Portal

A Next.js application for managing Alteryx employee swag orders with Supabase backend and Google Cloud deployment.

## Quick Start

### Development
```bash
npm install
npm run dev
```

### Production Deployment
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.
Use [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) to track your progress.

## Features

- Employee authentication via Supabase
- Product catalog with inventory management
- Order processing with email confirmations
- Google Places address autocomplete
- Responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Google Cloud Run, GitHub Actions
- **Email**: Nodemailer with Gmail SMTP
- **Address Validation**: Google Places API

## Deployment Status

- [x] GitHub repository setup
- [x] Google Cloud project configuration
- [x] Supabase production setup
- [x] Environment variables configured
- [x] GitHub secrets configured
- [ ] **Deploying to Google Cloud Run...** 🚀

<!-- Deployment trigger: 2024-01-15 - Fixed GCP service account key format -->
