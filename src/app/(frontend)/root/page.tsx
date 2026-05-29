import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { canonicalUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Root Android by Device — Samsung, Google Pixel, OnePlus & More',
  description:
    'Find rooting guides for your Android device. Browse by brand to get step-by-step instructions for Samsung, Google Pixel, OnePlus, Xiaomi, and more.',
  alternates: { canonical: canonicalUrl('/root') },
}

export default async function DevicesIndexPage() {
  let brands = { docs: [] as any[] }

  try {
    const payload = await getPayload({ config: await config })
    brands = await payload.find({ collection: 'brands', limit: 100, sort: 'name' })
  } catch {
    // Tables may not exist during initial build
  }

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Devices', url: '/root' },
  ]

  return (
    <div>
      <Breadcrumbs items={breadcrumbs} />

      <h1>Root Android by Device</h1>
      <p>
        Select your device brand below to find step-by-step rooting instructions, bootloader unlock
        status, and compatible root methods.
      </p>

      {brands.docs.length > 0 ? (
        <div className="card-grid">
          {brands.docs.map((brand) => (
            <Link key={brand.id} href={`/root/${brand.slug}`} className="guide-card">
              <h3 className="guide-card-title">{brand.name}</h3>
              {brand.description && (
                <p className="guide-card-excerpt">{brand.description}</p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <p>No brands available yet. Check back soon.</p>
      )}
    </div>
  )
}
