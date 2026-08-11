import { Shapes } from 'lucide-react'
import { extractGroupedTokens } from '@/query/parseQuery'
import { isKnownType } from '@/services/scryfall/typeCatalog'
import type { QueryClause } from '../types'

export type TypeCombineMode = 'and' | 'or'

export interface TypeLineValue {
  types: string[]
  /** Subset of `types` currently negated (`-t:x` instead of `t:x`). */
  negated: string[]
  combineMode: TypeCombineMode
}

const DEFAULT_VALUE: TypeLineValue = { types: [], negated: [], combineMode: 'and' }

// Each selected type becomes its own `t:x` (or `-t:x`) token. With 2+
// types, Scryfall's own "Allow partial type matches" checkbox is what
// decides AND vs OR — confirmed by submitting scryfall.com/advanced
// directly: unchecked emits `(type:a type:b)` (implicit AND), checked
// emits `(type:a OR type:b)`. A single type never needs parens either way.
//
// `t:` and `type:` are the same operator on Scryfall (confirmed against
// the search API) — fromQueryAll accepts both for imports, even though
// this clause's own toQuery only ever emits the short form.
const RAW_ITEM_PATTERN = /^(-?(?:t|type):\w+)$/i

function parseRawType(fragment: string): { type: string; negated: boolean } | null {
  const match = /^(-?)(?:t|type):(\w+)$/i.exec(fragment)
  if (!match) return null
  const [, negation, type] = match
  return isKnownType(type) ? { type, negated: Boolean(negation) } : null
}

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
    const tokens = value.types.map(
      (type) => `${value.negated.includes(type) ? '-' : ''}t:${type.toLowerCase()}`,
    )
    if (tokens.length === 1) return tokens[0]
    return value.combineMode === 'or' ? `(${tokens.join(' OR ')})` : `(${tokens.join(' ')})`
  },
  // Reconstructs a single bare `t:x` / `-t:x` token, or one `(t:a t:b)` /
  // `(t:a OR t:b)` group — whichever this clause's own toQuery would have
  // produced.
  fromQueryAll: (tokens) => {
    const result = extractGroupedTokens(tokens, RAW_ITEM_PATTERN)
    if (!result) return null
    const parsed = result.items.map(parseRawType)
    if (!parsed.every((item): item is { type: string; negated: boolean } => item !== null)) {
      return null
    }
    return {
      value: {
        types: parsed.map((item) => item.type),
        negated: parsed.filter((item) => item.negated).map((item) => item.type),
        combineMode: result.combineMode,
      },
      remaining: result.remaining,
    }
  },
  metadata: {
    keywords: ['type', 'subtype', 'supertype', 'creature type', 'tribal'],
    examples: ['t:creature', '-t:land', '(t:legendary t:creature)', '(t:elf OR t:goblin)'],
    docsUrl: 'https://scryfall.com/docs/syntax#card-types',
  },
}
