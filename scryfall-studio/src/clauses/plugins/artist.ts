import { Paintbrush } from 'lucide-react'
import { formatTextOperand } from '@/lib/textOperand'
import type { QueryClause } from '../types'

export const artistClause: QueryClause<string> = {
  id: 'artist',
  label: 'Artist',
  description: 'Match cards illustrated by a specific artist.',
  category: 'Flavor',
  icon: Paintbrush,
  operator: 'a',
  inputType: 'text',
  defaultValue: '',
  toQuery: (value) => (value.trim() ? `a:${formatTextOperand(value)}` : ''),
  fromQuery: (fragment) => {
    if (!fragment.toLowerCase().startsWith('a:')) return null
    const operand = fragment.slice('a:'.length)
    const isQuoted = operand.length >= 2 && operand.startsWith('"') && operand.endsWith('"')
    const unquoted = isQuoted ? operand.slice(1, -1) : operand
    return unquoted || null
  },
  metadata: {
    keywords: ['illustrator', 'artwork'],
    examples: ['a:"rebecca guay"'],
    placeholder: 'e.g. Rebecca Guay',
    docsUrl: 'https://scryfall.com/docs/syntax#flavor',
  },
}
