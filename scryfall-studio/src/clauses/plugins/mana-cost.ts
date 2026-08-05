import { Gem } from 'lucide-react'
import type { QueryClause } from '../types'

export const manaCostClause: QueryClause<string> = {
  id: 'mana-cost',
  label: 'Mana Cost',
  description: 'Match cards with a specific mana cost.',
  category: 'Mana',
  icon: Gem,
  operator: 'mana',
  inputType: 'mana-cost',
  defaultValue: '',
  // `mana:` is "contains at least these symbols" (a card costing {4}{U}{B}{R}
  // would still match mana:4UB) — confirmed against the live API. This
  // filter should always be an exact match, so it's `mana=`, not `mana:`.
  toQuery: (value) => (value.trim() ? `mana=${value.trim()}` : ''),
  fromQuery: (fragment) => {
    if (!fragment.toLowerCase().startsWith('mana=')) return null
    const operand = fragment.slice('mana='.length)
    return operand || null
  },
  metadata: {
    keywords: ['cost', 'mana symbols'],
    examples: ['mana={G}{G}', 'mana={2}{U}'],
    docsUrl: 'https://scryfall.com/docs/syntax#mana',
  },
}
