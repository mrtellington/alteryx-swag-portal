const fs = require('fs');

const envContent = `NEXT_PUBLIC_SUPABASE_URL=https://dnpgplnekkqckdcekfnz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucGdwbG5la2txY2tkY2VrZm56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4Njc4NTUsImV4cCI6MjA3MDQ0Mzg1NX0.Yv6h4qOh94AuztLApbB8yM5PHcXDnBcW8FPYtmSnz1k
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucGdwbG5la2txY2tkY2VrZm56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg2Nzg1NSwiZXhwIjoyMDcwNDQzODU1fQ.iqVe2SRCw8ygSs8WGK5gIb-gTfG6dM6vqksZR9EuPGM
NEXT_PUBLIC_APP_URL=http://localhost:3000`;

fs.writeFileSync('.env.local', envContent, 'utf8');
console.log('Environment file created successfully!');
console.log('File size:', fs.statSync('.env.local').size, 'bytes');
