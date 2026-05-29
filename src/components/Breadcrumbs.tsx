import React from 'react'
import Link from 'next/link'
import { JsonLd } from './JsonLd'
import { breadcrumbJsonLd, type BreadcrumbItem } from '@/lib/seo'

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <JsonLd data={breadcrumbJsonLd(items)} />
      <ol>
        {items.map((item, i) => (
          <li key={item.url}>
            {i < items.length - 1 ? (
              <>
                <Link href={item.url}>{item.name}</Link>
                <span aria-hidden="true"> / </span>
              </>
            ) : (
              <span aria-current="page">{item.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
