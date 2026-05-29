import 'dotenv/config'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN!
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD!
const SERPAPI_KEY = process.env.SERPAPI_KEY!
const AUTH = Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64')

interface KeywordResult {
  keyword: string
  volume: number | null
  competition: string | null
  competitionIndex: number | null
  cpc: number | null
  category: string
  source: string
}

// ── SerpAPI: Get related searches & People Also Ask ───────────────────

async function serpApiRelatedSearches(query: string): Promise<string[]> {
  const params = new URLSearchParams({
    q: query,
    api_key: SERPAPI_KEY,
    engine: 'google',
    gl: 'us',
    hl: 'en',
  })

  try {
    const res = await fetch(`https://serpapi.com/search.json?${params}`)
    if (!res.ok) {
      console.error(`  SerpAPI search error ${res.status} for "${query}"`)
      return []
    }
    const data = await res.json()
    const results: string[] = []

    if (data.related_searches) {
      for (const r of data.related_searches) {
        if (r.query) results.push(r.query.toLowerCase())
      }
    }

    if (data.related_questions) {
      for (const r of data.related_questions) {
        if (r.question) results.push(r.question.toLowerCase())
      }
    }

    return results
  } catch (err) {
    console.error(`  SerpAPI error for "${query}":`, err)
    return []
  }
}

async function serpApiAutocomplete(query: string): Promise<string[]> {
  const params = new URLSearchParams({
    q: query,
    api_key: SERPAPI_KEY,
    engine: 'google_autocomplete',
    gl: 'us',
    hl: 'en',
  })

  try {
    const res = await fetch(`https://serpapi.com/search.json?${params}`)
    if (!res.ok) return []
    const data = await res.json()
    const suggestions: string[] = []

    if (data.suggestions) {
      for (const s of data.suggestions) {
        if (s.value) suggestions.push(s.value.toLowerCase())
      }
    }

    return suggestions
  } catch {
    return []
  }
}

// ── DataForSEO: Get keyword suggestions (keywords for keywords) ───────

