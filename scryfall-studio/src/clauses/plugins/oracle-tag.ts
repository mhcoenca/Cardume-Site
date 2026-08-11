import { Tags } from 'lucide-react'
import { extractGroupedTokens } from '@/query/parseQuery'
import { getOracleTagBySlug } from '@/services/oracleTags/OracleTagService'
import type { OracleTagValue } from '@/services/oracleTags/types'
import type { QueryClause } from '../types'

const TOKEN_PATTERN = /^otag:(\S+)$/i

export type OracleTagCombineMode = 'and' | 'or'

export interface OracleTagClauseValue {
  tags: OracleTagValue[]
  combineMode: OracleTagCombineMode
}

const DEFAULT_VALUE: OracleTagClauseValue = { tags: [], combineMode: 'and' }

export const oracleTagClause: QueryClause<OracleTagClauseValue> = {
  id: 'oracle-tag',
  label: 'Oracle Tag',
  description: 'Match cards tagged with one or more community-curated functional tags.',
  category: 'Oracle',
  icon: Tags,
  operator: 'otag',
  inputType: 'oracle-tag',
  defaultValue: DEFAULT_VALUE,
  toQuery: (value) => {
    if (!value.tags.length) return ''
    const tokens = value.tags.map((tag) => `otag:${tag.slug}`)
    if (tokens.length === 1) return tokens[0]
    return value.combineMode === 'or' ? `(${tokens.join(' OR ')})` : `(${tokens.join(' ')})`
  },
  // Reconstructs a single bare `otag:x` token, or one `(otag:a otag:b)` /
  // `(otag:a OR otag:b)` group — whichever this clause's own toQuery would
  // have produced.
  fromQueryAll: (tokens) => {
    const result = extractGroupedTokens(tokens, TOKEN_PATTERN)
    if (!result) return null
    // The dataset is lazy-loaded on first focus, so it likely isn't ready
    // yet during an import. Fall back to the slug as both id and label —
    // the real label appears once the user opens this card and the
    // dataset loads (label === slug for most tags anyway).
    const tags = result.items.map((slug) => {
      const cached = getOracleTagBySlug(slug)
      return cached ? { id: cached.id, slug: cached.slug, label: cached.label } : { id: slug, slug, label: slug }
    })
    return { value: { tags, combineMode: result.combineMode }, remaining: result.remaining }
  },
  metadata: {
    keywords: ['tagger', 'functional tag', 'tagged'],
    examples: ['otag:activated-ability', '(otag:removal OR otag:ramp)'],
    placeholder: 'Search Oracle Tags…',
    docsUrl: 'https://scryfall.com/docs/api/tags',
  },
}
