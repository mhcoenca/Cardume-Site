import { ListChecks } from 'lucide-react'
import { CRITERIA_OPTIONS } from '@/lib/criteria'
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
  // Only reconstructs a single is:/-is: token into a one-item value — same
  // limitation Rarity and Reverse Oracle Tag have on import, since the
  // URL-import parser recognizes one query token at a time, not a group.
  fromQuery: (fragment) => {
    const match = FRAGMENT_PATTERN.exec(fragment)
    if (!match) return null
    const [, negation, value] = match
    const lower = value.toLowerCase()
    if (!KNOWN_VALUES.has(lower)) return null
    return { items: [{ value: lower, negated: Boolean(negation) }], combineMode: 'and' }
  },
  metadata: {
    keywords: ['is', 'has', 'promo', 'foil', 'reprint', 'frame', 'layout', 'misc'],
    examples: ['is:promo', '-is:reprint', '(is:foil or is:etched)'],
    docsUrl: 'https://scryfall.com/advanced',
  },
}
