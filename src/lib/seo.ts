const SITE_NAME = 'Android Rooting'
const SITE_URL = 'https://androidrooting.com'

export function metaTitle(title: string): string {
  return `${title} | ${SITE_NAME}`
}

export function deviceMetaTitle(brand: string, model: string): string {
  return `How to Root ${brand} ${model} — Step-by-Step Guide | ${SITE_NAME}`
}

export function brandMetaTitle(brand: string): string {
  return `Root ${brand} Devices — Guides & Status | ${SITE_NAME}`
}

export function guideMetaTitle(title: string): string {
  return `${title} — Complete Guide | ${SITE_NAME}`
}

export function learnMetaTitle(title: string): string {
  return `${title} | ${SITE_NAME}`
}

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

export interface BreadcrumbItem {
  name: string
  url: string
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

export function howToJsonLd(opts: {
  name: string
  description: string
  steps: { name: string; text: string }[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: opts.name,
    description: opts.description,
    step: opts.steps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: step.name,
      text: step.text,
    })),
  }
}

export function articleJsonLd(opts: {
  headline: string
  description: string
  url: string
  datePublished?: string
  dateModified?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.headline,
    description: opts.description,
    url: opts.url.startsWith('http') ? opts.url : `${SITE_URL}${opts.url}`,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(opts.datePublished && { datePublished: opts.datePublished }),
    ...(opts.dateModified && { dateModified: opts.dateModified }),
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
  }
}
