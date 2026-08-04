import type { OracleTagRepository } from './OracleTagRepository'
import type { OracleTag } from './types'

/** Lower tier ranks higher. Matches the priority: label, then slug, then alias, then contains. */
type MatchTier = 0 | 1 | 2 | 3 | 4

/**
 * Finds data; the repository only stores it. Ranking lives here so the
 * repository stays a plain index and this can grow (highlighting, recent
 * searches, fuzzier matching) without touching storage.
 */
export class OracleTagSearchIndex {
  private readonly repository: OracleTagRepository

  constructor(repository: OracleTagRepository) {
    this.repository = repository
  }

  search(query: string, limit = 20): OracleTag[] {
    const q = query.trim().toLowerCase()
    if (!q) return []

    const ranked: { tag: OracleTag; tier: MatchTier }[] = []
    for (const tag of this.repository.all()) {
      const tier = this.matchTier(tag, q)
      if (tier !== null) ranked.push({ tag, tier })
    }

    ranked.sort((a, b) => a.tier - b.tier || a.tag.label.localeCompare(b.tag.label))
    return ranked.slice(0, limit).map((r) => r.tag)
  }

  private matchTier(tag: OracleTag, q: string): MatchTier | null {
    const label = tag.label.toLowerCase()
    const slug = tag.slug.toLowerCase()

    if (label.startsWith(q)) return 0
    if (slug.startsWith(q)) return 1
    if (tag.aliases.some((alias) => alias.toLowerCase().startsWith(q))) return 2
    if (label.includes(q)) return 3
    if (tag.description?.toLowerCase().includes(q)) return 4
    return null
  }
}
