import React from 'react'
import Link from 'next/link'

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-logo">
          Android Rooting
        </Link>
        <nav className="site-nav">
          <Link href="/guides/root-android">Guides</Link>
          <Link href="/root/samsung">Devices</Link>
          <Link href="/learn/what-is-rooting">Learn</Link>
        </nav>
      </div>
    </header>
  )
}
