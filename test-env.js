// Read .env.local file manually
const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')

const envVars = {}
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length > 0) {
    envVars[key] = valueParts.join('=')
  }
})

console.log('Environment variables:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', envVars.NEXT_PUBLIC_SUPABASE_URL)
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'EXISTS' : 'MISSING')
console.log('NEXT_PUBLIC_APP_URL:', envVars.NEXT_PUBLIC_APP_URL)

if (envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.log('Anon key length:', envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY.length)
  console.log('Anon key starts with:', envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...')
}
