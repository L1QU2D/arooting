import React from 'react'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { RichText } from '@/components/RichText'
import { StepList } from '@/components/StepList'
import { WarningBox } from '@/components/WarningBox'
import { FaqSection } from '@/components/FaqSection'
import { DeviceInfoCard } from '@/components/DeviceInfoCard'
import { RelatedGuides, RelatedDevices } from '@/components/RelatedContent'
import { JsonLd } from '@/components/JsonLd'
import {
  deviceMetaTitle,
  deviceMetaDescription,
  canonicalUrl,
  howToJsonLd,
} from '@/lib/seo'
import {
  getDefaultSteps,
  getDefaultPrerequisites,
  getDefaultWarnings,
} from '@/lib/device-template'

interface Props {
  params: Promise<{ brand: string; model: string }>
}

async function getDevice(brandSlug: string, deviceSlug: string) {
  const payload = await getPayload({ config: await config })

  // First find the brand
  const brandResult = await payload.find({
    collection: 'brands',
    where: { slug: { equals: brandSlug } },
    limit: 1,
  })
  const brand = brandResult.docs[0]
  if (!brand) return null

  // Then find the device for this brand
  const deviceResult = await payload.find({
    collection: 'devices',
    where: {
      and: [
        { slug: { equals: deviceSlug } },
        { brand: { equals: brand.id } },
      ],
    },
    limit: 1,
  })

  const device = deviceResult.docs[0]
  if (!device) return null

  return { device, brand }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand: brandSlug, model: modelSlug } = await params
  const result = await getDevice(brandSlug, modelSlug)
  if (!result) return {}

  const { device, brand } = result
  return {
    title: device.metaTitle || deviceMetaTitle(brand.name, device.name),
    description:
      device.metaDescription || deviceMetaDescription(brand.name, device.name, device.rootMethod || undefined),
    alternates: { canonical: canonicalUrl(`/root/${brandSlug}/${modelSlug}`) },
  }
}

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: await config })
    const devices = await payload.find({
      collection: 'devices',
      limit: 1000,
      select: { slug: true, brand: true },
    })

    const params: { brand: string; model: string }[] = []
    for (const device of devices.docs) {
      const brand = device.brand as { slug: string } | undefined
      if (brand?.slug) {
        params.push({ brand: brand.slug, model: device.slug })
      }
    }
    return params
  } catch {
    return []
  }
}

export default async function DevicePage({ params }: Props) {
  const { brand: brandSlug, model: modelSlug } = await params
  const result = await getDevice(brandSlug, modelSlug)
  if (!result) notFound()

  const { device, brand } = result

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Root', url: '/root/samsung' },
    { name: brand.name, url: `/root/${brandSlug}` },
    { name: device.name, url: `/root/${brandSlug}/${modelSlug}` },
  ]

  // Use custom steps or fallback to template
  const hasCustomSteps = device.steps && device.steps.length > 0
  const hasCustomPrerequisites = device.prerequisites && device.prerequisites.length > 0
  const hasCustomWarnings = device.warnings && device.warnings.length > 0

  const prerequisites = hasCustomPrerequisites
    ? device.prerequisites!.map((p) => p.text)
    : getDefaultPrerequisites(device.rootMethod || undefined)

  const warnings = hasCustomWarnings
    ? (device.warnings as { text: string; severity: 'info' | 'warning' | 'danger' }[])
    : getDefaultWarnings(device.rootMethod || undefined)

  // Build HowTo schema
  const templateSteps = getDefaultSteps(device.rootMethod)
  const stepsForSchema = hasCustomSteps
    ? device.steps!.map((s) => ({ name: s.title, text: s.title }))
    : templateSteps.map((s) => ({ name: s.title, text: s.text }))

  const relatedGuides = (device.relatedGuides || []).filter(
    (g): g is Exclude<typeof g, number> => typeof g !== 'number',
  )
  const relatedDevices = (device.relatedDevices || []).filter(
    (d): d is Exclude<typeof d, number> => typeof d !== 'number',
  )

  return (
    <article>
      <Breadcrumbs items={breadcrumbs} />

      <JsonLd
        data={howToJsonLd({
          name: `How to Root ${brand.name} ${device.name}`,
          description: deviceMetaDescription(brand.name, device.name, device.rootMethod || undefined),
          steps: stepsForSchema,
        })}
      />

      <h1>How to Root {brand.name} {device.name}</h1>

      {typeof device.image === 'object' && device.image?.url && (
        <div className="hero-image">
          <Image
            src={device.image.url}
            alt={device.image.alt || `${brand.name} ${device.name}`}
            width={device.image.width || 1200}
            height={device.image.height || 630}
            priority
          />
        </div>
      )}

      <DeviceInfoCard
        brandName={brand.name}
        deviceName={device.name}
        androidVersion={device.androidVersion}
        chipset={device.chipset}
        status={device.status}
        bootloaderUnlockable={device.bootloaderUnlockable}
        rootMethod={device.rootMethod}
        difficulty={device.difficulty}
        twrpAvailable={device.twrpAvailable}
        customRomSupport={device.customRomSupport}
        releaseYear={device.releaseYear}
      />

      {device.introOverride && <RichText data={device.introOverride} />}

      <WarningBox warnings={warnings} />

      <section className="prerequisites">
        <h2>Prerequisites</h2>
        <ul>
          {prerequisites.map((text, i) => (
            <li key={i}>{text}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Step-by-Step Rooting Guide</h2>
        {hasCustomSteps ? (
          <StepList steps={device.steps as any} />
        ) : (
          <div className="step-list">
            <ol>
              {templateSteps.map((step, i) => (
                <li key={i} className="step-item">
                  <h3 className="step-title">
                    <span className="step-number">Step {i + 1}</span>
                    {step.title}
                  </h3>
                  <div className="step-content">
                    <p>{step.text}</p>
                  </div>
                  {step.warning && (
                    <div className="warning-box warning-box--warning">
                      <strong>Warning:</strong> {step.warning}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      <FaqSection faq={device.faq as any} />

      <RelatedGuides guides={relatedGuides as any} />
      <RelatedDevices devices={relatedDevices as any} />
    </article>
  )
}
