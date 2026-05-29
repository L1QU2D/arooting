/**
 * Content Generation Pipeline
 *
 * Generates high-quality, AI-written content for all seeded pages.
 * SERP-scrapes competitors, feeds context to an LLM, parses structured
 * output into Payload Lexical richText, generates hero images, and
 * updates pages in Payload.
 *
 * Usage:
 *   npx tsx scripts/generate-content.ts [flags]
 *
 *   --type guides|learn|devices    # default: all, in order
 *   --slug <slug>                  # single page only
 *   --dry-run                      # preview without DB writes
 *   --skip-images                  # skip image generation
 *   --resume-from <slug>           # skip pages until this slug
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

// ── Config ──────────────────────────────────────────────────────────────

const SERPAPI_KEY = process.env.SERPAPI_KEY || ''
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''
const CONTENT_MODEL = process.env.CONTENT_MODEL || 'deepseek/deepseek-v4-pro'
const IMAGE_MODEL = process.env.IMAGE_MODEL || 'bytedance-seed/seedream-4.5'

// ── CLI Arg Parsing ─────────────────────────────────────────────────────

interface CliArgs {
  type: ('guides' | 'learn' | 'devices')[]
  slug: string | null
  dryRun: boolean
  skipImages: boolean
  imagesOnly: boolean
  resumeFrom: string | null
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2)
  const result: CliArgs = {
    type: ['guides', 'learn', 'devices'],
    slug: null,
    dryRun: false,
    skipImages: false,
    imagesOnly: false,
    resumeFrom: null,
  }

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--type':
        result.type = [args[++i] as 'guides' | 'learn' | 'devices']
        break
      case '--slug':
        result.slug = args[++i]
        break
      case '--dry-run':
        result.dryRun = true
        break
      case '--skip-images':
        result.skipImages = true
        break
      case '--images-only':
        result.imagesOnly = true
        break
      case '--resume-from':
        result.resumeFrom = args[++i]
        break
    }
  }

  return result
}

// ── Types ───────────────────────────────────────────────────────────────

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

interface CompetitorAnalysis {
  serps: PageAnalysis[]
  competitorContent: { url: string; content: string }[]
  allPAA: string[]
}

interface LLMSection {
  type: 'paragraph' | 'heading' | 'list'
  text?: string
  tag?: 'h2' | 'h3'
  items?: string[]
}

interface GuideResponse {
  excerpt: string
  metaTitle: string
  metaDescription: string
  content: LLMSection[]
  steps: { title: string; content: LLMSection[]; warning: string | null }[]
  faq: { question: string; answer: string }[]
}

interface LearnResponse {
  excerpt: string
  metaTitle: string
  metaDescription: string
  content: LLMSection[]
  faq: { question: string; answer: string }[]
}

interface DeviceResponse {
  excerpt: string
  metaTitle: string
  metaDescription: string
  content: LLMSection[]
  introOverride: LLMSection[]
  prerequisites: string[]
  warnings: string[]
  steps: { title: string; content: LLMSection[]; warning: string | null }[]
  faq: { question: string; answer: string }[]
  targetKeywords: string[]
}

// ── SERP Functions ──────────────────────────────────────────────────────

async function fetchSerp(keyword: string): Promise<PageAnalysis> {
  if (!SERPAPI_KEY) {
    console.log(`    ⚠ No SERPAPI_KEY, skipping SERP for "${keyword}"`)
    return { keyword, results: [], featuredSnippet: null, peopleAlsoAsk: [], relatedSearches: [] }
  }

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

async function fetchPageContent(url: string): Promise<string> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })
    clearTimeout(timeout)

    if (!res.ok) return `[HTTP ${res.status}]`

    const html = await res.text()

    let text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')

    const headings: string[] = []
    const headingRegex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi
    let match
    while ((match = headingRegex.exec(text)) !== null) {
      const headingText = match[2].replace(/<[^>]+>/g, '').trim()
      if (headingText) headings.push(`H${match[1]}: ${headingText}`)
    }

    const metaMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i)
    const metaDesc = metaMatch ? metaMatch[1].trim() : ''

    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : ''

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
      ...headings.map((h) => `  ${h}`),
      ``,
      `Content Preview (first 2000 chars):`,
      plainText.slice(0, 2000),
    ].join('\n')
  } catch (err) {
    return `[Error fetching: ${err instanceof Error ? err.message : String(err)}]`
  }
}

async function analyzeCompetitors(keywords: string[]): Promise<CompetitorAnalysis> {
  const serps: PageAnalysis[] = []
  const competitorContent: { url: string; content: string }[] = []
  const allPAA: string[] = []
  const seenUrls = new Set<string>()

  for (const keyword of keywords) {
    try {
      console.log(`    SERP: "${keyword}"`)
      const analysis = await fetchSerp(keyword)
      serps.push(analysis)

      for (const q of analysis.peopleAlsoAsk) {
        if (!allPAA.includes(q)) allPAA.push(q)
      }

      for (const result of analysis.results.slice(0, 3)) {
        if (seenUrls.has(result.url)) continue
        seenUrls.add(result.url)
        console.log(`    Scraping: ${result.domain}`)
        const content = await fetchPageContent(result.url)
        competitorContent.push({ url: result.url, content })
        await sleep(500)
      }

      await sleep(1000)
    } catch (err) {
      console.log(`    ⚠ SERP failed for "${keyword}": ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return { serps, competitorContent, allPAA }
}

// ── OpenRouter LLM Client ───────────────────────────────────────────────

async function callLLM(messages: { role: string; content: string }[]): Promise<string> {
  const maxAttempts = 3
  const baseDelay = 2000

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: CONTENT_MODEL,
          messages,
          temperature: 0.7,
          max_tokens: 8000,
          response_format: { type: 'json_object' },
        }),
      })

      if (res.status === 429) {
        const retryAfter = res.headers.get('retry-after')
        const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : baseDelay * Math.pow(2, attempt - 1)
        console.log(`    Rate limited, retrying in ${delay / 1000}s...`)
        await sleep(delay)
        continue
      }

      if (!res.ok) {
        const body = await res.text()
        throw new Error(`OpenRouter ${res.status}: ${body}`)
      }

      const data = await res.json()
      return data.choices[0].message.content
    } catch (err) {
      if (attempt === maxAttempts) throw err
      const delay = baseDelay * Math.pow(2, attempt - 1)
      console.log(`    LLM attempt ${attempt} failed, retrying in ${delay / 1000}s...`)
      await sleep(delay)
    }
  }

  throw new Error('LLM call failed after all retries')
}

async function generateImage(prompt: string): Promise<Buffer | null> {
  const maxAttempts = 2

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: IMAGE_MODEL,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (!res.ok) {
        const body = await res.text()
        throw new Error(`OpenRouter image ${res.status}: ${body}`)
      }

      const data = await res.json()
      const choice = data.choices?.[0]?.message

      // Handle various response formats
      let base64: string | null = null

      // SeedDream and similar models: images array on message object
      if (!base64 && Array.isArray(choice?.images)) {
        for (const img of choice.images) {
          const url = img.image_url?.url || img.url
          if (url) {
            if (url.startsWith('data:image/')) {
              base64 = url.split(',')[1]
            } else {
              base64 = url
            }
            break
          }
        }
      }

      if (!base64 && choice?.content) {
        const content = choice.content

        // Plain base64 string or data URL
        if (typeof content === 'string') {
          if (content.startsWith('data:image/')) {
            base64 = content.split(',')[1]
          } else if (content.match(/^[A-Za-z0-9+/=]+$/)) {
            base64 = content
          }
        }

        // Structured content blocks (array of parts)
        if (Array.isArray(content)) {
          for (const part of content) {
            if (part.type === 'image_url' && part.image_url?.url) {
              const url = part.image_url.url
              if (url.startsWith('data:image/')) {
                base64 = url.split(',')[1]
              } else {
                base64 = url
              }
              break
            }
            if (part.type === 'image' && part.source?.data) {
              base64 = part.source.data
              break
            }
          }
        }
      }

      // Check for image in response data directly (some models use this)
      if (!base64 && data.data?.[0]?.b64_json) {
        base64 = data.data[0].b64_json
      }

      if (!base64) {
        throw new Error('No image data found in response')
      }

      return Buffer.from(base64, 'base64')
    } catch (err) {
      if (attempt === maxAttempts) {
        console.log(`    ⚠ Image generation failed: ${err instanceof Error ? err.message : String(err)}`)
        return null
      }
      console.log(`    Image attempt ${attempt} failed, retrying...`)
      await sleep(2000)
    }
  }

  return null
}

// ── Lexical RichText Builders ───────────────────────────────────────────

function lexicalTextNode(text: string) {
  return { type: 'text', text, version: 1 }
}

function lexicalParagraph(text: string) {
  return {
    type: 'paragraph',
    children: [lexicalTextNode(text)],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  }
}

function lexicalHeading(text: string, tag: 'h2' | 'h3') {
  return {
    type: 'heading',
    tag,
    children: [lexicalTextNode(text)],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  }
}

function lexicalList(items: string[], listType: 'bullet' | 'number') {
  return {
    type: 'list',
    tag: listType === 'number' ? ('ol' as const) : ('ul' as const),
    listType,
    start: 1,
    children: items.map((item) => ({
      type: 'listitem',
      children: [lexicalTextNode(item)],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
      value: 1,
    })),
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  }
}

function buildLexicalDocument(sections: LLMSection[]) {
  const children: any[] = []

  for (const section of sections) {
    switch (section.type) {
      case 'heading':
        children.push(lexicalHeading(section.text || '', (section.tag as 'h2' | 'h3') || 'h2'))
        break
      case 'list':
        children.push(lexicalList(section.items || [], 'bullet'))
        break
      case 'paragraph':
      default:
        children.push(lexicalParagraph(section.text || ''))
        break
    }
  }

  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

function richText(text: string) {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text, version: 1 }],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          version: 1,
        },
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

// ── Payload Media Upload ────────────────────────────────────────────────

async function uploadImage(
  payload: any,
  buffer: Buffer,
  filename: string,
  alt: string,
): Promise<number> {
  // Convert Buffer to Uint8Array for miniflare/Cloudflare Workers compatibility
  const data = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
  const media = await payload.create({
    collection: 'media',
    data: { alt },
    file: {
      data,
      name: filename,
      mimetype: 'image/png',
      size: buffer.length,
    },
  })
  return media.id
}

// ── LLM Prompt Templates ───────────────────────────────────────────────

const SYSTEM_MESSAGE = `You are an expert Android rooting technical writer. You write comprehensive, accurate, actionable guides for an audience ranging from beginners to advanced users. Your output must be strict JSON matching the requested schema. Do not include any text outside the JSON object. Do not use markdown code fences around the JSON.`

function buildGuidePrompt(
  guide: any,
  competitors: CompetitorAnalysis,
): { role: string; content: string }[] {
  const competitorSummary = competitors.competitorContent
    .map((c) => `--- ${c.url} ---\n${c.content}`)
    .join('\n\n')

  const paaList = competitors.allPAA.length > 0
    ? `\nPeople Also Ask questions to address:\n${competitors.allPAA.map((q) => `- ${q}`).join('\n')}`
    : ''

  return [
    { role: 'system', content: SYSTEM_MESSAGE },
    {
      role: 'user',
      content: `Write comprehensive content for an Android rooting guide page.

Page title: "${guide.title}"
Slug: "${guide.slug}"
Category: "${guide.category || 'general'}"
Current excerpt: "${guide.excerpt}"
Current keywords: ${(guide.targetKeywords || []).map((k: any) => k.keyword).join(', ')}

## Competitor Analysis
${competitorSummary || 'No competitor data available.'}
${paaList}

## Output JSON Schema
{
  "excerpt": "150-200 character summary for search results",
  "metaTitle": "max 60 chars, include primary keyword",
  "metaDescription": "150-160 chars, compelling with keyword",
  "content": [
    { "type": "paragraph", "text": "..." },
    { "type": "heading", "text": "...", "tag": "h2" },
    { "type": "heading", "text": "...", "tag": "h3" },
    { "type": "list", "items": ["item1", "item2"] }
  ],
  "steps": [
    { "title": "Step title", "content": [{ "type": "paragraph", "text": "..." }], "warning": "optional warning text or null" }
  ],
  "faq": [
    { "question": "...", "answer": "2-4 sentence answer" }
  ]
}

## Writing Instructions
- Target 2500-4000 words total content
- 6-10 detailed steps with specific commands, file paths, and version numbers
- 5-8 FAQ entries, each answer 2-4 sentences
- More comprehensive than the competitor pages above
- Reference 2025/2026 Android versions and current tool versions
- Naturally incorporate keywords ("${(guide.targetKeywords || []).map((k: any) => k.keyword).join('", "')}") in the first paragraph and 2+ headings
- Include specific terminal commands, file paths, and exact settings locations
- No fluff, filler phrases, or generic advice
- Every paragraph should provide actionable information
- Address the "People Also Ask" questions in the FAQ section where relevant`,
    },
  ]
}

function buildLearnPrompt(
  article: any,
  competitors: CompetitorAnalysis,
): { role: string; content: string }[] {
  const competitorSummary = competitors.competitorContent
    .map((c) => `--- ${c.url} ---\n${c.content}`)
    .join('\n\n')

  const paaList = competitors.allPAA.length > 0
    ? `\nPeople Also Ask questions to address:\n${competitors.allPAA.map((q) => `- ${q}`).join('\n')}`
    : ''

  return [
    { role: 'system', content: SYSTEM_MESSAGE },
    {
      role: 'user',
      content: `Write comprehensive educational content for an Android rooting knowledge base article.

Page title: "${article.title}"
Slug: "${article.slug}"
Current excerpt: "${article.excerpt}"
Current keywords: ${(article.targetKeywords || []).map((k: any) => k.keyword).join(', ')}

## Competitor Analysis
${competitorSummary || 'No competitor data available.'}
${paaList}

## Output JSON Schema
{
  "excerpt": "150-200 character summary for search results",
  "metaTitle": "max 60 chars, include primary keyword",
  "metaDescription": "150-160 chars, compelling with keyword",
  "content": [
    { "type": "paragraph", "text": "..." },
    { "type": "heading", "text": "...", "tag": "h2" },
    { "type": "heading", "text": "...", "tag": "h3" },
    { "type": "list", "items": ["item1", "item2"] }
  ],
  "faq": [
    { "question": "...", "answer": "2-4 sentence answer" }
  ]
}

## Writing Instructions
- Target 2000-3000 words total content
- This is an educational/informational article, NOT a step-by-step guide
- Use h2 for major sections, h3 for subsections
- 5-8 FAQ entries, each answer 2-4 sentences
- More comprehensive than the competitor pages above
- Reference 2025/2026 Android versions and current tool versions
- Naturally incorporate keywords ("${(article.targetKeywords || []).map((k: any) => k.keyword).join('", "')}") in the first paragraph and 2+ headings
- Include specific examples, comparisons, and real-world scenarios
- No fluff, filler phrases, or generic advice
- Every paragraph should provide useful, specific information
- Address the "People Also Ask" questions in the FAQ section where relevant`,
    },
  ]
}

function buildDevicePrompt(
  device: any,
  brandInfo: any,
  competitors: CompetitorAnalysis,
): { role: string; content: string }[] {
  const competitorSummary = competitors.competitorContent
    .map((c) => `--- ${c.url} ---\n${c.content}`)
    .join('\n\n')

  const paaList = competitors.allPAA.length > 0
    ? `\nPeople Also Ask questions to address:\n${competitors.allPAA.map((q) => `- ${q}`).join('\n')}`
    : ''

  const specs = [
    `Device: ${device.name}`,
    `Model: ${device.modelNumber || 'N/A'}`,
    `Android Version: ${device.androidVersion || 'N/A'}`,
    `Chipset: ${device.chipset || 'N/A'}`,
    `Release Year: ${device.releaseYear || 'N/A'}`,
    `Root Status: ${device.status || 'unknown'}`,
    `Bootloader Unlockable: ${device.bootloaderUnlockable || 'unknown'}`,
    `Root Method: ${device.rootMethod || 'none'}`,
    `TWRP Available: ${device.twrpAvailable ? 'Yes' : 'No'}`,
    `Custom ROM Support: ${device.customRomSupport ? 'Yes' : 'No'}`,
    `Difficulty: ${device.difficulty || 'intermediate'}`,
  ].join('\n')

  const brandNotes = brandInfo
    ? `\nBrand: ${brandInfo.name}\nBootloader Unlock Notes: ${brandInfo.bootloaderUnlockNotes || 'N/A'}`
    : ''

  return [
    { role: 'system', content: SYSTEM_MESSAGE },
    {
      role: 'user',
      content: `Write comprehensive rooting content for a specific Android device page.

${specs}
${brandNotes}

Current keywords: ${(device.targetKeywords || []).map((k: any) => k.keyword).join(', ')}

## Competitor Analysis
${competitorSummary || 'No competitor data available.'}
${paaList}

## Output JSON Schema
{
  "excerpt": "150-200 character summary",
  "metaTitle": "max 60 chars, include device name and 'root'",
  "metaDescription": "150-160 chars, include device name",
  "content": [
    { "type": "paragraph", "text": "..." },
    { "type": "heading", "text": "...", "tag": "h2" },
    { "type": "list", "items": ["item1", "item2"] }
  ],
  "introOverride": [
    { "type": "paragraph", "text": "device-specific introduction" }
  ],
  "prerequisites": ["prerequisite 1", "prerequisite 2"],
  "warnings": ["warning 1", "warning 2"],
  "steps": [
    { "title": "Step title", "content": [{ "type": "paragraph", "text": "..." }], "warning": "optional warning or null" }
  ],
  "faq": [
    { "question": "...", "answer": "2-4 sentence answer" }
  ],
  "targetKeywords": ["keyword1", "keyword2"]
}

## Writing Instructions
- Target 1500-2500 words total content
- Write device-specific rooting steps (not generic instructions)
- Include the exact model number, chipset-specific notes, and firmware download locations
- 5-8 FAQ entries, each answer 2-4 sentences
- Include 3-5 prerequisites specific to this device
- Include 2-4 warnings specific to this device/brand
- Generate 3-6 target SEO keywords for this device
- Reference 2025/2026 Android versions and current tool versions
- Include specific commands with device-specific parameters
- Mention chipset-specific considerations (${device.chipset || 'N/A'})
${brandInfo?.bootloaderUnlockNotes ? `- Address brand-specific bootloader unlock: ${brandInfo.bootloaderUnlockNotes}` : ''}
- No fluff, filler phrases, or generic advice
- Address the "People Also Ask" questions in the FAQ section where relevant`,
    },
  ]
}

// ── Response Parsing ────────────────────────────────────────────────────

function parseJSON(raw: string): any {
  // Try direct parse
  try {
    return JSON.parse(raw)
  } catch {}

  // Try extracting from ```json fences
  const fenceMatch = raw.match(/```json\s*([\s\S]*?)```/)
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim())
    } catch {}
  }

  // Try first { to last }
  const firstBrace = raw.indexOf('{')
  const lastBrace = raw.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(raw.slice(firstBrace, lastBrace + 1))
    } catch {}
  }

  throw new Error('Failed to parse LLM response as JSON')
}

function validateGuideResponse(data: any): GuideResponse {
  if (!data.content || !Array.isArray(data.content)) throw new Error('Missing content array')
  if (!data.steps || !Array.isArray(data.steps)) throw new Error('Missing steps array')
  if (!data.faq || !Array.isArray(data.faq)) throw new Error('Missing faq array')
  if (!data.excerpt) throw new Error('Missing excerpt')
  if (!data.metaTitle) throw new Error('Missing metaTitle')
  if (!data.metaDescription) throw new Error('Missing metaDescription')
  return data as GuideResponse
}

function validateLearnResponse(data: any): LearnResponse {
  if (!data.content || !Array.isArray(data.content)) throw new Error('Missing content array')
  if (!data.faq || !Array.isArray(data.faq)) throw new Error('Missing faq array')
  if (!data.excerpt) throw new Error('Missing excerpt')
  if (!data.metaTitle) throw new Error('Missing metaTitle')
  if (!data.metaDescription) throw new Error('Missing metaDescription')
  return data as LearnResponse
}

function validateDeviceResponse(data: any): DeviceResponse {
  if (!data.content || !Array.isArray(data.content)) throw new Error('Missing content array')
  if (!data.faq || !Array.isArray(data.faq)) throw new Error('Missing faq array')
  if (!data.excerpt) throw new Error('Missing excerpt')
  if (!data.metaTitle) throw new Error('Missing metaTitle')
  if (!data.metaDescription) throw new Error('Missing metaDescription')
  // Defaults for optional fields
  if (!data.introOverride) data.introOverride = []
  if (!data.prerequisites) data.prerequisites = []
  if (!data.warnings) data.warnings = []
  if (!data.steps) data.steps = []
  if (!data.targetKeywords) data.targetKeywords = []
  return data as DeviceResponse
}

// ── Image Prompt Templates ──────────────────────────────────────────────

function guideImagePrompt(guide: any): string {
  return `Digital illustration on a dark background with neon green and cyan accents, circuit board aesthetic. An Android robot mascot with glowing root branches extending from its base, surrounded by floating terminal windows and code symbols. Represent the concept of "${guide.title}". No text in the image. Clean, modern, tech blog style.`
}

function learnImagePrompt(article: any): string {
  return `Digital illustration on a dark background with neon green and cyan accents, abstract tech aesthetic. A stylized smartphone showing glowing internal components and circuitry, representing Android system knowledge. Concept: "${article.title}". No text in the image. Clean, modern, tech blog hero image style.`
}

function deviceImagePrompt(device: any): string {
  return `Digital illustration on a dark background with neon green and cyan accents, circuit board aesthetic. A stylized ${device.name} smartphone with a glowing root symbol (a tree root icon) emanating from the screen, surrounded by digital particles. No text in the image. Clean, modern, tech blog style.`
}

// ── Page Processors ─────────────────────────────────────────────────────

async function processGuide(payload: any, guide: any, args: CliArgs) {
  if (args.imagesOnly) {
    console.log(`  Generating hero image...`)
    const imgPrompt = guideImagePrompt(guide)
    const buffer = await generateImage(imgPrompt)
    if (buffer) {
      console.log(`  Uploading image...`)
      const heroImageId = await uploadImage(payload, buffer, `guide-${guide.slug}.png`, `${guide.title} hero image`)
      if (args.dryRun) {
        console.log(`  [DRY RUN] Would set heroImage=${heroImageId} on guide "${guide.title}"`)
      } else {
        await payload.update({ collection: 'guides', id: guide.id, data: { heroImage: heroImageId } })
        console.log(`  Updated guide image: "${guide.title}"`)
      }
    }
    return
  }

  const keywords = (guide.targetKeywords || []).map((k: any) => k.keyword)
  if (keywords.length === 0) {
    // Fallback keywords from slug
    keywords.push(guide.slug.replace(/-/g, ' '))
    keywords.push(`${guide.slug.replace(/-/g, ' ')} android`)
  }

  console.log(`  Analyzing competitors...`)
  const competitors = await analyzeCompetitors(keywords.slice(0, 3))

  console.log(`  Generating content via LLM...`)
  const messages = buildGuidePrompt(guide, competitors)
  const rawResponse = await callLLM(messages)
  const parsed = parseJSON(rawResponse)
  const response = validateGuideResponse(parsed)

  console.log(`  Building Lexical content...`)
  const content = buildLexicalDocument(response.content)
  const steps = response.steps.map((step) => ({
    title: step.title,
    content: buildLexicalDocument(step.content),
    warning: step.warning || null,
  }))
  const faq = response.faq.map((f) => ({
    question: f.question,
    answer: richText(f.answer),
  }))

  let heroImageId: number | null = null
  if (!args.skipImages) {
    console.log(`  Generating hero image...`)
    const imgPrompt = guideImagePrompt(guide)
    const buffer = await generateImage(imgPrompt)
    if (buffer) {
      console.log(`  Uploading image...`)
      heroImageId = await uploadImage(payload, buffer, `guide-${guide.slug}.png`, `${guide.title} hero image`)
    }
  }

  const updateData: any = {
    excerpt: response.excerpt,
    metaTitle: response.metaTitle,
    metaDescription: response.metaDescription,
    content,
    steps,
    faq,
  }
  if (heroImageId) updateData.heroImage = heroImageId

  if (args.dryRun) {
    console.log(`  [DRY RUN] Would update guide "${guide.title}"`)
    console.log(`    Excerpt: ${response.excerpt}`)
    console.log(`    Meta Title: ${response.metaTitle}`)
    console.log(`    Steps: ${steps.length}`)
    console.log(`    FAQ: ${faq.length}`)
    console.log(`    Image: ${heroImageId ? 'yes' : 'skipped'}`)
  } else {
    await payload.update({
      collection: 'guides',
      id: guide.id,
      data: updateData,
    })
    console.log(`  Updated guide: "${guide.title}"`)
  }
}

async function processLearnArticle(payload: any, article: any, args: CliArgs) {
  if (args.imagesOnly) {
    console.log(`  Generating hero image...`)
    const imgPrompt = learnImagePrompt(article)
    const buffer = await generateImage(imgPrompt)
    if (buffer) {
      console.log(`  Uploading image...`)
      const heroImageId = await uploadImage(payload, buffer, `learn-${article.slug}.png`, `${article.title} hero image`)
      if (args.dryRun) {
        console.log(`  [DRY RUN] Would set heroImage=${heroImageId} on learn "${article.title}"`)
      } else {
        await payload.update({ collection: 'learn', id: article.id, data: { heroImage: heroImageId } })
        console.log(`  Updated learn image: "${article.title}"`)
      }
    }
    return
  }

  const keywords = (article.targetKeywords || []).map((k: any) => k.keyword)
  if (keywords.length === 0) {
    keywords.push(article.slug.replace(/-/g, ' '))
    keywords.push(`${article.slug.replace(/-/g, ' ')} android`)
  }

  console.log(`  Analyzing competitors...`)
  const competitors = await analyzeCompetitors(keywords.slice(0, 3))

  console.log(`  Generating content via LLM...`)
  const messages = buildLearnPrompt(article, competitors)
  const rawResponse = await callLLM(messages)
  const parsed = parseJSON(rawResponse)
  const response = validateLearnResponse(parsed)

  console.log(`  Building Lexical content...`)
  const content = buildLexicalDocument(response.content)
  const faq = response.faq.map((f) => ({
    question: f.question,
    answer: richText(f.answer),
  }))

  let heroImageId: number | null = null
  if (!args.skipImages) {
    console.log(`  Generating hero image...`)
    const imgPrompt = learnImagePrompt(article)
    const buffer = await generateImage(imgPrompt)
    if (buffer) {
      console.log(`  Uploading image...`)
      heroImageId = await uploadImage(payload, buffer, `learn-${article.slug}.png`, `${article.title} hero image`)
    }
  }

  const updateData: any = {
    excerpt: response.excerpt,
    metaTitle: response.metaTitle,
    metaDescription: response.metaDescription,
    content,
    faq,
  }
  if (heroImageId) updateData.heroImage = heroImageId

  if (args.dryRun) {
    console.log(`  [DRY RUN] Would update learn article "${article.title}"`)
    console.log(`    Excerpt: ${response.excerpt}`)
    console.log(`    Meta Title: ${response.metaTitle}`)
    console.log(`    FAQ: ${faq.length}`)
    console.log(`    Image: ${heroImageId ? 'yes' : 'skipped'}`)
  } else {
    await payload.update({
      collection: 'learn',
      id: article.id,
      data: updateData,
    })
    console.log(`  Updated learn article: "${article.title}"`)
  }
}

async function processDevice(payload: any, device: any, args: CliArgs) {
  if (args.imagesOnly) {
    console.log(`  Generating device image...`)
    const imgPrompt = deviceImagePrompt(device)
    const buffer = await generateImage(imgPrompt)
    if (buffer) {
      console.log(`  Uploading image...`)
      const imageId = await uploadImage(payload, buffer, `device-${device.slug}.png`, `${device.name} rooting guide image`)
      if (args.dryRun) {
        console.log(`  [DRY RUN] Would set image=${imageId} on device "${device.name}"`)
      } else {
        await payload.update({ collection: 'devices', id: device.id, data: { image: imageId } })
        console.log(`  Updated device image: "${device.name}"`)
      }
    }
    return
  }

  const keywords = (device.targetKeywords || []).map((k: any) => k.keyword)
  if (keywords.length === 0) {
    keywords.push(`root ${device.name}`)
    keywords.push(`${device.name} root`)
  }

  // Fetch brand info
  let brandInfo: any = null
  if (device.brand) {
    try {
      const brandId = typeof device.brand === 'object' ? device.brand.id : device.brand
      brandInfo = await payload.findByID({ collection: 'brands', id: brandId })
    } catch {
      console.log(`    ⚠ Could not fetch brand info`)
    }
  }

  console.log(`  Analyzing competitors...`)
  const competitors = await analyzeCompetitors(keywords.slice(0, 3))

  console.log(`  Generating content via LLM...`)
  const messages = buildDevicePrompt(device, brandInfo, competitors)
  const rawResponse = await callLLM(messages)
  const parsed = parseJSON(rawResponse)
  const response = validateDeviceResponse(parsed)

  console.log(`  Building Lexical content...`)
  const introOverride =
    response.introOverride.length > 0 ? buildLexicalDocument(response.introOverride) : undefined
  const steps = response.steps.map((step) => ({
    title: step.title,
    content: buildLexicalDocument(step.content),
    warning: step.warning || null,
  }))
  const faq = response.faq.map((f) => ({
    question: f.question,
    answer: richText(f.answer),
  }))
  const prerequisites = response.prerequisites.map((text) => ({ text }))
  const warnings = response.warnings.map((text) => ({ text, severity: 'warning' as const }))
  const targetKeywords = response.targetKeywords.map((keyword) => ({ keyword }))

  let imageId: number | null = null
  if (!args.skipImages) {
    console.log(`  Generating device image...`)
    const imgPrompt = deviceImagePrompt(device)
    const buffer = await generateImage(imgPrompt)
    if (buffer) {
      console.log(`  Uploading image...`)
      imageId = await uploadImage(payload, buffer, `device-${device.slug}.png`, `${device.name} rooting guide image`)
    }
  }

  const updateData: any = {
    metaTitle: response.metaTitle,
    metaDescription: response.metaDescription,
    steps,
    faq,
    prerequisites,
    warnings,
    targetKeywords,
  }
  if (introOverride) updateData.introOverride = introOverride
  if (imageId) updateData.image = imageId

  if (args.dryRun) {
    console.log(`  [DRY RUN] Would update device "${device.name}"`)
    console.log(`    Meta Title: ${response.metaTitle}`)
    console.log(`    Steps: ${steps.length}`)
    console.log(`    FAQ: ${faq.length}`)
    console.log(`    Prerequisites: ${prerequisites.length}`)
    console.log(`    Warnings: ${warnings.length}`)
    console.log(`    Keywords: ${targetKeywords.map((k) => k.keyword).join(', ')}`)
    console.log(`    Image: ${imageId ? 'yes' : 'skipped'}`)
  } else {
    await payload.update({
      collection: 'devices',
      id: device.id,
      data: updateData,
    })
    console.log(`  Updated device: "${device.name}"`)
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ── Main Orchestrator ───────────────────────────────────────────────────

async function main() {
  const args = parseArgs()

  console.log('=== Content Generation Pipeline ===')
  console.log(`Types: ${args.type.join(', ')}`)
  if (args.slug) console.log(`Slug filter: ${args.slug}`)
  if (args.dryRun) console.log(`Mode: DRY RUN`)
  if (args.skipImages) console.log(`Images: SKIPPED`)
  if (args.imagesOnly) console.log(`Mode: IMAGES ONLY`)
  if (args.resumeFrom) console.log(`Resume from: ${args.resumeFrom}`)
  console.log('')

  if (!OPENROUTER_API_KEY) {
    console.error('ERROR: OPENROUTER_API_KEY is required')
    process.exit(1)
  }

  const payload = await getPayload({ config: await config })

  let totalProcessed = 0
  let totalFailed = 0
  let totalSkipped = 0
  let resumeActive = !!args.resumeFrom

  // Process Guides
  if (args.type.includes('guides')) {
    console.log('── Processing Guides ──────────────────────')
    const guidesResult = await payload.find({
      collection: 'guides',
      limit: 100,
      sort: 'slug',
      ...(args.slug ? { where: { slug: { equals: args.slug } } } : {}),
    })
    const guides = guidesResult.docs

    for (let i = 0; i < guides.length; i++) {
      const guide = guides[i]

      if (resumeActive) {
        if (guide.slug === args.resumeFrom) {
          resumeActive = false
        } else {
          console.log(`[${i + 1}/${guides.length}] Skipping guide: "${guide.title}" (before resume point)`)
          totalSkipped++
          continue
        }
      }

      console.log(`\n[${i + 1}/${guides.length}] Processing guide: "${guide.title}"`)
      try {
        await processGuide(payload, guide, args)
        totalProcessed++
      } catch (err) {
        console.error(`  ERROR: ${err instanceof Error ? err.message : String(err)}`)
        totalFailed++
      }
      await sleep(2000)
    }
  }

  // Process Learn articles
  if (args.type.includes('learn')) {
    console.log('\n── Processing Learn Articles ──────────────')
    const learnResult = await payload.find({
      collection: 'learn',
      limit: 100,
      sort: 'slug',
      ...(args.slug ? { where: { slug: { equals: args.slug } } } : {}),
    })
    const articles = learnResult.docs

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i]

      if (resumeActive) {
        if (article.slug === args.resumeFrom) {
          resumeActive = false
        } else {
          console.log(`[${i + 1}/${articles.length}] Skipping learn: "${article.title}" (before resume point)`)
          totalSkipped++
          continue
        }
      }

      console.log(`\n[${i + 1}/${articles.length}] Processing learn: "${article.title}"`)
      try {
        await processLearnArticle(payload, article, args)
        totalProcessed++
      } catch (err) {
        console.error(`  ERROR: ${err instanceof Error ? err.message : String(err)}`)
        totalFailed++
      }
      await sleep(2000)
    }
  }

  // Process Devices
  if (args.type.includes('devices')) {
    console.log('\n── Processing Devices ────────────────────')
    const devicesResult = await payload.find({
      collection: 'devices',
      limit: 200,
      sort: 'slug',
      ...(args.slug ? { where: { slug: { equals: args.slug } } } : {}),
    })
    const devices = devicesResult.docs

    for (let i = 0; i < devices.length; i++) {
      const device = devices[i]

      if (resumeActive) {
        if (device.slug === args.resumeFrom) {
          resumeActive = false
        } else {
          console.log(`[${i + 1}/${devices.length}] Skipping device: "${device.name}" (before resume point)`)
          totalSkipped++
          continue
        }
      }

      console.log(`\n[${i + 1}/${devices.length}] Processing device: "${device.name}"`)
      try {
        await processDevice(payload, device, args)
        totalProcessed++
      } catch (err) {
        console.error(`  ERROR: ${err instanceof Error ? err.message : String(err)}`)
        totalFailed++
      }
      await sleep(2000)
    }
  }

  console.log('\n=== Summary ===')
  console.log(`Processed: ${totalProcessed}`)
  console.log(`Failed: ${totalFailed}`)
  console.log(`Skipped: ${totalSkipped}`)
  console.log(`Total: ${totalProcessed + totalFailed + totalSkipped}`)

  process.exit(totalFailed > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
