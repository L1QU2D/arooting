import React from 'react'
import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-section">
          <h4>Guides</h4>
          <ul>
            <li><Link href="/guides/magisk">Magisk</Link></li>
            <li><Link href="/guides/twrp">TWRP Recovery</Link></li>
            <li><Link href="/guides/kernelsu">KernelSU</Link></li>
            <li><Link href="/guides/custom-roms">Custom ROMs</Link></li>
            <li><Link href="/guides/unlock-bootloader">Unlock Bootloader</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Popular Brands</h4>
          <ul>
            <li><Link href="/root/samsung">Samsung</Link></li>
            <li><Link href="/root/google">Google Pixel</Link></li>
            <li><Link href="/root/oneplus">OnePlus</Link></li>
            <li><Link href="/root/xiaomi">Xiaomi</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Learn</h4>
          <ul>
            <li><Link href="/learn/what-is-rooting">What Is Rooting?</Link></li>
            <li><Link href="/learn/is-rooting-safe">Is Rooting Safe?</Link></li>
            <li><Link href="/learn/benefits-of-rooting">Benefits of Rooting</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <nav className="footer-legal">
          <Link href="/about">About</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Use</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <p>&copy; {new Date().getFullYear()} androidrooting.com</p>
      </div>
    </footer>
  )
}
