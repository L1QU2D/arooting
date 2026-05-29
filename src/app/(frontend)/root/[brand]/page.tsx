export const dynamic = 'force-dynamic'

import React from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { DeviceCard } from '@/components/DeviceCard'
import { brandMetaTitle, brandMetaDescription, canonicalUrl } from '@/lib/seo'

interface Props {
  params: Promise<{ brand: string }>
}

async function getBrand(slug: string) {
  const payload = await getPayload({ config: await config })
  const result = await payload.find({
    collection: 'brands',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return result.docs[0] || null
}

async function getDevicesForBrand(brandId: number) {
  const payload = await getPayload({ config: await config })
  const result = await payload.find({
    collection: 'devices',
    where: { brand: { equals: brandId } },
    limit: 500,
    sort: 'name',
  })
  return result.docs
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand: brandSlug } = await params
  const brand = await getBrand(brandSlug)
  if (!brand) return {}

  return {
    title: brand.metaTitle || brandMetaTitle(brand.name),
    description: brand.metaDescription || brandMetaDescription(brand.name),
    alternates: { canonical: canonicalUrl(`/root/${brandSlug}`) },
  }
}

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: await config })
    const brands = await payload.find({ collection: 'brands', limit: 500, select: { slug: true } })
    return brands.docs.map((b) => ({ brand: b.slug }))
  } catch {
    return []
  }
}

const difficultyColors: Record<string, string> = {
  easy: 'var(--color-primary)',
  moderate: 'var(--color-warning)',
  difficult: 'var(--color-danger)',
  impossible: 'var(--color-danger)',
}

export default async function BrandPage({ params }: Props) {
  const { brand: brandSlug } = await params
  const brand = await getBrand(brandSlug)
  if (!brand) notFound()

  const devices = await getDevicesForBrand(brand.id)

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Devices', url: '/root' },
    { name: brand.name, url: `/root/${brandSlug}` },
  ]

  return (
    <div>
      <Breadcrumbs items={breadcrumbs} />

      <div className="brand-header">
        <h1>Root {brand.name} Devices</h1>
        {brand.description && <p>{brand.description}</p>}
        {brand.bootloaderUnlockDifficulty && (
          <p className="brand-difficulty" style={{ borderLeft: `3px solid ${difficultyColors[brand.bootloaderUnlockDifficulty] || 'var(--color-text-muted)'}`, paddingLeft: '0.75rem' }}>
            Bootloader unlock difficulty: <strong>{brand.bootloaderUnlockDifficulty}</strong>
          </p>
        )}
        {brand.bootloaderUnlockNotes && <p>{brand.bootloaderUnlockNotes}</p>}
      </div>

      {devices.length > 0 ? (
        <>
          <h2>{devices.length} Device{devices.length !== 1 ? 's' : ''}</h2>
          <div className="card-grid">
            {devices.map((device) => (
              <DeviceCard
                key={device.id}
                name={device.name}
                brandSlug={brandSlug}
                deviceSlug={device.slug}
                status={device.status}
                rootMethod={device.rootMethod}
                difficulty={device.difficulty}
              />
            ))}
          </div>
        </>
      ) : (
        <p>No devices listed for {brand.name} yet. Check back soon.</p>
      )}
    </div>
  )
}
