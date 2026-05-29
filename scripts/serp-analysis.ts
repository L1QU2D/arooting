/**
 * SERP Analysis Script
 *
 * Takes top keywords and uses SerpAPI to fetch the top 3 ranking pages,
 * then scrapes their content to understand what's ranking.
 *
 * Usage:
 *   npx tsx scripts/serp-analysis.ts                     # Analyze all priority keywords
 *   npx tsx scripts/serp-analysis.ts "root samsung"      # Analyze a specific keyword
 */
import 'dotenv/config'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const SERPAPI_KEY = process.env.SERPAPI_KEY!

interface SerpResult {
  keyword: string
  position: number
  title: string
  url: string
  snippet: string
  domain: string
}

interface PageAnalysis {
  keyword: string
  results: SerpResult[]
  featuredSnippet: string | null
  peopleAlsoAsk: string[]
  relatedSearches: string[]
}

// ── Fetch SERP results via SerpAPI ────────────────────────────────────

async function fetchSerp(keyword: string): Promise<PageAnalysis> {
  const params = new URLSearchParams({
    q: keyword,
    api_key: SERPAPI_KEY,
    engine: 'google',
    gl: 'us',
    hl: 'en',
    num: '10',
  })

  const res = await fetch(`https://serpapi.com/search.json?${params}`)
  if (!res.ok) {
    throw new Error(`SerpAPI ${res.status}: ${await res.text()}`)
  }

  const data = await res.json()

  const results: SerpResult[] = []
  if (data.organic_results) {
    for (let i = 0; i < Math.min(3, data.organic_results.length); i++) {
      const r = data.organic_results[i]
      results.push({
        keyword,
        position: r.position || i + 1,
        title: r.title || '',
        url: r.link || '',
        snippet: r.snippet || '',
        domain: new URL(r.link || 'https://unknown.com').hostname,
      })
    }
  }

  let featuredSnippet: string | null = null
  if (data.answer_box) {
    featuredSnippet = data.answer_box.snippet || data.answer_box.answer || null
  }

  const peopleAlsoAsk: string[] = []
  if (data.related_questions) {
    for (const q of data.related_questions) {
      if (q.question) peopleAlsoAsk.push(q.question)
    }
  }

  const relatedSearches: string[] = []
  if (data.related_searches) {
    for (const r of data.related_searches) {
      if (r.query) relatedSearches.push(r.query)
    }
  }

  return { keyword, results, featuredSnippet, peopleAlsoAsk, relatedSearches }
}

// ── Fetch and extract page content ────────────────────────────────────

async function fetchPageContent(url: string): Promise<string> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })
    clearTimeout(timeout)

    if (!res.ok) return `[HTTP ${res.status}]`

    const html = await res.text()

    // Extract useful content from HTML
    // Remove scripts, styles, nav, footer
    let text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')

    // Extract headings
    const headings: string[] = []
    const headingRegex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi
    let match
    while ((match = headingRegex.exec(text)) !== null) {
      const headingText = match[2].replace(/<[^>]+>/g, '').trim()
      if (headingText) headings.push(`H${match[1]}: ${headingText}`)
    }

    // Extract meta description
    const metaMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i)
    const metaDesc = metaMatch ? metaMatch[1].trim() : ''

    // Extract title
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : ''

    // Get plain text content
    const plainText = text
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    const wordCount = plainText.split(/\s+/).length

    return [
      `Title: ${title}`,
      `Meta Description: ${metaDesc}`,
      `Word Count: ~${wordCount}`,
      ``,
      `Headings:`,
      ...headings.map(h => `  ${h}`),
      ``,
      `Content Preview (first 500 chars):`,
      plainText.slice(0, 500),
    ].join('\n')
  } catch (err) {
    return `[Error fetching: ${err instanceof Error ? err.message : String(err)}]`
  }
}

// ── Generate analysis markdown ────────────────────────────────────────

