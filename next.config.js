/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://dnpgplnekkqckdcekfnz.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucGdwbG5la2txY2tkY2VrZm56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4Njc4NTUsImV4cCI6MjA3MDQ0Mzg1NX0.Yv6h4qOh94AuztLApbB8yM5PHcXDnBcW8FPYtmSnz1k',
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: 'AIzaSyA_hkb41owh55NAXg-PEqeiEC1aTRGfKPg',
    NEXT_PUBLIC_APP_URL: 'https://alteryx-swag-portal-547519073376.us-central1.run.app',
  },
  images: {
    domains: ['alteryxswag.com', 'cdn.shopify.com', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig
