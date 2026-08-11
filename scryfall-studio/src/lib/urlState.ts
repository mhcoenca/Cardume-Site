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
  cardName?: string
  printedOnly?: boolean
}

interface UrlState {
  instances: QueryClauseInstance[]
  sort: SortValue
  cardName: string
  printedOnly: boolean
}

/**
 * Card-u.me's own shareable-link format — not the Scryfall `q=` string.
 * That round-trips lossily for anything with 2+ selected values (a
 * parenthesized group like `(t:elf OR t:goblin)` is one opaque token to
 * every clause's `fromQuery`), which is an accepted limitation for
 * *importing* a pasted Scryfall URL but not acceptable for a link this app
 * generates itself — whoever opens it should see the exact same state.
 */
export function writeUrlState(
  instances: QueryClauseInstance[],
  sort: SortValue,
  cardName: string,
  printedOnly: boolean,
): void {
  const payload: SerializedState = {
    instances: instances.map(({ clauseId, value }) => ({ clauseId, value })),
    sort,
    cardName,
    printedOnly,
  }
  const params = new URLSearchParams(window.location.search)
  params.set(PARAM_NAME, JSON.stringify(payload))
  const next = `${window.location.pathname}?${params.toString()}${window.location.hash}`
  window.history.replaceState(null, '', next)
}

/**
 * Reads `?state=` back out, if present. Skips (doesn't throw on) malformed
 * JSON or a `clauseId` no longer registered — e.g. an old shared link
 * referencing a since-removed clause. `cardName`/`printedOnly` are
 * optional for backward compatibility with links generated before those
 * became top-level fields — a legacy `card-name` clause instance (from
 * before it was deleted) is unpacked into them instead of being dropped.
 */
export function readUrlState(): UrlState | null {
  const raw = new URLSearchParams(window.location.search).get(PARAM_NAME)
  if (!raw) return null

  let parsed: SerializedState
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!parsed || !Array.isArray(parsed.instances)) return null

  let cardName = typeof parsed.cardName === 'string' ? parsed.cardName : ''
  let printedOnly = typeof parsed.printedOnly === 'boolean' ? parsed.printedOnly : true

  const instances: QueryClauseInstance[] = []
  for (const item of parsed.instances) {
    if (!item || typeof item.clauseId !== 'string') continue
    if (item.clauseId === 'card-name') {
      const legacyValue = item.value as { name?: unknown; printedOnly?: unknown } | undefined
      if (typeof legacyValue?.name === 'string') cardName = legacyValue.name
      if (typeof legacyValue?.printedOnly === 'boolean') printedOnly = legacyValue.printedOnly
      continue
    }
    if (!getQueryClause(item.clauseId)) continue
    instances.push({ instanceId: crypto.randomUUID(), clauseId: item.clauseId, value: item.value })
  }

  const sort: SortValue =
    parsed.sort && typeof parsed.sort === 'object' ? parsed.sort : DEFAULT_SORT

  return { instances, sort, cardName, printedOnly }
}
