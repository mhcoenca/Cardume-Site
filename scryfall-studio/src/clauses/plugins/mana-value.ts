import { Gauge } from 'lucide-react'
import { createOperatorNumberClause } from '../factories/operatorNumberClause'

export const manaValueClause = createOperatorNumberClause({
  id: 'mana-value',
  label: 'Mana Value',
  description: 'Filter by converted mana cost / mana value.',
  category: 'Mana',
  icon: Gauge,
  operator: 'mv',
  metadata: {
    keywords: ['cmc', 'converted mana cost', 'cost'],
    examples: ['mv<=3', 'mv=5'],
    docsUrl: 'https://scryfall.com/docs/syntax#numbers',
  },
})
