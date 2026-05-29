import React from 'react'
import type { Metadata } from 'next'
import { canonicalUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'About Android Rooting',
  description:
    'Android Rooting provides step-by-step guides to root Android devices using Magisk, KernelSU, TWRP, and more.',
  alternates: { canonical: canonicalUrl('/about') },
}

export default function AboutPage() {
  return (
    <div>
      <h1>About Android Rooting</h1>

      <p>
        Android Rooting is a resource dedicated to providing clear, accurate, and up-to-date
        instructions for rooting Android devices. We cover all major rooting methods including
        Magisk, KernelSU, TWRP, and custom ROM installation.
      </p>

      <h2>Our Mission</h2>
      <p>
        We believe Android users should have full control over their devices. Our guides are written
        to be accessible to beginners while remaining technically precise for experienced users.
        Every guide is tested and verified before publication.
      </p>

      <h2>What We Cover</h2>
      <ul>
        <li>Step-by-step rooting guides for 170+ Android devices</li>
        <li>Bootloader unlocking instructions for all major brands</li>
        <li>Custom recovery installation (TWRP and alternatives)</li>
        <li>Root management with Magisk and KernelSU</li>
        <li>Custom ROM installation and setup</li>
        <li>Safety information, risks, and best practices</li>
      </ul>

      <h2>Editorial Standards</h2>
      <p>
        All guides are researched and written by experienced Android enthusiasts. We verify
        instructions against official documentation, community forums, and hands-on testing.
        Content is regularly updated to reflect the latest Android versions and tool releases.
      </p>

      <h2>Contact</h2>
      <p>
        Have a question, correction, or suggestion? Visit our{' '}
        <a href="/contact">contact page</a> to get in touch.
      </p>
    </div>
  )
}