async function dataforseoKeywordExpansion(seeds: string[]): Promise<string[]> {
  const allKeywords: string[] = []

  // Batch in groups of 10
  const batches: string[][] = []
  for (let i = 0; i < seeds.length; i += 10) {
    batches.push(seeds.slice(i, i + 10))
  }

  for (let bi = 0; bi < batches.length; bi++) {
    const batch = batches[bi]
    console.log(`  DataForSEO expansion batch ${bi + 1}/${batches.length}...`)

    try {
      const body = batch.map(seed => ({
        keyword: seed,
        language_code: 'en',
        location_code: 2840,
        include_seed_keyword: true,
        limit: 50,
      }))

      const res = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/live', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${AUTH}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      for (const task of data.tasks || []) {
        if (task.status_code === 40200) {
          console.log('  ⚠ DataForSEO credits exhausted for keyword expansion')
          return allKeywords
        }
        if (task.result) {
          for (const resultSet of task.result) {
            if (resultSet.items) {
              for (const item of resultSet.items) {
                if (item.keyword && item.search_volume >= 10) {
                  allKeywords.push(item.keyword.toLowerCase())
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(`  DataForSEO expansion error:`, err)
    }

    if (bi < batches.length - 1) await new Promise(r => setTimeout(r, 300))
  }

  return allKeywords
}

// ── DataForSEO: Get search volume metrics ─────────────────────────────

async function getSearchVolumes(keywords: string[]): Promise<Map<string, { volume: number; competition: string; competitionIndex: number; cpc: number | null }>> {
  const results = new Map<string, { volume: number; competition: string; competitionIndex: number; cpc: number | null }>()

  // Sanitize: only allow letters, numbers, spaces, hyphens, and periods
  const cleanKeywords = keywords
    .map(k => k.replace(/[^a-zA-Z0-9\s\-\.]/g, '').replace(/\s+/g, ' ').trim())
    .filter(k => k.length > 1 && k.split(' ').length <= 8)
  const uniqueClean = [...new Set(cleanKeywords)]
  console.log(`  Cleaned: ${uniqueClean.length} keywords (filtered ${keywords.length - uniqueClean.length} invalid)`)

  // Use smaller batches (100) so one bad keyword doesn't kill everything
  const batches: string[][] = []
  for (let i = 0; i < uniqueClean.length; i += 100) {
    batches.push(uniqueClean.slice(i, i + 100))
  }

  for (let bi = 0; bi < batches.length; bi++) {
    const batch = batches[bi]
    console.log(`  DataForSEO batch ${bi + 1}/${batches.length} (${batch.length} keywords)...`)

    try {
      const res = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${AUTH}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{
          keywords: batch,
          language_code: 'en',
          location_code: 2840,
          search_partners: false,
        }]),
      })

      const data = await res.json()

      console.log(`  HTTP status: ${res.status}, tasks: ${data.tasks?.length ?? 0}`)

      for (const task of data.tasks || []) {
        console.log(`  Task status: ${task.status_code} (${task.status_message}), results: ${task.result_count ?? 0}`)
        if (task.status_code === 40200) {
          console.log('  ⚠ DataForSEO credits exhausted — skipping volume data')
          return results
        }
        if (task.result) {
          let matched = 0
          for (const item of task.result) {
            if (item.search_volume && item.search_volume > 0) {
              matched++
              results.set(item.keyword.toLowerCase(), {
                volume: item.search_volume,
                competition: item.competition || 'N/A',
                competitionIndex: item.competition_index ?? 0,
                cpc: item.cpc ?? null,
              })
            }
          }
          console.log(`  Matched ${matched}/${task.result.length} keywords with volume > 0`)
        }
      }
    } catch (err) {
      console.error(`  DataForSEO error:`, err)
      return results
    }

    if (bi < batches.length - 1) await new Promise(r => setTimeout(r, 300))
  }

  return results
}

// ── Keyword categorization ────────────────────────────────────────────

function categorizeKeyword(kw: string): string {
  const lower = kw.toLowerCase()

  const brands: [string, string][] = [
    ['samsung', 'Samsung'], ['galaxy', 'Samsung'],
    ['pixel', 'Google Pixel'], ['nexus', 'Google Nexus'],
    ['oneplus', 'OnePlus'], ['one plus', 'OnePlus'],
    ['xiaomi', 'Xiaomi'], ['redmi', 'Xiaomi'], ['poco', 'Xiaomi'], ['miui', 'Xiaomi'],
    ['huawei', 'Huawei'], ['honor', 'Honor'],
    ['motorola', 'Motorola'], ['moto g', 'Motorola'], ['moto e', 'Motorola'],
    ['lg phone', 'LG'], ['lg v', 'LG'], ['lg g', 'LG'],
    ['sony', 'Sony'], ['xperia', 'Sony'],
    ['htc', 'HTC'],
    ['oppo', 'OPPO'],
    ['vivo', 'Vivo'],
    ['realme', 'Realme'],
    ['nokia', 'Nokia'],
    ['asus', 'ASUS'], ['rog phone', 'ASUS'], ['zenfone', 'ASUS'],
    ['nothing phone', 'Nothing'],
    ['tcl', 'TCL'],
  ]

  for (const [key, brand] of brands) {
    if (lower.includes(key)) return `How to Root - ${brand}`
  }

  if (lower.includes('magisk')) return 'Magisk'
  if (lower.includes('supersu') || lower.includes('super su')) return 'SuperSU'
  if (lower.includes('twrp') || lower.includes('custom recovery')) return 'Custom Recovery (TWRP)'
  if (lower.includes('bootloader') || lower.includes('oem unlock')) return 'Bootloader Unlock'
  if (lower.includes('custom rom') || lower.includes('lineage') || lower.includes('cyanogen') || lower.includes('graphene') || lower.includes('calyx') || lower.includes('pixel experience')) return 'Custom ROMs'
  if (lower.includes('xposed') || lower.includes('lsposed')) return 'Xposed/LSPosed'
  if (lower.includes('kernelsu') || lower.includes('kernel su') || lower.includes('ksu')) return 'KernelSU'
  if (lower.includes('adb') || lower.includes('fastboot')) return 'ADB & Fastboot'
  if (lower.includes('safe') || lower.includes('risk') || lower.includes('danger') || lower.includes('brick') || lower.includes('warranty')) return 'Safety & Risks'
  if (lower.includes('benefit') || lower.includes('advantage') || lower.includes('why root') || lower.includes('reason to root')) return 'Benefits of Rooting'
  if (lower.includes('unroot') || lower.includes('un-root') || lower.includes('remove root')) return 'Unrooting'
  if (lower.includes('safetynet') || lower.includes('play integrity') || lower.includes('root checker') || lower.includes('check root') || lower.includes('detect root') || lower.includes('hide root') || lower.includes('root detection')) return 'Root Detection & Bypass'
  if (lower.includes('without pc') || lower.includes('without computer') || lower.includes('no pc') || lower.includes('no computer')) return 'Root Without PC'
  if (lower.includes('what is root') || lower.includes('what does root') || lower.includes('meaning of root') || lower.includes('rooting mean')) return 'What is Rooting'
  if (/android 1[0-5]/.test(lower)) return 'Root by Android Version'
  if (lower.includes('one click') || lower.includes('kingoroot') || lower.includes('kingroot') || lower.includes('iroot') || lower.includes('framaroot')) return 'One-Click Root Tools'
  if (lower.includes('root app') || lower.includes('root tool') || lower.includes('best app') || lower.includes('root software')) return 'Root Apps & Tools'

  return 'General Rooting'
}

// ── Markdown generation ───────────────────────────────────────────────

function generateMarkdown(results: KeywordResult[], hasVolumeData: boolean): string {
  const lines: string[] = []

  lines.push('# Android Rooting - Keyword Research')
  lines.push('')
  lines.push(`> **Generated:** ${new Date().toISOString().split('T')[0]}`)
  lines.push(`> **Sources:** SerpAPI (keyword expansion) + DataForSEO (search volume)`)
  lines.push(`> **Market:** United States (en)`)
  lines.push(`> **Domain:** androidrooting.com`)
  lines.push(`> **Total keywords:** ${results.length}`)

  if (hasVolumeData) {
    const withVolume = results.filter(r => r.volume !== null)
    lines.push(`> **Keywords with volume data:** ${withVolume.length}`)
    lines.push(`> **Total monthly search volume:** ${withVolume.reduce((sum, r) => sum + (r.volume || 0), 0).toLocaleString()}`)
  } else {
    lines.push(`> **Volume data:** Pending (re-run script after topping up DataForSEO credits)`)
  }

  lines.push('')
  lines.push('---')
  lines.push('')

  // Summary by category
  lines.push('## Category Summary')
  lines.push('')

  const categories = new Map<string, { count: number; totalVolume: number; keywords: KeywordResult[] }>()
  for (const r of results) {
    const cat = categories.get(r.category) || { count: 0, totalVolume: 0, keywords: [] }
    cat.count++
    cat.totalVolume += r.volume || 0
    cat.keywords.push(r)
    categories.set(r.category, cat)
  }

  const sortedCategories = Array.from(categories.entries()).sort((a, b) => {
    if (hasVolumeData) return b[1].totalVolume - a[1].totalVolume
    return b[1].count - a[1].count
  })

  if (hasVolumeData) {
    lines.push('| Category | Keywords | Total Monthly Volume |')
    lines.push('|----------|----------|---------------------|')
    for (const [name, data] of sortedCategories) {
      lines.push(`| ${name} | ${data.count} | ${data.totalVolume.toLocaleString()} |`)
    }
  } else {
    lines.push('| Category | Keywords |')
    lines.push('|----------|----------|')
    for (const [name, data] of sortedCategories) {
      lines.push(`| ${name} | ${data.count} |`)
    }
  }

  lines.push('')
  lines.push('---')
  lines.push('')

  // Top keywords (if volume data)
  if (hasVolumeData) {
    const withVolume = results.filter(r => r.volume !== null).sort((a, b) => (b.volume || 0) - (a.volume || 0))
    lines.push('## Top 50 Keywords by Volume')
    lines.push('')
    lines.push('| # | Keyword | Volume/mo | Competition | CPC | Category |')
    lines.push('|---|---------|-----------|-------------|-----|----------|')
    for (let i = 0; i < Math.min(50, withVolume.length); i++) {
      const r = withVolume[i]
      const cpc = r.cpc !== null ? `$${r.cpc.toFixed(2)}` : '-'
      const comp = r.competition || '-'
      lines.push(`| ${i + 1} | ${r.keyword} | ${(r.volume || 0).toLocaleString()} | ${comp} | ${cpc} | ${r.category} |`)
    }
    lines.push('')
    lines.push('---')
    lines.push('')
  }

  // All keywords by category
  lines.push('## All Keywords by Category')
  lines.push('')

  for (const [catName, catData] of sortedCategories) {
    const catKeywords = catData.keywords.sort((a, b) => (b.volume || 0) - (a.volume || 0))
    lines.push(`### ${catName}`)
    lines.push(`*${catKeywords.length} keywords${hasVolumeData ? ` | ${catData.totalVolume.toLocaleString()} monthly volume` : ''}*`)
    lines.push('')

    if (hasVolumeData) {
      lines.push('| Keyword | Volume/mo | Competition | CPC |')
      lines.push('|---------|-----------|-------------|-----|')
      for (const r of catKeywords) {
        const vol = r.volume !== null ? r.volume.toLocaleString() : '-'
        const cpc = r.cpc !== null ? `$${r.cpc.toFixed(2)}` : '-'
        const comp = r.competition || '-'
        lines.push(`| ${r.keyword} | ${vol} | ${comp} | ${cpc} |`)
      }
    } else {
      for (const r of catKeywords) {
        lines.push(`- ${r.keyword}`)
      }
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('')

  // Programmatic SEO opportunities
  lines.push('## Programmatic SEO Opportunities')
  lines.push('')
  lines.push('### URL Pattern: `/root/[brand]/[model]`')
  lines.push('')
  lines.push('Target template pages for each phone model. Example URLs:')
  lines.push('- `androidrooting.com/root/samsung/galaxy-s24-ultra`')
  lines.push('- `androidrooting.com/root/google/pixel-9-pro`')
  lines.push('- `androidrooting.com/root/oneplus/12`')
  lines.push('')

  const brandCategories = sortedCategories.filter(([name]) => name.startsWith('How to Root - '))
  for (const [catName, catData] of brandCategories) {
    const brand = catName.replace('How to Root - ', '')
    lines.push(`**${brand}** (${catData.count} keywords${hasVolumeData ? `, ${catData.totalVolume.toLocaleString()} total volume` : ''})`)
    for (const k of catData.keywords) {
      const vol = k.volume !== null ? ` — ${k.volume.toLocaleString()}/mo` : ''
      lines.push(`- \`${k.keyword}\`${vol}`)
    }
    lines.push('')
  }

  lines.push('### URL Pattern: `/guides/[topic]`')
  lines.push('')
  lines.push('Hub pages for tools, methods, and informational content:')
  lines.push('- `androidrooting.com/guides/magisk`')
  lines.push('- `androidrooting.com/guides/kernelsu`')
  lines.push('- `androidrooting.com/guides/unlock-bootloader`')
  lines.push('- `androidrooting.com/guides/root-without-pc`')
  lines.push('')

  const toolCategories = ['Magisk', 'KernelSU', 'SuperSU', 'Custom Recovery (TWRP)', 'Bootloader Unlock',
    'Xposed/LSPosed', 'ADB & Fastboot', 'One-Click Root Tools', 'Root Without PC', 'Custom ROMs',
    'Root Detection & Bypass']

  for (const catName of toolCategories) {
    const entry = sortedCategories.find(([name]) => name === catName)
    if (!entry) continue
    const [, catData] = entry
    lines.push(`**${catName}** (${catData.count} keywords${hasVolumeData ? `, ${catData.totalVolume.toLocaleString()} total volume` : ''})`)
    for (const k of catData.keywords) {
      const vol = k.volume !== null ? ` — ${k.volume.toLocaleString()}/mo` : ''
      lines.push(`- \`${k.keyword}\`${vol}`)
    }
    lines.push('')
  }

  lines.push('### URL Pattern: `/learn/[topic]`')
  lines.push('')
  lines.push('Educational / glossary content:')
  lines.push('- `androidrooting.com/learn/what-is-rooting`')
  lines.push('- `androidrooting.com/learn/is-rooting-safe`')
  lines.push('- `androidrooting.com/learn/rooting-vs-jailbreaking`')
  lines.push('')

  const infoCategories = ['What is Rooting', 'Benefits of Rooting', 'Safety & Risks', 'Unrooting', 'Root by Android Version']
  for (const catName of infoCategories) {
    const entry = sortedCategories.find(([name]) => name === catName)
    if (!entry) continue
    const [, catData] = entry
    lines.push(`**${catName}** (${catData.count} keywords${hasVolumeData ? `, ${catData.totalVolume.toLocaleString()} total volume` : ''})`)
    for (const k of catData.keywords) {
      const vol = k.volume !== null ? ` — ${k.volume.toLocaleString()}/mo` : ''
      lines.push(`- \`${k.keyword}\`${vol}`)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('')
  lines.push('## Re-running This Research')
  lines.push('')
  lines.push('```bash')
  lines.push('# After topping up DataForSEO credits, re-run to get volume data:')
  lines.push('npx tsx scripts/keyword-research.ts')
  lines.push('```')

  return lines.join('\n')
}

// ── Main ──────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Android Rooting Keyword Research ===\n')

  // ── Phase 1: Build comprehensive keyword list ───────────────────────

  const manualSeeds = [
    'root android', 'root android phone', 'rooting android', 'how to root android',
    'android root', 'root phone', 'root my phone', 'android rooting guide',
    'root android 2025', 'root android 2026', 'best way to root android',
    'root samsung', 'root samsung galaxy', 'how to root samsung',
    'root galaxy s24', 'root galaxy s24 ultra', 'root galaxy s23', 'root galaxy s23 ultra',
    'root galaxy s22', 'root galaxy s21', 'root galaxy s20',
    'root galaxy a54', 'root galaxy a53', 'root galaxy a34', 'root galaxy a24',
    'root galaxy a15', 'root galaxy a14', 'root galaxy a13',
    'root galaxy note 20', 'root galaxy z flip', 'root galaxy z fold',
    'root samsung without pc', 'root samsung with magisk',
    'root pixel', 'root google pixel', 'how to root pixel',
    'root pixel 9', 'root pixel 9 pro', 'root pixel 8', 'root pixel 8 pro',
    'root pixel 7', 'root pixel 7a', 'root pixel 6', 'root pixel 6a',
    'root nexus', 'root nexus 5', 'root nexus 6', 'root nexus 7',
    'root oneplus', 'how to root oneplus',
    'root oneplus 12', 'root oneplus 11', 'root oneplus 10 pro',
    'root oneplus nord', 'root oneplus 9', 'root oneplus 8',
    'root xiaomi', 'how to root xiaomi', 'root redmi',
    'root redmi note 13', 'root redmi note 12', 'root redmi note 11',
    'root poco f5', 'root poco x5', 'root poco m5',
    'root xiaomi 14', 'root xiaomi 13', 'root miui',
    'root motorola', 'root moto g', 'root moto g power',
    'root huawei', 'root huawei p40', 'root honor',
    'root lg phone', 'root lg v60', 'root lg g8',
    'root sony xperia', 'root xperia 1',
    'root nokia', 'root nokia phone',
    'root oppo', 'root oppo find',
    'root realme', 'root realme gt',
    'root vivo', 'root asus zenfone', 'root rog phone',
    'root nothing phone', 'root tcl phone',
    'magisk', 'magisk root', 'magisk manager', 'magisk download',
    'magisk module', 'magisk hide', 'magisk delta', 'install magisk',
    'how to use magisk', 'magisk zygisk', 'magisk canary',
    'kernelsu', 'kernelsu root', 'kernelsu vs magisk', 'install kernelsu',
    'supersu', 'supersu download', 'supersu pro',
    'twrp', 'twrp recovery', 'install twrp', 'twrp download',
    'custom recovery android', 'twrp recovery download',
    'unlock bootloader', 'unlock bootloader android', 'oem unlock',
    'how to unlock bootloader', 'unlock bootloader samsung',
    'adb root', 'adb commands root', 'fastboot root',
    'adb sideload', 'adb push', 'install adb',
    'root without pc', 'root android without pc', 'root without computer',
    'root with pc', 'root android with pc',
    'one click root', 'one click root android',
    'kingoroot', 'kingoroot apk', 'kingroot', 'kingroot apk',
    'framaroot', 'iroot',
    'custom rom', 'custom rom android', 'best custom rom',
    'lineageos', 'lineageos download', 'install lineageos',
    'grapheneos', 'calyxos', 'pixel experience rom',
    'install custom rom', 'flash custom rom',
    'xposed framework', 'xposed module', 'install xposed',
    'lsposed', 'lsposed module', 'install lsposed',
    'safetynet', 'pass safetynet', 'safetynet fix',
    'play integrity', 'pass play integrity', 'play integrity fix',
    'root checker', 'check root', 'root access check',
    'hide root', 'hide root from apps', 'root detection bypass',
    'what is rooting', 'what is rooting android', 'what does rooting mean',
    'is rooting safe', 'is rooting legal', 'rooting benefits',
    'benefits of rooting android', 'why root android',
    'advantages of rooting', 'disadvantages of rooting',
    'root android risks', 'rooting risks',
    'does rooting void warranty', 'rooting warranty',
    'rooting vs jailbreaking', 'root vs jailbreak',
    'unroot android', 'how to unroot', 'remove root',
    'unroot samsung', 'unroot with magisk',
    'root android 15', 'root android 14', 'root android 13',
    'root android 12', 'root android 11', 'root android 10',
    'best root apps', 'root apps android', 'apps that need root',
    'root file manager', 'root explorer', 'titanium backup root',
    'root browser', 'adblock root', 'root firewall',
  ]

  const allKeywords = new Set(manualSeeds.map(k => k.toLowerCase()))
  console.log(`Manual seed keywords: ${allKeywords.size}`)

  // ── Phase 2: Expand via SerpAPI ─────────────────────────────────────

  const expansionSeeds = [
    'how to root android phone',
    'root samsung galaxy',
    'magisk root android',
    'root android without pc',
    'best root app android',
    'root pixel phone',
    'kernelsu android',
    'unlock bootloader android',
    'custom rom android',
    'twrp recovery',
    'root android 2026',
    'how to root samsung galaxy s24',
    'magisk vs kernelsu',
    'is it safe to root android',
    'root android benefits',
    'hide root from banking apps',
    'pass play integrity rooted',
    'best magisk modules',
    'root oneplus 12',
    'root xiaomi redmi note',
  ]

  console.log(`\nExpanding via SerpAPI (${expansionSeeds.length} queries)...`)

  for (const seed of expansionSeeds) {
    const [related, autocomplete] = await Promise.all([
      serpApiRelatedSearches(seed),
      serpApiAutocomplete(seed),
    ])

    let added = 0
    for (const kw of [...related, ...autocomplete]) {
      const lower = kw.toLowerCase()
      if (lower.includes('root') || lower.includes('android') || lower.includes('magisk') ||
          lower.includes('bootloader') || lower.includes('twrp') || lower.includes('custom rom') ||
          lower.includes('kernelsu') || lower.includes('xposed') || lower.includes('supersu') ||
          lower.includes('safetynet') || lower.includes('play integrity') || lower.includes('lineage') ||
          lower.includes('graphene') || lower.includes('calyx') || lower.includes('samsung') ||
          lower.includes('pixel') || lower.includes('oneplus') || lower.includes('xiaomi')) {
        if (!allKeywords.has(lower)) added++
        allKeywords.add(lower)
      }
    }

    console.log(`  "${seed}" → +${added} new keywords`)
    await new Promise(r => setTimeout(r, 200))
  }

  console.log(`\nKeywords after SerpAPI expansion: ${allKeywords.size}`)

  // ── Phase 3: Expand via DataForSEO keywords-for-keywords ────────────

  const dfsExpansionSeeds = [
    'root android', 'root samsung', 'magisk', 'kernelsu',
    'root pixel', 'root oneplus', 'root xiaomi', 'twrp recovery',
    'unlock bootloader', 'custom rom android', 'root without pc',
    'root android 2026', 'lsposed', 'play integrity root',
    'best root apps', 'root motorola', 'root huawei',
  ]

  console.log(`\nExpanding via DataForSEO keywords-for-keywords (${dfsExpansionSeeds.length} seeds)...`)
  const dfsExpanded = await dataforseoKeywordExpansion(dfsExpansionSeeds)
  let dfsAdded = 0
  for (const kw of dfsExpanded) {
    if (!allKeywords.has(kw)) dfsAdded++
    allKeywords.add(kw)
  }
  console.log(`  Added ${dfsAdded} new keywords from DataForSEO expansion`)
  console.log(`\nTotal unique keywords: ${allKeywords.size}`)

  // ── Phase 4: Get DataForSEO volume data ─────────────────────────────

  const keywordArray = Array.from(allKeywords)

  console.log('\nFetching DataForSEO volume data...')
  const volumeData = await getSearchVolumes(keywordArray)
  const hasVolumeData = volumeData.size > 0
  console.log(`Volume data retrieved for ${volumeData.size} keywords`)

  // ── Phase 4: Build final results ────────────────────────────────────

  const results: KeywordResult[] = keywordArray.map(kw => {
    const vol = volumeData.get(kw)
    return {
      keyword: kw,
      volume: vol?.volume ?? null,
      competition: vol?.competition ?? null,
      competitionIndex: vol?.competitionIndex ?? null,
      cpc: vol?.cpc ?? null,
      category: categorizeKeyword(kw),
      source: vol ? 'dataforseo' : 'serpapi',
    }
  })

  // Sort: keywords with volume first (desc), then alphabetical
  results.sort((a, b) => {
    if (a.volume !== null && b.volume !== null) return b.volume - a.volume
    if (a.volume !== null) return -1
    if (b.volume !== null) return 1
    return a.keyword.localeCompare(b.keyword)
  })

  // ── Phase 5: Write markdown ─────────────────────────────────────────

  const markdown = generateMarkdown(results, hasVolumeData)
  const outPath = resolve(import.meta.dirname, '..', 'keyword-research.md')
  writeFileSync(outPath, markdown, 'utf-8')

  console.log(`\nResults saved to: keyword-research.md`)
  console.log(`Total keywords: ${results.length}`)
  console.log(`With volume data: ${results.filter(r => r.volume !== null).length}`)
  console.log(`Without volume data: ${results.filter(r => r.volume === null).length}`)

  if (!hasVolumeData) {
    console.log('\n⚠ DataForSEO credits exhausted — keyword list saved without volume data.')
    console.log('  Top up credits and re-run: npx tsx scripts/keyword-research.ts')
  }
}

main().catch(console.error)
