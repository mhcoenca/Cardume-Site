import { Quote } from 'lucide-react'
import { formatTextOperand } from '@/lib/textOperand'
import type { QueryClause } from '../types'

export const flavorTextClause: QueryClause<string> = {
  id: 'flavor-text',
  label: 'Flavor Text',
  description: "Match cards whose flavor text contains the given phrase.",
  category: 'Flavor',
  icon: Quote,
  operator: 'ft',
  inputType: 'text',
  defaultValue: '',
  toQuery: (value) => (value.trim() ? `ft:${formatTextOperand(value)}` : ''),
  fromQuery: (fragment) => {
    if (!fragment.toLowerCase().startsWith('ft:')) return null
    const operand = fragment.slice('ft:'.length)
    const isQuoted = operand.length >= 2 && operand.startsWith('"') && operand.endsWith('"')
    const unquoted = isQuoted ? operand.slice(1, -1) : operand
    return unquoted || null
  },
  metadata: {
    keywords: ['flavor', 'reminder text'],
    examples: ['ft:"last words"'],
    placeholder: 'e.g. last words',
    docsUrl: 'https://scryfall.com/docs/syntax#flavor',
  },
}
