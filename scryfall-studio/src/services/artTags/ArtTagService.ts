import { fetchArtTagDataset } from './ScryfallArtTagProvider'
import { ArtTagRepository } from './ArtTagRepository'
import { ArtTagSearchIndex } from './ArtTagSearchIndex'
import type { ArtTag } from './types'

// Orchestrates Provider -> Repository -> SearchIndex. Mirrors
// OracleTagService — a separate module (not a shared generic) so each
// pipeline's field names stay honest about what they index (oracle_id vs
// illustration_id) instead of forcing one misleading shared shape.
let repository: ArtTagRepository | null = null
let searchIndex: ArtTagSearchIndex | null = null
let loadPromise: Promise<void> | null = null
let loadError: string | null = null

async function load(): Promise<void> {
  const dataset = await fetchArtTagDataset()
  repository = new ArtTagRepository(dataset)
  searchIndex = new ArtTagSearchIndex(repository)
}

/**
 * Fetches and indexes the official dataset at most once; safe to call
 * repeatedly. Callers are responsible for triggering this lazily (e.g. on
 * first focus of an Art Tag field) — it is never called on app startup.
 */
export function ensureArtTagsLoaded(): Promise<void> {
  if (repository) return Promise.resolve()
  if (!loadPromise) {
    loadError = null
    loadPromise = load().catch((error: unknown) => {
      loadError = error instanceof Error ? error.message : 'Failed to load Art Tags.'
      loadPromise = null
      throw error
    })
  }
  return loadPromise
}

export function isArtTagsLoaded(): boolean {
  return repository !== null
}

export function getArtTagsLoadError(): string | null {
  return loadError
}

export function searchArtTags(query: string, limit = 20): ArtTag[] {
  return searchIndex?.search(query, limit) ?? []
}

export function getArtTagById(id: string): ArtTag | undefined {
  return repository?.getById(id)
}

export function getArtTagBySlug(slug: string): ArtTag | undefined {
  return repository?.getBySlug(slug)
}

export function getArtTagChildren(id: string): ArtTag[] {
  return repository?.getChildren(id) ?? []
}

export function getArtTagRoots(): ArtTag[] {
  return repository?.getRoots() ?? []
}
