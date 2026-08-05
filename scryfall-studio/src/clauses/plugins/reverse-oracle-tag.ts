import { ArrowLeftRight } from 'lucide-react'
import type { OracleTagValue } from '@/services/oracleTags/types'
import type { QueryClause } from '../types'

export interface ReverseOracleTagCard {
  id: string
  name: string
  scryfallUri: string
}

export type ReverseOracleTagCombineMode = 'or' | 'and'

export interface ReverseOracleTagValue {
  card: ReverseOracleTagCard | null
  /** Every Oracle Tag found on the looked-up card. */
  tags: OracleTagValue[]
  /** Pill toggle state — doesn't affect the query until "Search" commits it. */
  pendingTagIds: string[]
  /** What toQuery actually serializes — set by clicking "Search". */
  activeTagIds: string[]
  /** 'or' = any of the selected tags (similar cards); 'and' = all of them (rarer, narrower). */
  combineMode: ReverseOracleTagCombineMode
}

const DEFAULT_VALUE: ReverseOracleTagValue = {
  card: null,
  tags: [],
  pendingTagIds: [],
  activeTagIds: [],
  combineMode: 'or',
}

export const reverseOracleTagClause: QueryClause<ReverseOracleTagValue> = {
  id: 'reverse-oracle-tag',
  label: 'Reverse Oracle Tag',
  description: "Look up a card, then find others that share its Oracle Tags.",
  category: 'Oracle',
  icon: ArrowLeftRight,
  operator: 'otag',
  inputType: 'reverse-oracle-tag',
  defaultValue: DEFAULT_VALUE,
  toQuery: (value) => {
    if (!value.activeTagIds.length) return ''
    const slugs = value.tags
      .filter((tag) => value.activeTagIds.includes(tag.id))
      .map((tag) => `otag:${tag.slug}`)
    if (!slugs.length) return ''
    if (slugs.length === 1) return slugs[0]
    return value.combineMode === 'and' ? slugs.join(' ') : `(${slugs.join(' or ')})`
  },
  metadata: {
    keywords: ['similar cards', 'find similar', 'card lookup', 'like this card'],
    examples: ['(otag:spot-removal or otag:meme)', 'otag:spot-removal otag:meme'],
  },
}
