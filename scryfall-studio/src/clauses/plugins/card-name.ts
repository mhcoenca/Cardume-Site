import { Search } from 'lucide-react'
import { formatTextOperand } from '@/lib/textOperand'
import type { QueryClause } from '../types'

export const cardNameClause: QueryClause<string> = {
  id: 'card-name',
  label: 'Card Name',
  description: 'Search for a card by its name.',
  category: 'Oracle',
  icon: Search,
  operator: 'name',
  inputType: 'text',
  defaultValue: '',
  pinned: true,
  toQuery: (value) => (value.trim() ? `name:${formatTextOperand(value)}` : ''),
  fromQuery: (fragment) => {
    if (!fragment.toLowerCase().startsWith('name:')) return null
    const operand = fragment.slice('name:'.length)
    const isQuoted = operand.length >= 2 && operand.startsWith('"') && operand.endsWith('"')
    const unquoted = isQuoted ? operand.slice(1, -1) : operand
    return unquoted || null
  },
  metadata: {
    keywords: ['name', 'title'],
    examples: ['name:Bolt', 'name:"Black Lotus"'],
    placeholder: 'e.g. Black Lotus',
    docsUrl: 'https://scryfall.com/docs/syntax#name',
  },
}
