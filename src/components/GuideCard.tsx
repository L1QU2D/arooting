import React from 'react'
import Link from 'next/link'

interface GuideCardProps {
  title: string
  slug: string
  excerpt: string
  category?: string | null
}

const categoryLabels: Record<string, string> = {
  'root-tool': 'Root Tool',
  recovery: 'Recovery',
  'custom-rom': 'Custom ROM',
  bootloader: 'Bootloader',
  'root-method': 'Root Method',
  detection: 'Detection',
  framework: 'Framework',
}

export function GuideCard({ title, slug, excerpt, category }: GuideCardProps) {
  return (
    <Link href={`/guides/${slug}`} className="guide-card">
      {category && (
        <span className="guide-card-category">{categoryLabels[category] || category}</span>
      )}
      <h3 className="guide-card-title">{title}</h3>
      <p className="guide-card-excerpt">{excerpt}</p>
    </Link>
  )
}
