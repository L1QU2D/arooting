import React from 'react'
import type { Metadata } from 'next'
import { canonicalUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the Android Rooting team. Report issues, suggest corrections, or request new device guides.',
  alternates: { canonical: canonicalUrl('/contact') },
}

export default function ContactPage() {
  return (
    <div>
      <h1>Contact Us</h1>

      <p>
        Have a question, found an error in a guide, or want to suggest a new device? We would like
        to hear from you.
      </p>

      <h2>Get in Touch</h2>
      <p>
        Email us at{' '}
        <a href="mailto:contact@androidrooting.com">contact@androidrooting.com</a>
      </p>

      <h2>Guide Corrections</h2>
      <p>
        If you find incorrect or outdated information in any of our guides, please let us know
        which guide and what needs to be updated. We verify all corrections and update guides
        promptly.
      </p>

      <h2>Device Requests</h2>
      <p>
        Want a rooting guide for a device we do not cover yet? Send us the brand and model name,
        and we will work on adding it.
      </p>
    </div>
  )
}
