import { Swords } from 'lucide-react'
import { createOperatorNumberClause } from '../factories/operatorNumberClause'

export const powerClause = createOperatorNumberClause({
  id: 'power',
  label: 'Power',
  description: "Filter by a creature's power.",
  category: 'Type & Stats',
  icon: Swords,
  operator: 'pow',
  metadata: {
    examples: ['pow>=4', 'pow=2'],
    docsUrl: 'https://scryfall.com/docs/syntax#numbers',
  },
})