async function analyzeKeywords(keywords: string[]): Promise<string> {
  const lines: string[] = []

  lines.push('# SERP Analysis - Android Rooting Keywords')
  lines.push('')
  lines.push(`> **Generated:** ${new Date().toISOString().split('T')[0]}`)
  lines.push(`> **Source:** SerpAPI (Google US)`)
  lines.push(`> **Keywords analyzed:** ${keywords.length}`)
  lines.push('')
  lines.push('---')
  lines.push('')

  for (let ki = 0; ki < keywords.length; ki++) {
    const keyword = keywords[ki]
    console.log(`\n[${ki + 1}/${keywords.length}] Analyzing: "${keyword}"`)

    const analysis = await fetchSerp(keyword)

    lines.push(`## "${keyword}"`)
    lines.push('')

    if (analysis.featuredSnippet) {
      lines.push('**Featured Snippet:**')
      lines.push(`> ${analysis.featuredSnippet}`)
      lines.push('')
    }

    lines.push('### Top 3 Ranking Pages')
    lines.push('')

    for (const result of analysis.results) {
      console.log(`  #${result.position}: ${result.domain} - ${result.title}`)

      lines.push(`#### #${result.position}: ${result.title}`)
      lines.push(`- **URL:** ${result.url}`)
      lines.push(`- **Domain:** ${result.domain}`)
      lines.push(`- **Snippet:** ${result.snippet}`)
      lines.push('')

      // Fetch and analyze page content
      console.log(`    Fetching content...`)
      const content = await fetchPageContent(result.url)
      lines.push('**Page Analysis:**')
      lines.push('```')
      lines.push(content)
      lines.push('```')
      lines.push('')

      await new Promise(r => setTimeout(r, 500))
    }

    if (analysis.peopleAlsoAsk.length > 0) {
      lines.push('### People Also Ask')
      for (const q of analysis.peopleAlsoAsk) {
        lines.push(`- ${q}`)
      }
      lines.push('')
    }

    if (analysis.relatedSearches.length > 0) {
      lines.push('### Related Searches')
      for (const q of analysis.relatedSearches) {
        lines.push(`- ${q}`)
      }
      lines.push('')
    }

    lines.push('### Content Strategy Notes')
    lines.push('')
    lines.push('To outrank these pages, our page should:')
    lines.push('- [ ] Cover all subtopics from the top 3 results')
    lines.push('- [ ] Answer all "People Also Ask" questions')
    lines.push('- [ ] Be more up-to-date (latest Android versions, latest Magisk)')
    lines.push('- [ ] Include step-by-step instructions with screenshots')
    lines.push('- [ ] Add unique value (compatibility tables, risk warnings, video)')
    lines.push('')
    lines.push('---')
    lines.push('')

    // Rate limit between SERP queries
    await new Promise(r => setTimeout(r, 1000))
  }

  return lines.join('\n')
}

// ── Main ──────────────────────────────────────────────────────────────

async function main() {
  console.log('=== SERP Analysis for Android Rooting ===')

  // Check for specific keyword argument
  const specificKeyword = process.argv[2]

  let keywords: string[]

  if (specificKeyword) {
    keywords = [specificKeyword]
    console.log(`Analyzing specific keyword: "${specificKeyword}"`)
  } else {
    // Priority keywords for programmatic pages
    keywords = [
      // Head terms
      'how to root android',
      'root android phone',

      // Samsung (biggest brand)
      'how to root samsung galaxy s24',
      'root samsung galaxy s24 ultra',
      'root samsung without pc',

      // Pixel
      'how to root pixel 9',
      'root google pixel',

      // OnePlus
      'root oneplus 12',

      // Xiaomi
      'root xiaomi redmi note 13',

      // Tools
      'magisk root android',
      'kernelsu vs magisk',
      'install twrp recovery',
      'unlock bootloader android',

      // Informational
      'is it safe to root android',
      'root android without pc',
    ]
    console.log(`Analyzing ${keywords.length} priority keywords`)
  }

  const markdown = await analyzeKeywords(keywords)

  const filename = specificKeyword
    ? `serp-analysis-${specificKeyword.replace(/\s+/g, '-').toLowerCase()}.md`
    : 'serp-analysis.md'

  const outPath = resolve(import.meta.dirname, '..', filename)
  writeFileSync(outPath, markdown, 'utf-8')
  console.log(`\nResults saved to: ${filename}`)
}

main().catch(console.error)
