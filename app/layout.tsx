import './globals.css'
import { Montserrat } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { SupabaseProvider } from '@/components/providers/SupabaseProvider'

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata = {
  title: 'Alteryx Swag Portal',
  description: 'Private ordering portal for Alteryx employees',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className={montserrat.className}>
        <SupabaseProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </SupabaseProvider>
      </body>
    </html>
  )
}
