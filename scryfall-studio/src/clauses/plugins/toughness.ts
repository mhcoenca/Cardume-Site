import { Shield } from 'lucide-react'
import { createOperatorNumberClause } from '../factories/operatorNumberClause'

export const toughnessClause = createOperatorNumberClause({
  id: 'toughness',
  label: 'Toughness',
  description: "Filter by a creature's toughness.",
  category: 'Type & Stats',
  icon: Shield,
  operator: 'tou',
  metadata: {
    examples: ['tou>=4', 'tou=2'],
    docsUrl: 'https://scryfall.com/docs/syntax#numbers',
  },
})
