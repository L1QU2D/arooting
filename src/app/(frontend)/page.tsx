export const dynamic = 'force-dynamic'

import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { GuideCard } from '@/components/GuideCard'
import { DeviceCard } from '@/components/DeviceCard'
import { JsonLd } from '@/components/JsonLd'
import { websiteJsonLd } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Android Rooting — How to Root Any Android Device',
  description:
    'Step-by-step guides to root Android using Magisk, KernelSU, and TWRP. Instructions for Samsung, Pixel, OnePlus, Xiaomi, and 170+ devices.',
  alternates: { canonical: 'https://androidrooting.com' },
}

export default async function HomePage() {
  let guides = { docs: [] as any[] }
  let brands = { docs: [] as any[] }
  let devices = { docs: [] as any[] }
  let learn = { docs: [] as any[] }

  try {
    const payload = await getPayload({ config: await config })
    ;[guides, brands, devices, learn] = await Promise.all([
      payload.find({ collection: 'guides', limit: 6, sort: 'title' }),
      payload.find({ collection: 'brands', limit: 6, sort: 'name' }),
      payload.find({ collection: 'devices', limit: 8, sort: 'name' }),
      payload.find({ collection: 'learn', limit: 5, sort: 'title' }),
    ])
  } catch {
    // Tables may not exist during initial build
  }

  return (
    <div>
      <JsonLd data={websiteJsonLd()} />

      <section className="hero">
        <h1>How to Root Android</h1>
        <p>
          Step-by-step guides to root any Android device. Unlock your phone with Magisk, KernelSU,
          TWRP, custom ROMs, and more.
        </p>
      </section>

      {guides.docs.length > 0 && (
        <section className="home-section">
          <h2>Rooting Guides</h2>
          <div className="card-grid">
            {guides.docs.map((guide) => (
              <GuideCard
                key={guide.id}
                title={guide.title}
                slug={guide.slug}
                excerpt={guide.excerpt}
                category={guide.category}
              />
            ))}
          </div>
        </section>
      )}

      {devices.docs.length > 0 && (
        <section className="home-section">
          <h2>Popular Devices</h2>
          <div className="card-grid">
            {devices.docs.map((device) => {
              const brand = device.brand as { slug: string } | undefined
              return (
                <DeviceCard
                  key={device.id}
                  name={device.name}
                  brandSlug={brand?.slug || ''}
                  deviceSlug={device.slug}
                  status={device.status}
                  rootMethod={device.rootMethod}
                  difficulty={device.difficulty}
                />
              )
            })}
          </div>
        </section>
      )}

      {brands.docs.length > 0 && (
        <section className="home-section">
          <h2>Browse by Brand</h2>
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
        </section>
      )}

      {learn.docs.length > 0 && (
        <section className="home-section">
          <h2>Learn About Rooting</h2>
          <div className="card-grid">
            {learn.docs.map((article) => (
              <Link key={article.id} href={`/learn/${article.slug}`} className="guide-card">
                <h3 className="guide-card-title">{article.title}</h3>
                <p className="guide-card-excerpt">{article.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
