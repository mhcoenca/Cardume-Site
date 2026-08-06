import { Shapes } from 'lucide-react'
import { isKnownType } from '@/services/scryfall/typeCatalog'
import type { QueryClause } from '../types'

export type TypeCombineMode = 'and' | 'or'

export interface TypeLineValue {
  types: string[]
  combineMode: TypeCombineMode
}

const DEFAULT_VALUE: TypeLineValue = { types: [], combineMode: 'and' }

// Each selected type becomes its own `t:x` token. With 2+ types, Scryfall's
// own "Allow partial type matches" checkbox is what decides AND vs OR —
// confirmed by submitting scryfall.com/advanced directly: unchecked emits
// `(type:a type:b)` (implicit AND), checked emits `(type:a OR type:b)`. A
// single type never needs parens either way.
const TOKEN_PATTERN = /^t:(\w+)$/i

export const cardTypesClause: QueryClause<TypeLineValue> = {
  id: 'type-line',
  label: 'Type Line',
  description: 'Match cards with the selected types, subtypes, and supertypes.',
  category: 'Type & Stats',
  icon: Shapes,
  operator: 't',
  inputType: 'type-line',
  defaultValue: DEFAULT_VALUE,
  toQuery: (value) => {
    if (!value.types.length) return ''
    const tokens = value.types.map((type) => `t:${type.toLowerCase()}`)
    if (tokens.length === 1) return tokens[0]
    return value.combineMode === 'or' ? `(${tokens.join(' OR ')})` : `(${tokens.join(' ')})`
  },
  // Only reconstructs a single t: token into a one-type value on import —
  // same limitation as Rarity/Criteria/Reverse Oracle Tag, since the
  // URL-import parser recognizes one query token at a time, not a group.
  fromQuery: (fragment) => {
    const match = TOKEN_PATTERN.exec(fragment)
    if (!match) return null
    return isKnownType(match[1]) ? { types: [match[1]], combineMode: 'and' } : null
  },
  metadata: {
    keywords: ['type', 'subtype', 'supertype', 'creature type', 'tribal'],
    examples: ['t:creature', '(t:legendary t:creature)', '(t:elf OR t:goblin)'],
    docsUrl: 'https://scryfall.com/docs/syntax#card-types',
  },
}
