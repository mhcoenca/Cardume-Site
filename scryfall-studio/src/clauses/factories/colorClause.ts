import type { LucideIcon } from 'lucide-react'
import { COLOR_OPTIONS, WUBRG_ORDER, sortColors, type ColorCode } from '@/lib/colors'
import type { QueryClause, QueryClauseMetadata } from '../types'

export type ColorOperator = '=' | '<=' | '>='

/** Same three criteria Scryfall's own Advanced Search offers for color comparisons. */
export const COLOR_OPERATORS: { value: ColorOperator; label: string }[] = [
  { value: '=', label: 'Exactly these colors' },
  { value: '>=', label: 'Including these colors' },
  { value: '<=', label: 'At most these colors' },
]

export interface ColorClauseValue {
  colors: string[]
  operator: ColorOperator
}

interface ColorClauseConfig {
  id: string
  label: string
  description: string
  category: string
  icon: LucideIcon
  /** The bare Scryfall operator, e.g. 'c' or 'id'. */
  operator: string
  metadata?: QueryClauseMetadata
}

/** `:` is a synonym for `=` on import; strict `<`/`>` aren't offered as criteria (rare, no clean label). */
function normalizeOperator(symbol: string): ColorOperator | null {
  if (symbol === ':' || symbol === '=') return '='
  if (symbol === '<=') return '<='
  if (symbol === '>=') return '>='
  return null
}

/**
 * Colors and Color Identity share this shape: a set of WUBRG(+Colorless)
 * toggles plus a comparison criterion. The criteria mirror Scryfall's own
 * Advanced Search dropdown ("Exactly" / "Including" / "At most") rather
 * than exposing raw comparison symbols the way Mana Value etc. do — colors
 * aren't ordered, so "less than" / "greater than" don't read as anything
 * meaningful to a user the way they do for a number.
 */
export function createColorClause(config: ColorClauseConfig): QueryClause<ColorClauseValue> {
  const fragmentPrefix = new RegExp(`^${config.operator}(:|=|<=|>=|<|>)(.+)$`, 'i')

  return {
    id: config.id,
    label: config.label,
    description: config.description,
    category: config.category,
    icon: config.icon,
    operator: config.operator,
    inputType: 'color-operator-multiselect',
    options: COLOR_OPTIONS.map((c) => ({ value: c.code, label: c.label })),
    defaultValue: { colors: [], operator: '=' },
    toQuery: (value) => {
      if (!value.colors.length) return ''
      const operand = value.colors.includes('C') ? 'c' : sortColors(value.colors).join('')
      return `${config.operator}${value.operator}${operand}`
    },
    fromQuery: (fragment) => {
      const match = fragmentPrefix.exec(fragment)
      if (!match) return null
      const [, symbol, operand] = match
      const operator = normalizeOperator(symbol)
      if (!operator) return null
      if (operand.toLowerCase() === 'c') {
        return { colors: ['C'], operator }
      }
      const codes = operand.toUpperCase().split('')
      const valid = codes.length > 0 && codes.every((c) => WUBRG_ORDER.includes(c as ColorCode))
      if (!valid) return null
      return { colors: codes, operator }
    },
    metadata: config.metadata,
  }
}
