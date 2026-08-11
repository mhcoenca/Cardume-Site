import { Package } from 'lucide-react'
import { formatTextOperand } from '@/lib/textOperand'
import type { QueryClause } from '../types'

// s: accepts either a set code (woe) or a full set name ("Wilds of
// Eldraine") — both verified against api.scryfall.com/cards/search.
export const setClause: QueryClause<string> = {
  id: 'set',
  label: 'Set',
  description: "Match cards from a specific set, by code or name.",
  category: 'Collecting',
  icon: Package,
  operator: 's',
  inputType: 'set',
  defaultValue: '',
  toQuery: (value) => (value.trim() ? `s:${formatTextOperand(value)}` : ''),
  fromQuery: (fragment) => {
    if (!fragment.toLowerCase().startsWith('s:')) return null
    const operand = fragment.slice('s:'.length)
    const isQuoted = operand.length >= 2 && operand.startsWith('"') && operand.endsWith('"')
    const unquoted = isQuoted ? operand.slice(1, -1) : operand
    return unquoted || null
  },
  metadata: {
    keywords: ['edition', 'expansion', 'block'],
    examples: ['s:woe', 's:"Wilds of Eldraine"'],
    placeholder: 'e.g. woe or Wilds of Eldraine',
    docsUrl: 'https://scryfall.com/docs/syntax#sets',
  },
}
