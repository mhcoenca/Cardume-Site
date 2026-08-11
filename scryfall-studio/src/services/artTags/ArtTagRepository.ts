import type { ArtTag, ArtTagDataset } from './types'

/**
 * Stores the indexed tag collection in memory and precomputes graph
 * closures once at construction time, so parent/child/ancestor/descendant
 * lookups are O(1) afterward instead of re-traversing on every call.
 * Mirrors OracleTagRepository.
 */
export class ArtTagRepository {
  readonly updatedAt: string

  private readonly byId = new Map<string, ArtTag>()
  private readonly bySlug = new Map<string, ArtTag>()
  private readonly descendantsById = new Map<string, ArtTag[]>()
  private readonly ancestorsById = new Map<string, ArtTag[]>()
  private readonly roots: ArtTag[]

  constructor(dataset: ArtTagDataset) {
    this.updatedAt = dataset.updatedAt

    for (const tag of dataset.tags) {
      this.byId.set(tag.id, tag)
      this.bySlug.set(tag.slug, tag)
    }
    for (const tag of dataset.tags) {
      this.descendantsById.set(tag.id, this.closure(tag.id, (t) => t.childIds))
      this.ancestorsById.set(tag.id, this.closure(tag.id, (t) => t.parentIds))
    }
    this.roots = dataset.tags
      .filter((tag) => tag.parentIds.length === 0)
      .sort((a, b) => a.label.localeCompare(b.label))
  }

  private closure(rootId: string, edges: (tag: ArtTag) => string[]): ArtTag[] {
    const root = this.byId.get(rootId)
    if (!root) return []

    const seen = new Map<string, ArtTag>()
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

  all(): ArtTag[] {
    return [...this.byId.values()]
  }

  getById(id: string): ArtTag | undefined {
    return this.byId.get(id)
  }

  getBySlug(slug: string): ArtTag | undefined {
    return this.bySlug.get(slug)
  }

  getChildren(id: string): ArtTag[] {
    const tag = this.byId.get(id)
    if (!tag) return []
    return tag.childIds
      .map((childId) => this.byId.get(childId))
      .filter((t): t is ArtTag => t !== undefined)
  }

  getParents(id: string): ArtTag[] {
    const tag = this.byId.get(id)
    if (!tag) return []
    return tag.parentIds
      .map((parentId) => this.byId.get(parentId))
      .filter((t): t is ArtTag => t !== undefined)
  }

  getDescendants(id: string): ArtTag[] {
    return this.descendantsById.get(id) ?? []
  }

  getAncestors(id: string): ArtTag[] {
    return this.ancestorsById.get(id) ?? []
  }

  /** Tags with no parent — the entry points into the hierarchy, alphabetical. */
  getRoots(): ArtTag[] {
    return this.roots
  }
}
