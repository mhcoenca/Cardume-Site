import { Layers } from 'lucide-react'
import { COLOR_OPTIONS, sortColors, WUBRG_ORDER, type ColorCode } from '@/lib/colors'
import type { QueryClause } from '../types'

// Commander deckbuilding only ever asks one question: "does this card's
// identity fit inside my deck's colors?" — that's id<=, always. Unlike
// Colors (the card's own color), "exactly these colors" / "including these
// colors" don't correspond to any real deckbuilding need, so unlike Colors,
// Color Identity skips the operator dropdown entirely and always
// serializes as id<=.
const FRAGMENT_PATTERN = /^id<=(.+)$/i
// `commander:` is Scryfall's own shorthand for `id<=` (confirmed against
// the search API — identical result counts) — this clause's own toQuery
// always emits `id<=`; fromQuery accepts both for imports.
const COMMANDER_PATTERN = /^commander:(.+)$/i

export const identityClause: QueryClause<string[]> = {
  id: 'identity',
  label: 'Color Identity',
  description: 'Filter by color identity — useful for Commander deckbuilding.',
  category: 'Colors',
  icon: Layers,
  operator: 'id',
  inputType: 'multi-select',
  options: COLOR_OPTIONS.map((c) => ({ value: c.code, label: c.label, iconUrl: c.iconUrl })),
  defaultValue: [],
  toQuery: (value) => {
    if (!value.length) return ''
    const operand = value.includes('C') ? 'c' : sortColors(value).join('')
    return `id<=${operand}`
  },
  fromQuery: (fragment) => {
    const match = FRAGMENT_PATTERN.exec(fragment) ?? COMMANDER_PATTERN.exec(fragment)
    if (!match) return null
    const operand = match[1]
    if (operand.toLowerCase() === 'c') return ['C']
    const codes = operand.toUpperCase().split('')
    const valid = codes.length > 0 && codes.every((c) => WUBRG_ORDER.includes(c as ColorCode))
    return valid ? codes : null
  },
  metadata: {
    keywords: ['commander', 'edh', 'identity'],
    examples: ['id<=bg', 'id<=WUBRG'],
    docsUrl: 'https://scryfall.com/docs/syntax#colors',
  },
}
