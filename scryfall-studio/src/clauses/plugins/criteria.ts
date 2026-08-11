import { ListChecks } from 'lucide-react'
import { CRITERIA_OPTIONS } from '@/lib/criteria'
import { extractGroupedTokens } from '@/query/parseQuery'
import type { QueryClause } from '../types'

export interface CriteriaItem {
  value: string
  negated: boolean
}

export type CriteriaCombineMode = 'and' | 'or'

export interface CriteriaValue {
  items: CriteriaItem[]
  combineMode: CriteriaCombineMode
}

const DEFAULT_VALUE: CriteriaValue = { items: [], combineMode: 'and' }
const KNOWN_VALUES = new Set(CRITERIA_OPTIONS.map((o) => o.value))
const FRAGMENT_PATTERN = /^(-?)is:(\w+)$/i
// Same fragment, kept whole (not split into negation/value) for
// `extractGroupedTokens`, which only knows how to capture one string per item.
const RAW_ITEM_PATTERN = /^(-?is:\w+)$/i

function parseItem(fragment: string): CriteriaItem | null {
  const match = FRAGMENT_PATTERN.exec(fragment)
  if (!match) return null
  const [, negation, value] = match
  const lower = value.toLowerCase()
  return KNOWN_VALUES.has(lower) ? { value: lower, negated: Boolean(negation) } : null
}

export const criteriaClause: QueryClause<CriteriaValue> = {
  id: 'criteria',
  label: 'Criteria',
  description: "Match miscellaneous card attributes — promos, frames, layouts, and more.",
  category: 'Collecting',
  icon: ListChecks,
  operator: 'is',
  inputType: 'criteria',
  defaultValue: DEFAULT_VALUE,
  toQuery: (value) => {
    if (!value.items.length) return ''
    const tokens = value.items.map((item) => `${item.negated ? '-' : ''}is:${item.value}`)
    if (tokens.length === 1) return tokens[0]
    return value.combineMode === 'or' ? `(${tokens.join(' or ')})` : tokens.join(' ')
  },
  // Two shapes to reconstruct, matching this clause's own toQuery: an
  // `(a or b)` OR-group (single token), or scattered standalone is:/-is:
  // tokens with no parens at all (the AND case — deliberately unwrapped,
  // unlike Type Line/Oracle Tag, so a plain per-token scan already catches
  // every item without needing a group).
  fromQueryAll: (tokens) => {
    const grouped = extractGroupedTokens(tokens, RAW_ITEM_PATTERN)
    if (grouped && grouped.combineMode === 'or') {
      const items = grouped.items.map(parseItem)
      if (items.every((item): item is CriteriaItem => item !== null)) {
        return { value: { items, combineMode: 'or' }, remaining: grouped.remaining }
      }
    }

    const items: CriteriaItem[] = []
    const remaining: string[] = []
    for (const token of tokens) {
      const item = parseItem(token)
      if (item) items.push(item)
      else remaining.push(token)
    }
    if (!items.length) return null
    return { value: { items, combineMode: 'and' }, remaining }
  },
  metadata: {
    keywords: ['is', 'has', 'promo', 'foil', 'reprint', 'frame', 'layout', 'misc'],
    examples: ['is:promo', '-is:reprint', '(is:foil or is:etched)'],
    docsUrl: 'https://scryfall.com/advanced',
  },
}
