import type { OracleTag, OracleTagDataset } from './types'

/**
 * Stores the indexed tag collection in memory and precomputes graph
 * closures once at construction time, so parent/child/ancestor/descendant
 * lookups are O(1) afterward instead of re-traversing on every call.
 */
export class OracleTagRepository {
  readonly updatedAt: string

  private readonly byId = new Map<string, OracleTag>()
  private readonly bySlug = new Map<string, OracleTag>()
  private readonly descendantsById = new Map<string, OracleTag[]>()
  private readonly ancestorsById = new Map<string, OracleTag[]>()
  private readonly tagsByOracleId = new Map<string, OracleTag[]>()
  private readonly roots: OracleTag[]

  constructor(dataset: OracleTagDataset) {
    this.updatedAt = dataset.updatedAt

    for (const tag of dataset.tags) {
      this.byId.set(tag.id, tag)
      this.bySlug.set(tag.slug, tag)
    }
    for (const tag of dataset.tags) {
      this.descendantsById.set(tag.id, this.closure(tag.id, (t) => t.childIds))
      this.ancestorsById.set(tag.id, this.closure(tag.id, (t) => t.parentIds))
      for (const oracleId of tag.taggingOracleIds) {
        const list = this.tagsByOracleId.get(oracleId)
        if (list) list.push(tag)
        else this.tagsByOracleId.set(oracleId, [tag])
      }
    }
    this.roots = dataset.tags
      .filter((tag) => tag.parentIds.length === 0)
      .sort((a, b) => a.label.localeCompare(b.label))
  }

  private closure(rootId: string, edges: (tag: OracleTag) => string[]): OracleTag[] {
    const root = this.byId.get(rootId)
    if (!root) return []

    const seen = new Map<string, OracleTag>()
    const stack = [...edges(root)]
    while (stack.length) {
      const id = stack.pop()
      if (!id || seen.has(id)) continue
      const tag = this.byId.get(id)
      if (!tag) continue
      seen.set(id, tag)
      stack.push(...edges(tag))
    }
    return [...seen.values()]
  }

  all(): OracleTag[] {
    return [...this.byId.values()]
  }

  getById(id: string): OracleTag | undefined {
    return this.byId.get(id)
  }

  getBySlug(slug: string): OracleTag | undefined {
    return this.bySlug.get(slug)
  }

  getChildren(id: string): OracleTag[] {
    const tag = this.byId.get(id)
    if (!tag) return []
    return tag.childIds
      .map((childId) => this.byId.get(childId))
      .filter((t): t is OracleTag => t !== undefined)
  }

  getParents(id: string): OracleTag[] {
    const tag = this.byId.get(id)
    if (!tag) return []
    return tag.parentIds
      .map((parentId) => this.byId.get(parentId))
      .filter((t): t is OracleTag => t !== undefined)
  }

  getDescendants(id: string): OracleTag[] {
    return this.descendantsById.get(id) ?? []
  }

  getAncestors(id: string): OracleTag[] {
    return this.ancestorsById.get(id) ?? []
  }

  /** Tags with no parent — the entry points into the hierarchy, alphabetical. */
  getRoots(): OracleTag[] {
    return this.roots
  }

  /** Every tag directly applied to a card, by its oracle_id — the reverse of a tagging. */
  getTagsForOracleId(oracleId: string): OracleTag[] {
    return this.tagsByOracleId.get(oracleId) ?? []
  }
}
