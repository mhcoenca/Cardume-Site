import { Gem } from 'lucide-react'
import type { QueryClause } from '../types'

export const manaCostClause: QueryClause<string> = {
  id: 'mana-cost',
  label: 'Mana Cost',
  description: 'Match cards with a specific mana cost.',
  category: 'Mana',
  icon: Gem,
  operator: 'mana',
  inputType: 'text',
  defaultValue: '',
  toQuery: (value) => (value.trim() ? `mana:${value.trim()}` : ''),
  fromQuery: (fragment) => {
    if (!fragment.toLowerCase().startsWith('mana:')) return null
    const operand = fragment.slice('mana:'.length)
    return operand || null
  },
  metadata: {
    keywords: ['cost', 'mana symbols'],
    examples: ['mana:{G}{G}', 'mana:{2}{U}'],
    placeholder: 'e.g. {G}{G}',
    docsUrl: 'https://scryfall.com/docs/syntax#mana',
  },
}
