import { ScrollText } from 'lucide-react'
import { formatMultiWordClause } from '@/lib/textOperand'
import type { QueryClause } from '../types'

export const oracleTextClause: QueryClause<string> = {
  id: 'oracle-text',
  label: 'Oracle Text',
  description: 'Match cards whose rules text contains the given words or phrase.',
  category: 'Oracle',
  icon: ScrollText,
  operator: 'o',
  inputType: 'text',
  defaultValue: '',
  toQuery: (value) => (value.trim() ? formatMultiWordClause('o', value) : ''),
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
    // Sourced verbatim from scryfall.com/docs/syntax#oracle and the "Word
    // order doesn't matter" tip on scryfall.com/advanced.
    helpText: [
      'Matches cards whose rules text contains the words or phrase you enter — this checks the current Oracle wording, so "dies" will find cards, not the old "is put into a graveyard" phrasing.',
      "Multiple words are ANDed together — word order doesn't matter. Wrap a phrase in quotes for an exact match instead, e.g. \"draw a card\".",
      "Use ~ as a placeholder for the card's own name.",
      "Reminder text (the italicized explanations in parentheses) isn't searched by default.",
    ],
  },
}
