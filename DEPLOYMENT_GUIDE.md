# 🚀 Alteryx Swag Portal - Complete Deployment Guide

This guide will walk you through deploying the Alteryx Swag Portal to Google Cloud with full CI/CD, Supabase, and Google Places API integration.

## 📋 **Prerequisites**

- Google Cloud Platform account with billing enabled
- GitHub account
- Supabase account
- Domain name (optional - we'll use a temporary URL initially)

## 🎯 **Deployment Overview**

1. **GitHub Repository Setup**
2. **Google Cloud Infrastructure Setup**
3. **Supabase Production Setup**
4. **Environment Configuration**
5. **Deployment & Testing**

---

## 🔄 **Phase 1: GitHub Repository Setup**

### Step 1.1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it: `alteryx-swag-portal`
3. Make it private (recommended for internal tools)
4. Don't initialize with README (we already have one)

### Step 1.2: Push Your Code

```bash
# In your local project directory
git init
git add .
git commit -m "Initial commit: Alteryx Swag Portal"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/alteryx-swag-portal.git
git push -u origin main
```

### Step 1.3: Set Up GitHub Secrets

Go to your repository → Settings → Secrets and variables → Actions, and add these secrets:

**Required Secrets:**
```
GCP_PROJECT_ID=your-google-cloud-project-id
GCP_SA_KEY=your-service-account-key-json
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
APP_URL=https://your-app-url.run.app
WEBHOOK_SECRET=your-webhook-secret
```

---

## ☁️ **Phase 2: Google Cloud Infrastructure Setup**

### Step 2.1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: `alteryx-swag-portal`
3. Enable billing for the project

### Step 2.2: Enable Required APIs

Enable these APIs in your Google Cloud project:

```bash
# Run these commands in Google Cloud Shell or locally with gcloud CLI
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable places-backend.googleapis.com
gcloud services enable geocoding-backend.googleapis.com
gcloud services enable maps-backend.googleapis.com
```

### Step 2.3: Create Service Account

1. Go to **IAM & Admin** → **Service Accounts**
2. Click **Create Service Account**
3. Name: `alteryx-swag-deployer`
4. Description: `Service account for Alteryx Swag Portal deployment`
5. Click **Create and Continue**

**Add these roles:**
- Cloud Run Admin
- Service Account User
- Cloud Build Service Account
- Storage Admin

6. Click **Done**
7. Click on the service account → **Keys** → **Add Key** → **Create new key**
8. Choose **JSON** format
9. Download the key file (this is your `GCP_SA_KEY`)

### Step 2.4: Set Up Google Places API

1. Go to **APIs & Services** → **Library**
2. Enable **Places API** and **Geocoding API**
3. Go to **Credentials** → **Create Credentials** → **API Key**
4. Restrict the key:
   - **Application restrictions**: HTTP referrers
   - **API restrictions**: Places API, Geocoding API
5. Copy the API key (this is your `GOOGLE_MAPS_API_KEY`)

---

## 🗄️ **Phase 3: Supabase Production Setup**

### Step 3.1: Create Supabase Project

1. Go to [Supabase](https://supabase.com/)
2. Create a new project: `alteryx-swag-portal`
3. Choose a strong database password
4. Select a region close to your users

### Step 3.2: Set Up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Run the database setup script (from `scripts/setup-database.sql`)
3. Set up Row Level Security (RLS) policies
4. Configure authentication settings

### Step 3.3: Get API Keys

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (your `SUPABASE_URL`)
   - **anon public** key (your `SUPABASE_ANON_KEY`)
   - **service_role** key (your `SUPABASE_SERVICE_ROLE_KEY`)

---

## ⚙️ **Phase 4: Environment Configuration**

### Step 4.1: Update Environment Variables

Create a production environment file:

```bash
# Create .env.production (don't commit this file)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
NEXT_PUBLIC_APP_URL=https://your-app-url.run.app
WEBHOOK_SECRET=your-webhook-secret
```

### Step 4.2: Update Next.js Configuration

Ensure your `next.config.js` is optimized for production:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig
```

---

## 🚀 **Phase 5: Deployment & Testing**

### Step 5.1: Initial Deployment

1. Push your code to GitHub main branch
2. GitHub Actions will automatically:
   - Run tests
   - Build the application
   - Deploy to Google Cloud Run

### Step 5.2: Get Your Temporary URL

After deployment, you'll get a URL like:
```
https://alteryx-swag-portal-xxxxx-uc.a.run.app
```

This is your temporary public URL for internal use.

### Step 5.3: Test the Application

1. Visit your deployment URL
2. Test the address autocomplete functionality
3. Test the complete order flow
4. Verify email notifications work
5. Check Supabase data storage

---

## 🔧 **Phase 6: Post-Deployment Configuration**

### Step 6.1: Set Up Custom Domain (When Ready)

1. Go to **Cloud Run** → Your service → **Manage Custom Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` in GitHub secrets

### Step 6.2: Configure Monitoring

1. Set up Google Cloud Monitoring
2. Configure alerts for:
   - High error rates
   - High latency
   - Cost thresholds

### Step 6.3: Set Up Backup Strategy

1. Configure Supabase backups
2. Set up database point-in-time recovery
3. Test restore procedures

---

## 📊 **Monitoring & Maintenance**

### Daily Checks
- Monitor application logs
- Check for any failed deployments
- Review error rates

### Weekly Tasks
- Review usage metrics
- Check API costs
- Update dependencies

### Monthly Tasks
- Security updates
- Performance optimization
- Cost optimization review

---

## 🆘 **Troubleshooting**

### Common Issues

1. **Deployment Fails**
   - Check GitHub Actions logs
   - Verify all secrets are set correctly
   - Ensure Google Cloud APIs are enabled

2. **Address Autocomplete Not Working**
   - Verify Google Places API is enabled
   - Check API key restrictions
   - Ensure billing is enabled

3. **Database Connection Issues**
   - Verify Supabase credentials
   - Check network connectivity
   - Review RLS policies

### Support Resources

- [Google Cloud Documentation](https://cloud.google.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)

---

## 🎉 **Success Criteria**

Your deployment is successful when:

✅ Application is accessible via public URL  
✅ Address autocomplete works correctly  
✅ Orders can be placed and stored in Supabase  
✅ Email notifications are sent  
✅ CI/CD pipeline is working  
✅ Monitoring is configured  
✅ Security is properly configured  

---

## 📞 **Next Steps After Deployment**

1. **Share the temporary URL** with your internal team
2. **Test all functionality** thoroughly
3. **Gather feedback** from users
4. **Plan custom domain** implementation
5. **Set up monitoring alerts**
6. **Document any custom configurations**

---

**Need Help?** Check the troubleshooting section or refer to the individual setup guides for each service.
