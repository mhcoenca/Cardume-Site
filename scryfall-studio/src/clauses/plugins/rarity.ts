import { Star } from 'lucide-react'
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

const TOKEN_PATTERN = /^r:(\w+)$/i
const KNOWN_VALUES = new Set(RARITIES.map((r) => r.value))

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
  fromQuery: (fragment) => {
    const match = TOKEN_PATTERN.exec(fragment)
    if (!match) return null
    const rarity = match[1].toLowerCase()
    return KNOWN_VALUES.has(rarity) ? [rarity] : null
  },
  metadata: {
    keywords: ['common', 'uncommon', 'rare', 'mythic'],
    examples: ['r:mythic', '(r:rare or r:mythic)'],
    docsUrl: 'https://scryfall.com/docs/syntax#rarity',
  },
}
