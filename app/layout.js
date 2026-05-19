import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata = {
  title: 'CPR Analyzer – Maverick Shop Owners',
  description: 'Upload. Analyze. Move Forward with Confidence.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
