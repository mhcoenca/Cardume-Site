import { fetchOracleTagDataset } from './ScryfallOracleTagProvider'
import { OracleTagRepository } from './OracleTagRepository'
import { OracleTagSearchIndex } from './OracleTagSearchIndex'
import type { OracleTag } from './types'

// Orchestrates Provider -> Repository -> SearchIndex. Holds no data of its
// own — it's the seam React components talk to, and the only thing that
// would need to change if any of those three were swapped out.
let repository: OracleTagRepository | null = null
let searchIndex: OracleTagSearchIndex | null = null
let loadPromise: Promise<void> | null = null
let loadError: string | null = null

async function load(): Promise<void> {
  const dataset = await fetchOracleTagDataset()
  repository = new OracleTagRepository(dataset)
  searchIndex = new OracleTagSearchIndex(repository)
}

/**
 * Fetches and indexes the official dataset at most once; safe to call
 * repeatedly. Callers are responsible for triggering this lazily (e.g. on
 * first focus of an Oracle Tag field) — it is never called on app startup.
 */
export function ensureOracleTagsLoaded(): Promise<void> {
  if (repository) return Promise.resolve()
  if (!loadPromise) {
    loadError = null
    loadPromise = load().catch((error: unknown) => {
      loadError = error instanceof Error ? error.message : 'Failed to load Oracle Tags.'
      loadPromise = null
      throw error
    })
  }
  return loadPromise
}

export function isOracleTagsLoaded(): boolean {
  return repository !== null
}

export function getOracleTagsLoadError(): string | null {
  return loadError
}

export function searchOracleTags(query: string, limit = 20): OracleTag[] {
  return searchIndex?.search(query, limit) ?? []
}

export function getOracleTagById(id: string): OracleTag | undefined {
  return repository?.getById(id)
}

export function getOracleTagBySlug(slug: string): OracleTag | undefined {
  return repository?.getBySlug(slug)
}

export function getOracleTagChildren(id: string): OracleTag[] {
  return repository?.getChildren(id) ?? []
}

export function getOracleTagParents(id: string): OracleTag[] {
  return repository?.getParents(id) ?? []
}

export function getOracleTagDescendants(id: string): OracleTag[] {
  return repository?.getDescendants(id) ?? []
}

export function getOracleTagAncestors(id: string): OracleTag[] {
  return repository?.getAncestors(id) ?? []
}

export function getOracleTagRoots(): OracleTag[] {
  return repository?.getRoots() ?? []
}

/** Every tag directly applied to a card, given its oracle_id. */
export function getOracleTagsForCard(oracleId: string): OracleTag[] {
  return repository?.getTagsForOracleId(oracleId) ?? []
}
