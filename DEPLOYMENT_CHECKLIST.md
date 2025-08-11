# 🚀 Deployment Checklist - Alteryx Swag Portal

Use this checklist to track your deployment progress.

## 📋 **Pre-Deployment Setup**

### GitHub Repository
- [ ] Create GitHub repository: `alteryx-swag-portal`
- [ ] Push code to GitHub
- [ ] Set up GitHub Secrets (see list below)

### Google Cloud Setup
- [ ] Create Google Cloud project: `alteryx-swag-portal`
- [ ] Enable billing
- [ ] Enable required APIs:
  - [ ] Cloud Run API
  - [ ] Cloud Build API
  - [ ] Places API
  - [ ] Geocoding API
- [ ] Create service account: `alteryx-swag-deployer`
- [ ] Download service account key
- [ ] Create Google Maps API key

### Supabase Setup
- [ ] Create Supabase project: `alteryx-swag-portal`
- [ ] Set up database schema
- [ ] Configure RLS policies
- [ ] Get API keys (URL, anon key, service role key)

## 🔑 **GitHub Secrets Required**

Add these to your GitHub repository → Settings → Secrets and variables → Actions:

### Google Cloud
- [ ] `GCP_PROJECT_ID` - Your Google Cloud project ID
- [ ] `GCP_SA_KEY` - Service account key JSON content

### Supabase
- [ ] `SUPABASE_URL` - Your Supabase project URL
- [ ] `SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

### Google Maps
- [ ] `GOOGLE_MAPS_API_KEY` - Google Maps API key
- [ ] `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Same Google Maps API key

### Email Configuration
- [ ] `SMTP_HOST` - smtp.gmail.com
- [ ] `SMTP_PORT` - 587
- [ ] `SMTP_USER` - Your email address
- [ ] `SMTP_PASS` - Your app password

### Application
- [ ] `APP_URL` - Will be your Cloud Run URL (update after first deployment)
- [ ] `WEBHOOK_SECRET` - Random secret for webhooks

## 🚀 **Deployment Steps**

### Initial Deployment
- [ ] Push code to main branch
- [ ] Monitor GitHub Actions deployment
- [ ] Get temporary URL from Cloud Run
- [ ] Update `APP_URL` secret with the temporary URL

### Testing
- [ ] Test application accessibility
- [ ] Test address autocomplete
- [ ] Test complete order flow
- [ ] Test email notifications
- [ ] Verify data storage in Supabase

## 🔧 **Post-Deployment**

### Monitoring Setup
- [ ] Set up Google Cloud Monitoring
- [ ] Configure billing alerts
- [ ] Set up error rate alerts
- [ ] Monitor API usage

### Security
- [ ] Review service account permissions
- [ ] Verify API key restrictions
- [ ] Check RLS policies in Supabase
- [ ] Test authentication flow

### Documentation
- [ ] Document deployment URL
- [ ] Share with internal team
- [ ] Create user documentation
- [ ] Plan custom domain setup

## 🎯 **Success Criteria**

Your deployment is successful when:

- [ ] Application is accessible via public URL
- [ ] Address autocomplete works correctly
- [ ] Orders can be placed and stored
- [ ] Email notifications are sent
- [ ] CI/CD pipeline is working
- [ ] Monitoring is configured
- [ ] Security is properly configured

## 📞 **Next Steps After Deployment**

- [ ] Share temporary URL with internal team
- [ ] Gather feedback from users
- [ ] Plan custom domain implementation
- [ ] Set up monitoring alerts
- [ ] Document any custom configurations

---

## 🆘 **Troubleshooting Quick Reference**

### Common Issues

**Deployment Fails**
- Check GitHub Actions logs
- Verify all secrets are set
- Ensure Google Cloud APIs are enabled

**Address Autocomplete Not Working**
- Verify Places API is enabled
- Check API key restrictions
- Ensure billing is enabled

**Database Connection Issues**
- Verify Supabase credentials
- Check network connectivity
- Review RLS policies

### Useful Commands

```bash
# Check deployment status
gcloud run services describe alteryx-swag-portal --region=us-central1

# View logs
gcloud logs read --service=alteryx-swag-portal --limit=50

# Check API usage
gcloud services list --enabled --filter="name:places OR name:geocoding"
```

---

**📖 For detailed instructions, see `DEPLOYMENT_GUIDE.md`**
