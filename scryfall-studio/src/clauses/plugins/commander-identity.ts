import { Crown } from 'lucide-react'
import { COLOR_OPTIONS, sortColors } from '@/lib/colors'
import type { QueryClause } from '../types'

export const commanderIdentityClause: QueryClause<string[]> = {
  id: 'commander-identity',
  label: 'Commander Identity',
  description: "Filter by color identity, matching your commander's deckbuilding restrictions.",
  category: 'Commander',
  icon: Crown,
  operator: 'commander',
  inputType: 'color-multiselect',
  options: COLOR_OPTIONS.map((c) => ({ value: c.code, label: c.label })),
  defaultValue: [],
  toQuery: (value) => (value.length ? `commander:${sortColors(value).join('')}` : ''),
  metadata: {
    keywords: ['color identity', 'edh', 'wubrg'],
    examples: ['commander:WRG'],
    tooltip: "Cards legal within your commander's color identity.",
    docsUrl: 'https://scryfall.com/docs/syntax#colors',
  },
}
