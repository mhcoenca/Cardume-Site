import type { LucideIcon } from 'lucide-react'
import type { QueryClause, QueryClauseMetadata } from '../types'

export type ComparisonOperator = '=' | '!=' | '<' | '<=' | '>' | '>='

/** Same criteria Scryfall's own Advanced Search "Stats" dropdown offers. */
export const COMPARISON_OPERATORS: { value: ComparisonOperator; label: string }[] = [
  { value: '=', label: 'Equal to' },
  { value: '!=', label: 'Not equal to' },
  { value: '<', label: 'Less than' },
  { value: '<=', label: 'Less than or equal to' },
  { value: '>', label: 'Greater than' },
  { value: '>=', label: 'Greater than or equal to' },
]

export interface OperatorNumberValue {
  operator: ComparisonOperator
  value: number | null
}

interface OperatorNumberClauseConfig {
  id: string
  label: string
  description: string
  category: string
  icon: LucideIcon
  /** The bare Scryfall operator, e.g. 'mv', 'pow', 'tou'. */
  operator: string
  /** Alternate operator names Scryfall accepts for the same field, e.g. 'cmc' for 'mv'. */
  aliases?: string[]
  metadata?: QueryClauseMetadata
}

/** Shared shape for numeric comparisons: Mana Value, Power, Toughness, etc. */
export function createOperatorNumberClause(
  config: OperatorNumberClauseConfig,
): QueryClause<OperatorNumberValue> {
  const operatorNames = [config.operator, ...(config.aliases ?? [])]
  const fragmentPattern = new RegExp(
    `^(?:${operatorNames.join('|')})(!=|<=|>=|=|<|>)(\\d+(?:\\.\\d+)?)$`,
    'i',
  )

  return {
    id: config.id,
    label: config.label,
    description: config.description,
    category: config.category,
    icon: config.icon,
    operator: config.operator,
    inputType: 'operator-number',
    defaultValue: { operator: '=', value: null },
    toQuery: (value) =>
      value.value === null ? '' : `${config.operator}${value.operator}${value.value}`,
    fromQuery: (fragment) => {
      const match = fragmentPattern.exec(fragment)
      if (!match) return null
      return { operator: match[1] as ComparisonOperator, value: Number(match[2]) }
    },
    metadata: config.metadata,
  }
}
