export const dynamic = 'force-dynamic'

import React from 'react'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { RichText } from '@/components/RichText'
import { FaqSection } from '@/components/FaqSection'
import { RelatedGuides } from '@/components/RelatedContent'
import { JsonLd } from '@/components/JsonLd'
import { learnMetaTitle, canonicalUrl, articleJsonLd } from '@/lib/seo'

interface Props {
  params: Promise<{ slug: string }>
}

async function getLearnArticle(slug: string) {
  const payload = await getPayload({ config: await config })
  const result = await payload.find({
    collection: 'learn',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return result.docs[0] || null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getLearnArticle(slug)
  if (!article) return {}

  const heroImage = typeof article.heroImage === 'object' ? article.heroImage : null

  return {
    title: article.metaTitle || learnMetaTitle(article.title),
    description: article.metaDescription || article.excerpt,
    alternates: { canonical: canonicalUrl(`/learn/${slug}`) },
    openGraph: {
      ...(heroImage?.url && { images: [{ url: heroImage.url, alt: heroImage.alt || article.title }] }),
    },
  }
}

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: await config })
    const articles = await payload.find({ collection: 'learn', limit: 500, select: { slug: true } })
    return articles.docs.map((a) => ({ slug: a.slug }))
  } catch {
    return []
  }
}

export default async function LearnPage({ params }: Props) {
  const { slug } = await params
  const article = await getLearnArticle(slug)
  if (!article) notFound()

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Learn', url: '/learn' },
    { name: article.title, url: `/learn/${slug}` },
  ]

  const relatedGuides = (article.relatedGuides || []).filter(
    (g): g is Exclude<typeof g, number> => typeof g !== 'number',
  )

  const relatedLearn = (article.relatedLearn || []).filter(
    (l): l is Exclude<typeof l, number> => typeof l !== 'number',
  )

  return (
    <article>
      <Breadcrumbs items={breadcrumbs} />

      <JsonLd
        data={articleJsonLd({
          headline: article.title,
          description: article.excerpt,
          url: `/learn/${slug}`,
          image: (typeof article.heroImage === 'object' ? article.heroImage : null)?.url || null,
          datePublished: (article as any).createdAt,
          dateModified: (article as any).updatedAt,
        })}
      />

      <h1>{article.title}</h1>

      {typeof article.heroImage === 'object' && article.heroImage?.url && (
        <div className="hero-image">
          <Image
            src={article.heroImage.url}
            alt={article.heroImage.alt || article.title}
            width={article.heroImage.width || 1200}
            height={article.heroImage.height || 630}
            sizes="(max-width: 960px) 100vw, 960px"
            priority
          />
        </div>
      )}

      <p className="excerpt">{article.excerpt}</p>

      <RichText data={article.content} />

      <FaqSection faq={article.faq as any} />

      <RelatedGuides guides={relatedGuides as any} />

      {relatedLearn.length > 0 && (
        <section className="related-section">
          <h2>Related Articles</h2>
          <div className="card-grid">
            {relatedLearn.map((item) => (
              <Link key={item.id} href={`/learn/${item.slug}`} className="guide-card">
                <h3 className="guide-card-title">{item.title}</h3>
                <p className="guide-card-excerpt">{item.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
