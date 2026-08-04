import { Shapes } from 'lucide-react'
import type { QueryClause } from '../types'

const CARD_TYPES = [
  'creature',
  'instant',
  'sorcery',
  'artifact',
  'enchantment',
  'planeswalker',
  'land',
]

function serializeGroup(types: string[]): string {
  if (types.length === 1) return `t:${types[0]}`
  return `(${types.map((type) => `t:${type}`).join(' or ')})`
}

// Matches this clause's own serialization: `t:x` or `(t:x or t:y or ...)`.
// Checking multiple boxes reads as "any of these" — the same mental model
// as faceted filters elsewhere (checking Red and Blue means red or blue).
const GROUP_PATTERN = /^\((t:\w+)(?: or (t:\w+))*\)$/i
const SINGLE_PATTERN = /^t:(\w+)$/i

export const cardTypesClause: QueryClause<string[]> = {
  id: 'card-types',
  label: 'Card Types',
  description: 'Match cards of any of the selected types.',
  category: 'Types',
  icon: Shapes,
  operator: 't',
  inputType: 'multi-select',
  options: CARD_TYPES.map((type) => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1),
  })),
  defaultValue: [],
  toQuery: (value) => (value.length ? serializeGroup(value) : ''),
  fromQuery: (fragment) => {
    const single = SINGLE_PATTERN.exec(fragment)
    if (single) {
      const type = single[1].toLowerCase()
      return CARD_TYPES.includes(type) ? [type] : null
    }
    if (!GROUP_PATTERN.test(fragment)) return null
    const types = fragment
      .slice(1, -1)
      .split(' or ')
      .map((part) => part.replace(/^t:/i, '').toLowerCase())
    return types.every((type) => CARD_TYPES.includes(type)) ? types : null
  },
  metadata: {
    keywords: ['type', 'creature', 'instant', 'sorcery', 'artifact', 'enchantment', 'land'],
    examples: ['t:creature', '(t:creature or t:artifact)'],
    docsUrl: 'https://scryfall.com/docs/syntax#card-types',
  },
}
