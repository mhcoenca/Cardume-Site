import { Star } from 'lucide-react'
import { extractGroupedTokens } from '@/query/parseQuery'
import type { QueryClause } from '../types'

// r:common, r:uncommon, r:rare, r:mythic — confirmed against
// api.scryfall.com/cards/search for each value. r:special and r:bonus are
// real but excluded here — niche print rarities not worth the clutter.
const RARITIES = [
  { value: 'common', label: 'Common' },
  { value: 'uncommon', label: 'Uncommon' },
  { value: 'rare', label: 'Rare' },
  { value: 'mythic', label: 'Mythic' },
]

// `r:` and `rarity:` are the same operator, and Scryfall also accepts each
// rarity's single-letter abbreviation as the operand (r:r is the same as
// r:rare) — both confirmed against the search API. This clause's own
// toQuery always emits the short operator + full word; fromQueryAll
// accepts every form for imports.
const TOKEN_PATTERN = /^(?:r|rarity):(\w+)$/i
const KNOWN_VALUES = new Set(RARITIES.map((r) => r.value))
const ABBREVIATIONS: Record<string, string> = { c: 'common', u: 'uncommon', r: 'rare', m: 'mythic' }

// A card only ever has one rarity, so multiple selections must be ORed —
// unlike Type Line, where AND is the correct reading.
export const rarityClause: QueryClause<string[]> = {
  id: 'rarity',
  label: 'Rarity',
  description: "Filter by a card's print rarity.",
  category: 'Collecting',
  icon: Star,
  operator: 'r',
  inputType: 'multi-select',
  options: RARITIES,
  defaultValue: [],
  toQuery: (value) => {
    if (!value.length) return ''
    const tokens = value.map((rarity) => `r:${rarity}`)
    return tokens.length === 1 ? tokens[0] : `(${tokens.join(' or ')})`
  },
  // Reconstructs a single bare `r:x` token, or one `(r:a or r:b)` group —
  // whichever this clause's own toQuery would have produced.
  fromQueryAll: (tokens) => {
    const result = extractGroupedTokens(tokens, TOKEN_PATTERN)
    if (!result) return null
    const rarities = result.items.map((raw) => ABBREVIATIONS[raw.toLowerCase()] ?? raw.toLowerCase())
    if (!rarities.every((r) => KNOWN_VALUES.has(r))) return null
    return { value: rarities, remaining: result.remaining }
  },
  metadata: {
    keywords: ['common', 'uncommon', 'rare', 'mythic'],
    examples: ['r:mythic', '(r:rare or r:mythic)'],
    docsUrl: 'https://scryfall.com/docs/syntax#rarity',
  },
}
