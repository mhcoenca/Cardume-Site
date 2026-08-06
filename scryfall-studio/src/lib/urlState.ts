import { getQueryClause } from '@/clauses/registry'
import type { QueryClauseInstance } from '@/query/types'
import { DEFAULT_SORT, type SortValue } from './sortOptions'

const PARAM_NAME = 'state'

interface SerializedInstance {
  clauseId: string
  value: unknown
}

interface SerializedState {
  instances: SerializedInstance[]
  sort: SortValue
}

/**
 * Card-u.me's own shareable-link format — not the Scryfall `q=` string.
 * That round-trips lossily for anything with 2+ selected values (a
 * parenthesized group like `(t:elf OR t:goblin)` is one opaque token to
 * every clause's `fromQuery`), which is an accepted limitation for
 * *importing* a pasted Scryfall URL but not acceptable for a link this app
 * generates itself — whoever opens it should see the exact same state.
 */
export function writeUrlState(instances: QueryClauseInstance[], sort: SortValue): void {
  const payload: SerializedState = {
    instances: instances.map(({ clauseId, value }) => ({ clauseId, value })),
    sort,
  }
  const params = new URLSearchParams(window.location.search)
  params.set(PARAM_NAME, JSON.stringify(payload))
  const next = `${window.location.pathname}?${params.toString()}${window.location.hash}`
  window.history.replaceState(null, '', next)
}

/**
 * Reads `?state=` back out, if present. Skips (doesn't throw on) malformed
 * JSON or a `clauseId` no longer registered — e.g. an old shared link
 * referencing a since-removed clause.
 */
export function readUrlState(): { instances: QueryClauseInstance[]; sort: SortValue } | null {
  const raw = new URLSearchParams(window.location.search).get(PARAM_NAME)
  if (!raw) return null

  let parsed: SerializedState
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!parsed || !Array.isArray(parsed.instances)) return null

  const instances: QueryClauseInstance[] = []
  for (const item of parsed.instances) {
    if (!item || typeof item.clauseId !== 'string') continue
    if (!getQueryClause(item.clauseId)) continue
    instances.push({ instanceId: crypto.randomUUID(), clauseId: item.clauseId, value: item.value })
  }

  const sort: SortValue =
    parsed.sort && typeof parsed.sort === 'object' ? parsed.sort : DEFAULT_SORT

  return { instances, sort }
}
