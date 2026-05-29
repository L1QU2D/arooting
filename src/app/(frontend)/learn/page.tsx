export const dynamic = 'force-dynamic'

import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { canonicalUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Learn About Android Rooting — What It Is, Risks & Benefits',
  description:
    'Understand what Android rooting is, whether it is safe, the benefits and risks, and how rooting works under the hood.',
  alternates: { canonical: canonicalUrl('/learn') },
}

export default async function LearnIndexPage() {
  let articles = { docs: [] as any[] }

  try {
    const payload = await getPayload({ config: await config })
    articles = await payload.find({ collection: 'learn', limit: 100, sort: 'title' })
  } catch {
    // Tables may not exist during initial build
  }

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Learn', url: '/learn' },
  ]

  return (
    <div>
      <Breadcrumbs items={breadcrumbs} />

      <h1>Learn About Android Rooting</h1>
      <p>
        New to rooting? Start here. These articles explain what rooting is, whether it is safe,
        the benefits and risks, and everything you need to know before getting started.
      </p>

      {articles.docs.length > 0 ? (
        <div className="card-grid">
          {articles.docs.map((article) => (
            <Link key={article.id} href={`/learn/${article.slug}`} className="guide-card">
              <h3 className="guide-card-title">{article.title}</h3>
              <p className="guide-card-excerpt">{article.excerpt}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p>No articles available yet. Check back soon.</p>
      )}
    </div>
  )
}
