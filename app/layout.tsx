import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { SearchProvider } from '@/components/search/search-provider'
import Script from 'next/script'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Playbook - A Quick Reference Cheatsheets for Offensive Security Practionaries',
  description: 'Quick reference cheatsheets for developers',
  icons: {
    icon: [
      {
        url: '/assets/logos/ClydePurple.png',
        type: 'image/png',
      }
    ],
    apple: '/assets/logos/ClydePurple.png',
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <SearchProvider>
          {children}
        </SearchProvider>
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="a7b71f34-f8c1-4f37-9971-57b5089fa9d7"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
