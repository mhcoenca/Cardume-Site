import { fetchSets } from './ScryfallSetProvider'
import { SetRepository } from './SetRepository'
import { SetSearchIndex } from './SetSearchIndex'
import type { ScryfallSet, SetSortOrder } from './types'

// Orchestrates Provider -> Repository -> SearchIndex, same seam as
// OracleTagService — the only thing that would need to change if any of
// those three were swapped out.
let repository: SetRepository | null = null
let searchIndex: SetSearchIndex | null = null
let loadPromise: Promise<void> | null = null
let loadError: string | null = null

async function load(): Promise<void> {
  const sets = await fetchSets()
  repository = new SetRepository(sets)
  searchIndex = new SetSearchIndex(repository)
}

/**
 * Fetches the set list at most once; safe to call repeatedly. Callers
 * trigger this lazily (on first focus of the Set field) — it is never
 * called on app startup.
 */
export function ensureSetsLoaded(): Promise<void> {
  if (repository) return Promise.resolve()
  if (!loadPromise) {
    loadError = null
    loadPromise = load().catch((error: unknown) => {
      loadError = error instanceof Error ? error.message : 'Failed to load sets.'
      loadPromise = null
      throw error
    })
  }
  return loadPromise
}

export function isSetsLoaded(): boolean {
  return repository !== null
}

export function getSetsLoadError(): string | null {
  return loadError
}

export function browseSets(order: SetSortOrder, limit = 40): ScryfallSet[] {
  return searchIndex?.browse(order, limit) ?? []
}

export function searchSets(query: string, order: SetSortOrder, limit = 40): ScryfallSet[] {
  return searchIndex?.search(query, order, limit) ?? []
}

export function getSetByCode(code: string): ScryfallSet | undefined {
  return repository?.getByCode(code)
}
