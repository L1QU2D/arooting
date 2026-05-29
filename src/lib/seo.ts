const SITE_NAME = 'Android Rooting'
const SITE_URL = 'https://androidrooting.com'

// --- Title helpers (layout template appends " | Android Rooting") ---

export function metaTitle(title: string): string {
  return title
}

export function deviceMetaTitle(brand: string, model: string): string {
  return `How to Root ${brand} ${model} — Step-by-Step Guide`
}

export function brandMetaTitle(brand: string): string {
  return `Root ${brand} Devices — Guides & Status`
}

export function guideMetaTitle(title: string): string {
  return `${title} — Complete Guide`
}

export function learnMetaTitle(title: string): string {
  return title
}

// --- Description helpers ---

export function deviceMetaDescription(brand: string, model: string, rootMethod?: string): string {
  const method = rootMethod ? ` using ${formatRootMethod(rootMethod)}` : ''
  return `Learn how to root the ${brand} ${model}${method}. Step-by-step instructions, prerequisites, warnings, and FAQ.`
}

export function brandMetaDescription(brand: string): string {
  return `Browse all ${brand} devices with rooting guides, bootloader unlock status, and root method information.`
}

function formatRootMethod(method: string): string {
  const map: Record<string, string> = {
    magisk: 'Magisk',
    kernelsu: 'KernelSU',
    'magisk-twrp': 'Magisk via TWRP',
    'kernelsu-custom': 'KernelSU (custom kernel)',
    'one-click': 'one-click root',
    multiple: 'multiple methods',
    none: 'N/A',
  }
  return map[method] || method
}

export function canonicalUrl(path: string): string {
  return `${SITE_URL}${path}`
}

// --- JSON-LD Generators ---

const ORG_ID = `${SITE_URL}/#organization`
const WEBSITE_ID = `${SITE_URL}/#website`

export interface BreadcrumbItem {
  name: string
  url: string
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    description:
      'Step-by-step guides to root Android devices using Magisk, KernelSU, TWRP, and more.',
    sameAs: [] as string[],
  }
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  }
}

export function faqJsonLd(faq: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export function articleJsonLd(opts: {
  headline: string
  description: string
  url: string
  image?: string | null
  datePublished?: string
  dateModified?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.headline,
    description: opts.description,
    url: opts.url.startsWith('http') ? opts.url : `${SITE_URL}${opts.url}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': opts.url.startsWith('http') ? opts.url : `${SITE_URL}${opts.url}`,
    },
    author: {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(opts.image && { image: opts.image }),
    ...(opts.datePublished && { datePublished: opts.datePublished }),
    ...(opts.dateModified && { dateModified: opts.dateModified }),
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    description:
      'Step-by-step guides to root Android devices using Magisk, KernelSU, TWRP, and more.',
    publisher: {
      '@type': 'Organization',
      '@id': ORG_ID,
    },
  }
}
