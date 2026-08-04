import { ScrollText } from 'lucide-react'
import { formatTextOperand } from '@/lib/textOperand'
import type { QueryClause } from '../types'

export const oracleTextClause: QueryClause<string> = {
  id: 'oracle-text',
  label: 'Oracle Text',
  description: 'Match cards whose rules text contains the given phrase.',
  category: 'Oracle Text',
  icon: ScrollText,
  operator: 'o',
  inputType: 'text',
  defaultValue: '',
  toQuery: (value) => (value.trim() ? `o:${formatTextOperand(value)}` : ''),
  fromQuery: (fragment) => {
    if (!fragment.toLowerCase().startsWith('o:')) return null
    const operand = fragment.slice('o:'.length)
    const isQuoted = operand.length >= 2 && operand.startsWith('"') && operand.endsWith('"')
    const unquoted = isQuoted ? operand.slice(1, -1) : operand
    return unquoted || null
  },
  metadata: {
    keywords: ['rules text', 'card text', 'oracle'],
    examples: ['o:draw', 'o:"draw a card"'],
    placeholder: 'e.g. draw a card',
    docsUrl: 'https://scryfall.com/docs/syntax#text',
  },
}
