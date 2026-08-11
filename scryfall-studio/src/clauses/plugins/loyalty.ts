import { Crown } from 'lucide-react'
import { createOperatorNumberClause } from '../factories/operatorNumberClause'

export const loyaltyClause = createOperatorNumberClause({
  id: 'loyalty',
  label: 'Loyalty',
  description: "Filter by a planeswalker's starting loyalty.",
  category: 'Type & Stats',
  icon: Crown,
  operator: 'loyalty',
  metadata: {
    examples: ['loyalty>=5', 'loyalty=3'],
    docsUrl: 'https://scryfall.com/docs/syntax#numbers',
  },
})
