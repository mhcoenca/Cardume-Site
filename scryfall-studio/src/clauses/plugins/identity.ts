import { Layers } from 'lucide-react'
import { createColorClause } from '../factories/colorClause'

export const identityClause = createColorClause({
  id: 'identity',
  label: 'Color Identity',
  description: 'Filter by color identity — useful for Commander deckbuilding.',
  category: 'Colors',
  icon: Layers,
  operator: 'id',
  metadata: {
    keywords: ['commander', 'edh', 'identity'],
    examples: ['id<=bg', 'id:WUBRG'],
    docsUrl: 'https://scryfall.com/docs/syntax#colors',
  },
})
