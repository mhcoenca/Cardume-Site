import type { ArtTagRepository } from './ArtTagRepository'
import type { ArtTag } from './types'

/** Lower tier ranks higher. Matches the priority: label, then slug, then alias, then contains. */
type MatchTier = 0 | 1 | 2 | 3 | 4

/**
 * Finds data; the repository only stores it. Mirrors OracleTagSearchIndex.
 */
export class ArtTagSearchIndex {
  private readonly repository: ArtTagRepository

  constructor(repository: ArtTagRepository) {
    this.repository = repository
  }

  search(query: string, limit = 20): ArtTag[] {
    const q = query.trim().toLowerCase()
    if (!q) return []

    const ranked: { tag: ArtTag; tier: MatchTier }[] = []
    for (const tag of this.repository.all()) {
      const tier = this.matchTier(tag, q)
      if (tier !== null) ranked.push({ tag, tier })
    }

    ranked.sort((a, b) => a.tier - b.tier || a.tag.label.localeCompare(b.tag.label))
    return ranked.slice(0, limit).map((r) => r.tag)
  }

  private matchTier(tag: ArtTag, q: string): MatchTier | null {
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
