import React from 'react'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { JsonLd } from '@/components/JsonLd'
import { organizationJsonLd } from '@/lib/seo'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Android Rooting — How to Root Any Android Device',
    template: '%s | Android Rooting',
  },
  description:
    'Step-by-step guides to root Android devices using Magisk, KernelSU, TWRP, and more. Find rooting instructions for Samsung, Google Pixel, OnePlus, Xiaomi, and 170+ devices.',
  metadataBase: new URL('https://androidrooting.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Android Rooting',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <JsonLd data={organizationJsonLd()} />
        <SiteHeader />
        <main className="page-container">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
