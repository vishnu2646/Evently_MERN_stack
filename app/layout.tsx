import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const popins = Poppins({ subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--fornt-popins'
})

export const metadata: Metadata = {
  title: 'Evently',
  description: 'Evently is a platform for event management',
  icons: {
    icon: '/assets/images/logo.svg',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
        <html lang="en">
            <body className={popins.variable}>{children}</body>
        </html>
    </ClerkProvider>
  )
}
