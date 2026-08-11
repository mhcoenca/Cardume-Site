import { Palette } from 'lucide-react'
import { extractGroupedTokens } from '@/query/parseQuery'
import { getArtTagBySlug } from '@/services/artTags/ArtTagService'
import type { ArtTagValue } from '@/services/artTags/types'
import type { QueryClause } from '../types'

const TOKEN_PATTERN = /^atag:(\S+)$/i

export type ArtTagCombineMode = 'and' | 'or'

export interface ArtTagClauseValue {
  tags: ArtTagValue[]
  combineMode: ArtTagCombineMode
}

const DEFAULT_VALUE: ArtTagClauseValue = { tags: [], combineMode: 'and' }

export const artTagClause: QueryClause<ArtTagClauseValue> = {
  id: 'art-tag',
  label: 'Art Tag',
  description: 'Match cards whose illustration is tagged with one or more community-curated art tags.',
  category: 'Flavor',
  icon: Palette,
  operator: 'atag',
  inputType: 'art-tag',
  defaultValue: DEFAULT_VALUE,
  toQuery: (value) => {
    if (!value.tags.length) return ''
    const tokens = value.tags.map((tag) => `atag:${tag.slug}`)
    if (tokens.length === 1) return tokens[0]
    return value.combineMode === 'or' ? `(${tokens.join(' OR ')})` : `(${tokens.join(' ')})`
  },
  // Reconstructs a single bare `atag:x` token, or one `(atag:a atag:b)` /
  // `(atag:a OR atag:b)` group — whichever this clause's own toQuery would
  // have produced. Mirrors the Oracle Tag clause.
  fromQueryAll: (tokens) => {
    const result = extractGroupedTokens(tokens, TOKEN_PATTERN)
    if (!result) return null
    const tags = result.items.map((slug) => {
      const cached = getArtTagBySlug(slug)
      return cached ? { id: cached.id, slug: cached.slug, label: cached.label } : { id: slug, slug, label: slug }
    })
    return { value: { tags, combineMode: result.combineMode }, remaining: result.remaining }
  },
  metadata: {
    keywords: ['illustration tag', 'artwork tag', 'tagger'],
    examples: ['atag:knight', '(atag:elf OR atag:dwarf)'],
    placeholder: 'Search Art Tags…',
    docsUrl: 'https://scryfall.com/docs/api/tags',
  },
}
