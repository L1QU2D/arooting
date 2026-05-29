import React from 'react'
import { GuideCard } from './GuideCard'
import { DeviceCard } from './DeviceCard'

interface RelatedGuide {
  id: number
  title: string
  slug: string
  excerpt: string
  category?: string | null
}

interface RelatedDevice {
  id: number
  name: string
  slug: string
  brand: { slug: string } | number
  status?: string | null
  rootMethod?: string | null
  difficulty?: string | null
}

export function RelatedGuides({ guides }: { guides: RelatedGuide[] }) {
  if (!guides || guides.length === 0) return null

  return (
    <section className="related-section">
      <h2>Related Guides</h2>
      <div className="card-grid">
        {guides.map((guide) => (
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
  )
}

export function RelatedDevices({ devices }: { devices: RelatedDevice[] }) {
  if (!devices || devices.length === 0) return null

  return (
    <section className="related-section">
      <h2>Related Devices</h2>
      <div className="card-grid">
        {devices.map((device) => (
          <DeviceCard
            key={device.id}
            name={device.name}
            brandSlug={typeof device.brand === 'object' ? device.brand.slug : ''}
            deviceSlug={device.slug}
            status={device.status}
            rootMethod={device.rootMethod}
            difficulty={device.difficulty}
          />
        ))}
      </div>
    </section>
  )
}
