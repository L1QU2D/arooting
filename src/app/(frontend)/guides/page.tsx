import React from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { GuideCard } from '@/components/GuideCard'
import { canonicalUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Android Rooting Guides — Magisk, KernelSU, TWRP & More',
  description:
    'Step-by-step guides to root Android using Magisk, KernelSU, TWRP, custom ROMs, and more. Clear instructions for beginners and advanced users.',
  alternates: { canonical: canonicalUrl('/guides') },
}

export default async function GuidesIndexPage() {
  let guides = { docs: [] as any[] }

  try {
    const payload = await getPayload({ config: await config })
    guides = await payload.find({ collection: 'guides', limit: 100, sort: 'title' })
  } catch {
    // Tables may not exist during initial build
  }

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Guides', url: '/guides' },
  ]

  return (
    <div>
      <Breadcrumbs items={breadcrumbs} />

      <h1>Android Rooting Guides</h1>
      <p>
        Comprehensive guides covering every rooting method, tool, and technique. Whether you are a
        beginner or experienced user, find the right guide for your needs.
      </p>

      {guides.docs.length > 0 ? (
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
      ) : (
        <p>No guides available yet. Check back soon.</p>
      )}
    </div>
  )
}
