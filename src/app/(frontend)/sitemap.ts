import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'

const BASE_URL = 'https://androidrooting.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1.0 },
  ]

  try {
    const payload = await getPayload({ config: await config })

    // Guides
    const guides = await payload.find({ collection: 'guides', limit: 500, select: { slug: true } })
    for (const guide of guides.docs) {
      entries.push({
        url: `${BASE_URL}/guides/${guide.slug}`,
        changeFrequency: 'monthly',
        priority: 0.9,
      })
    }

    // Brands
    const brands = await payload.find({ collection: 'brands', limit: 500, select: { slug: true } })
    for (const brand of brands.docs) {
      entries.push({
        url: `${BASE_URL}/root/${brand.slug}`,
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }

    // Devices
    const devices = await payload.find({
      collection: 'devices',
      limit: 1000,
      select: { slug: true, brand: true },
      populate: { brands: { slug: true } },
    })
    for (const device of devices.docs) {
      const brand = device.brand as { slug: string } | undefined
      if (brand?.slug) {
        entries.push({
          url: `${BASE_URL}/root/${brand.slug}/${device.slug}`,
          changeFrequency: 'monthly',
          priority: 0.8,
        })
      }
    }

    // Learn
    const learn = await payload.find({ collection: 'learn', limit: 500, select: { slug: true } })
    for (const article of learn.docs) {
      entries.push({
        url: `${BASE_URL}/learn/${article.slug}`,
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }
  } catch {
    // Tables may not exist during initial build
  }

  return entries
}
