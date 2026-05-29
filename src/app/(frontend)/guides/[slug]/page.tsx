export const dynamic = 'force-dynamic'

import React from 'react'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { RichText } from '@/components/RichText'
import { StepList } from '@/components/StepList'
import { FaqSection } from '@/components/FaqSection'
import { RelatedGuides } from '@/components/RelatedContent'
import { JsonLd } from '@/components/JsonLd'
import {
  guideMetaTitle,
  canonicalUrl,
  articleJsonLd,
} from '@/lib/seo'

interface Props {
  params: Promise<{ slug: string }>
}

async function getGuide(slug: string) {
  const payload = await getPayload({ config: await config })
  const result = await payload.find({
    collection: 'guides',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return result.docs[0] || null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const guide = await getGuide(slug)
  if (!guide) return {}

  const heroImage = typeof guide.heroImage === 'object' ? guide.heroImage : null

  return {
    title: guide.metaTitle || guideMetaTitle(guide.title),
    description: guide.metaDescription || guide.excerpt,
    alternates: { canonical: canonicalUrl(`/guides/${slug}`) },
    openGraph: {
      ...(heroImage?.url && { images: [{ url: heroImage.url, alt: heroImage.alt || guide.title }] }),
    },
  }
}

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: await config })
    const guides = await payload.find({ collection: 'guides', limit: 500, select: { slug: true } })
    return guides.docs.map((g) => ({ slug: g.slug }))
  } catch {
    return []
  }
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params
  const guide = await getGuide(slug)
  if (!guide) notFound()

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: guide.title, url: `/guides/${slug}` },
  ]

  const heroImage = typeof guide.heroImage === 'object' ? guide.heroImage : null

  const relatedGuides = (guide.relatedGuides || []).filter(
    (g): g is Exclude<typeof g, number> => typeof g !== 'number',
  )

  return (
    <article>
      <Breadcrumbs items={breadcrumbs} />

      <JsonLd
        data={articleJsonLd({
          headline: guide.title,
          description: guide.excerpt,
          url: `/guides/${slug}`,
          image: heroImage?.url || null,
          datePublished: (guide as any).createdAt,
          dateModified: (guide as any).updatedAt,
        })}
      />

      <h1>{guide.title}</h1>

      {heroImage?.url && (
        <div className="hero-image">
          <Image
            src={heroImage.url}
            alt={heroImage.alt || guide.title}
            width={heroImage.width || 1200}
            height={heroImage.height || 630}
            sizes="(max-width: 960px) 100vw, 960px"
            priority
          />
        </div>
      )}

      <p className="excerpt">{guide.excerpt}</p>

      <RichText data={guide.content} />

      {guide.steps && guide.steps.length > 0 && (
        <section>
          <h2>Step-by-Step Instructions</h2>
          <StepList steps={guide.steps as any} />
        </section>
      )}

      {guide.compatibilityNote && (
        <section>
          <h2>Compatibility Notes</h2>
          <RichText data={guide.compatibilityNote} />
        </section>
      )}

      {guide.downloadLinks && guide.downloadLinks.length > 0 && (
        <section className="download-links">
          <h2>Downloads</h2>
          {guide.downloadLinks.map((link, i) => (
            <a
              key={i}
              href={link.url}
              className="download-link"
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              {link.label}
              {link.version && <span> (v{link.version})</span>}
            </a>
          ))}
        </section>
      )}

      <FaqSection faq={guide.faq as any} />

      <RelatedGuides guides={relatedGuides as any} />
    </article>
  )
}
