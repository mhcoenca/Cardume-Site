import { ScrollText } from 'lucide-react'
import { extractMultiWordTokens, formatMultiWordClause } from '@/lib/textOperand'
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
  // Scryfall accepts both `o:` and the full `oracle:` as the same operator.
  // Claims every matching token anywhere in the query (not just one), so a
  // multi-word value survives a URL round-trip instead of collapsing to
  // whichever token happened to be seen last.
  fromQueryAll: (tokens) => extractMultiWordTokens(['o', 'oracle'], tokens),
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
