import React from 'react'
import type { Metadata } from 'next'
import { canonicalUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for androidrooting.com. Learn how we handle your data and protect your privacy.',
  alternates: { canonical: canonicalUrl('/privacy') },
}

export default function PrivacyPage() {
  return (
    <div>
      <h1>Privacy Policy</h1>
      <p><em>Last updated: May 2026</em></p>

      <p>
        This privacy policy describes how androidrooting.com (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) collects,
        uses, and protects information when you visit our website.
      </p>

      <h2>Information We Collect</h2>
      <p>
        We do not require you to create an account or provide personal information to use our site.
        We may collect non-personally identifiable information through standard web server logs,
        including IP addresses, browser type, referring URLs, and pages visited.
      </p>

      <h2>Cookies</h2>
      <p>
        We may use cookies and similar technologies for analytics purposes. You can control cookies
        through your browser settings. Our site functions without cookies enabled.
      </p>

      <h2>Third-Party Services</h2>
      <p>
        We may use third-party analytics services to understand how visitors use our site. These
        services may collect information sent by your browser, including your IP address and the
        pages you visit.
      </p>

      <h2>External Links</h2>
      <p>
        Our guides may link to external websites and download sources. We are not responsible for
        the privacy practices of external sites. We recommend reviewing the privacy policies of
        any external sites you visit.
      </p>

      <h2>Data Security</h2>
      <p>
        We use HTTPS encryption and follow industry-standard security practices to protect your
        browsing experience.
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        We may update this privacy policy from time to time. Changes will be posted on this page
        with an updated revision date.
      </p>

      <h2>Contact</h2>
      <p>
        If you have questions about this privacy policy, please visit our{' '}
        <a href="/contact">contact page</a>.
      </p>
    </div>
  )
}
