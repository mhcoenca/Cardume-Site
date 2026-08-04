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
  metadata: {
    keywords: ['rules text', 'card text', 'oracle'],
    examples: ['o:draw', 'o:"draw a card"'],
    placeholder: 'e.g. draw a card',
    docsUrl: 'https://scryfall.com/docs/syntax#text',
  },
}
