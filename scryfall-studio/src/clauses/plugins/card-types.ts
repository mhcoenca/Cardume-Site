import { Shapes } from 'lucide-react'
import { isKnownType } from '@/services/scryfall/typeCatalog'
import type { QueryClause } from '../types'

// Each selected type becomes its own `t:x` token, space-joined — Scryfall
// ANDs top-level tokens by default, and that's the correct reading for a
// type line: a card is Legendary AND Creature AND Elf simultaneously, never
// "Legendary or Creature". (Wanting "Elf or Goblin" instead is rarer and
// still expressible by hand in the base query.)
const TOKEN_PATTERN = /^t:(\w+)$/i

export const cardTypesClause: QueryClause<string[]> = {
  id: 'type-line',
  label: 'Type Line',
  description: 'Match cards with all of the selected types, subtypes, and supertypes.',
  category: 'Type & Stats',
  icon: Shapes,
  operator: 't',
  inputType: 'type-line',
  defaultValue: [],
  toQuery: (value) => value.map((type) => `t:${type.toLowerCase()}`).join(' '),
  fromQuery: (fragment) => {
    const match = TOKEN_PATTERN.exec(fragment)
    if (!match) return null
    return isKnownType(match[1]) ? [match[1]] : null
  },
  metadata: {
    keywords: ['type', 'subtype', 'supertype', 'creature type', 'tribal'],
    examples: ['t:creature', 't:legendary t:creature'],
    docsUrl: 'https://scryfall.com/docs/syntax#card-types',
  },
}
