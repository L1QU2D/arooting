import React from 'react'
import type { Metadata } from 'next'
import { canonicalUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms of use for androidrooting.com. Read our terms and conditions for using the site.',
  alternates: { canonical: canonicalUrl('/terms') },
}

export default function TermsPage() {
  return (
    <div>
      <h1>Terms of Use</h1>
      <p><em>Last updated: May 2026</em></p>

      <p>
        By accessing and using androidrooting.com (&quot;the Site&quot;), you agree to these terms and
        conditions.
      </p>

      <h2>Disclaimer</h2>
      <p>
        Rooting your Android device carries inherent risks, including but not limited to voiding
        your warranty, bricking your device, data loss, and security vulnerabilities. The
        information on this site is provided for educational purposes only. We are not responsible
        for any damage or loss resulting from following our guides.
      </p>

      <h2>Use at Your Own Risk</h2>
      <p>
        All rooting guides, tools, and instructions are provided &quot;as is&quot; without warranty of any
        kind. You assume full responsibility for any actions taken based on information found on
        this site. Always back up your data before modifying your device.
      </p>

      <h2>Accuracy of Information</h2>
      <p>
        We strive to keep our guides accurate and up-to-date. However, Android devices, software
        versions, and rooting tools change frequently. We cannot guarantee that all information is
        current at the time of reading. Verify critical steps against official sources when possible.
      </p>

      <h2>Intellectual Property</h2>
      <p>
        All content on this site, including text, images, and code examples, is the property of
        androidrooting.com unless otherwise noted. You may not reproduce, distribute, or republish
        content without permission.
      </p>

      <h2>External Links and Downloads</h2>
      <p>
        We may link to third-party websites and download sources. We do not control and are not
        responsible for the content, availability, or practices of external sites. Download files
        only from official and trusted sources.
      </p>

      <h2>Changes to These Terms</h2>
      <p>
        We reserve the right to update these terms at any time. Continued use of the site after
        changes constitutes acceptance of the updated terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Visit our <a href="/contact">contact page</a>.
      </p>
    </div>
  )
}
