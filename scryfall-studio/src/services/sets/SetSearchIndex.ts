import type { SetRepository } from './SetRepository'
import type { ScryfallSet, SetSortOrder } from './types'

/** Lower tier ranks higher: name match beats code match beats a mid-string contains. */
type MatchTier = 0 | 1 | 2

function bySort(order: SetSortOrder): (a: ScryfallSet, b: ScryfallSet) => number {
  switch (order) {
    case 'newest':
      return (a, b) => (b.releasedAt ?? '').localeCompare(a.releasedAt ?? '')
    case 'oldest':
      return (a, b) => (a.releasedAt ?? '').localeCompare(b.releasedAt ?? '')
    case 'alphabetical':
    default:
      return (a, b) => a.name.localeCompare(b.name)
  }
}

/** Finds and orders sets; the repository only stores them. */
export class SetSearchIndex {
  private readonly repository: SetRepository

  constructor(repository: SetRepository) {
    this.repository = repository
  }

  /** The full set list, ordered by `order` — used to browse when there's no query yet. */
  browse(order: SetSortOrder, limit = 40): ScryfallSet[] {
    return [...this.repository.list()].sort(bySort(order)).slice(0, limit)
  }

  search(query: string, order: SetSortOrder, limit = 40): ScryfallSet[] {
    const q = query.trim().toLowerCase()
    if (!q) return []

    const ranked: { set: ScryfallSet; tier: MatchTier }[] = []
    for (const set of this.repository.list()) {
      const tier = this.matchTier(set, q)
      if (tier !== null) ranked.push({ set, tier })
    }

    const sortFn = bySort(order)
    ranked.sort((a, b) => a.tier - b.tier || sortFn(a.set, b.set))
    return ranked.slice(0, limit).map((r) => r.set)
  }

  private matchTier(set: ScryfallSet, q: string): MatchTier | null {
    const name = set.name.toLowerCase()
    const code = set.code.toLowerCase()

    if (name.startsWith(q) || code === q) return 0
    if (code.startsWith(q)) return 1
    if (name.includes(q)) return 2
    return null
  }
}
