// Sort isn't a QueryClause — it never affects the query, only how results
// are fetched/displayed, so it lives as a fixed control on the Results
// action bar instead of something you add from the sidebar. This file just
// holds the shared data/types both the store and that control need.

export const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'set', label: 'Set' },
  { value: 'released', label: 'Release Date' },
  { value: 'rarity', label: 'Rarity' },
  { value: 'color', label: 'Color' },
  { value: 'cmc', label: 'Mana Value' },
  { value: 'power', label: 'Power' },
  { value: 'toughness', label: 'Toughness' },
  { value: 'artist', label: 'Artist' },
  { value: 'edhrec', label: 'EDHREC Rank' },
  { value: 'usd', label: 'Price (USD)' },
]

export type SortDirection = 'auto' | 'asc' | 'desc'

/** Scryfall's own three directions — 'auto' picks whatever's conventional for the chosen field. */
export const SORT_DIRECTIONS: { value: SortDirection; label: string; title: string }[] = [
  { value: 'auto', label: 'Auto', title: "Scryfall's default direction for this field" },
  { value: 'asc', label: 'Asc', title: 'Ascending' },
  { value: 'desc', label: 'Desc', title: 'Descending' },
]

export interface SortValue {
  order: string
  dir: SortDirection
}

export const DEFAULT_SORT: SortValue = { order: '', dir: 'auto' }

/** Same shape a clause's toUrlParams would produce — Sort just isn't a clause anymore. */
export function sortToUrlParams(value: SortValue): Record<string, string> {
  const params: Record<string, string> = {}
  if (value.order) {
    params.order = value.order
    if (value.dir !== 'auto') params.dir = value.dir
  }
  return params
}
