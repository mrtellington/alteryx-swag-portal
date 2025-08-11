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

## Features

- 🔐 **Secure Authentication**: Email-based login restricted to `@alteryx.com` addresses
- 👥 **User Management**: Pre-registered users with shipping addresses
- 🛒 **One-Time Orders**: Each user can only order once in their lifetime
- 📦 **Inventory Management**: Real-time inventory tracking
- 💰 **Zero-Dollar Checkout**: No payment processing required
- 📧 **Email Confirmations**: Branded confirmation emails
- 🔗 **Webhook Integration**: Cognito Forms integration for user registration
- 📱 **Responsive Design**: Mobile and desktop optimized

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Email**: Nodemailer with SMTP
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Lucide React icons
- **Notifications**: React Hot Toast

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- SMTP email service (Gmail, SendGrid, etc.)
- GitHub repository for version control

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd alteryx-swag-portal
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your variables:

```bash
cp env.example .env.local
```

Fill in the required environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ALTERYX_SWAG_URL=https://alteryxswag.com

# Webhook Secret (for Cognito Forms)
WEBHOOK_SECRET=your_webhook_secret_key
```

### 3. Supabase Setup

1. Create a new Supabase project
2. Run the database setup script in the Supabase SQL editor:

```sql
-- Copy and paste the contents of scripts/setup-database.sql
```

3. Configure Supabase Auth settings:
   - Enable Email auth
   - Set redirect URLs to include your domain
   - Configure email templates

### 4. Development

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    invited BOOLEAN DEFAULT FALSE,
    full_name VARCHAR(255) NOT NULL,
    shipping_address TEXT NOT NULL,
    order_submitted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Orders Table
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    date_submitted TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Inventory Table
```sql
CREATE TABLE inventory (
    product_id UUID PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    quantity_available INTEGER DEFAULT 0
);
```

## API Endpoints

### POST /api/orders
Submit a new order with user details and inventory management.

### POST /api/webhook/cognito
Webhook endpoint for Cognito Forms integration to register new users.

## Cognito Forms Integration

1. In your Cognito Form, add a "Submit Entry" action
2. Set the webhook URL to: `https://your-domain.com/api/webhook/cognito`
3. Add authorization header: `Bearer your_webhook_secret`
4. Map form fields to expected JSON structure:
   ```json
   {
     "Full Name": "John Doe",
     "Email Address": "john.doe@alteryx.com",
     "Shipping Address": "123 Main St, City, State ZIP"
   }
   ```

## Deployment

### Google Cloud Platform (Recommended)

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy to Cloud Run:**
   ```bash
   gcloud run deploy alteryx-swag-portal \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

3. **Set environment variables in Cloud Run:**
   - Go to Cloud Run console
   - Edit the service
   - Add all environment variables from `.env.local`

### Alternative: Vercel

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Shopify Theme Integration

To integrate the Shopify theme assets:

1. Download the Shopify theme export from the provided Google Drive link
2. Extract CSS, fonts, and images to the `public/` directory
3. Import theme styles in `app/globals.css`
4. Update component styling to match the original design

## Security Features

- Row Level Security (RLS) enabled on all tables
- Email domain validation (`@alteryx.com` only)
- Webhook authentication for Cognito Forms
- User invitation system
- One-time order restriction
- Inventory validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is proprietary to Alteryx, Inc.

## Support

For technical support or questions, contact the development team.

---

**Note**: This application is designed for internal Alteryx use only. Ensure proper security measures are in place before deployment to production.
