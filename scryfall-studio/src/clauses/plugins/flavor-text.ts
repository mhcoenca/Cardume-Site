import { Quote } from 'lucide-react'
import { extractMultiWordTokens, formatMultiWordClause } from '@/lib/textOperand'
import type { QueryClause } from '../types'

export const flavorTextClause: QueryClause<string> = {
  id: 'flavor-text',
  label: 'Flavor Text',
  description: "Match cards whose flavor text contains the given words or phrase.",
  category: 'Flavor',
  icon: Quote,
  operator: 'ft',
  inputType: 'text',
  defaultValue: '',
  toQuery: (value) => (value.trim() ? formatMultiWordClause('ft', value) : ''),
  // `ft:` and `flavor:` are the same operator (confirmed against the search
  // API). Claims every matching token anywhere in the query, so a multi-word
  // value survives a URL round-trip instead of collapsing to one word.
  fromQueryAll: (tokens) => extractMultiWordTokens(['ft', 'flavor'], tokens),
  metadata: {
    keywords: ['flavor', 'reminder text'],
    examples: ['ft:"last words"'],
    placeholder: 'e.g. last words',
    docsUrl: 'https://scryfall.com/docs/syntax#flavor',
  },
}
