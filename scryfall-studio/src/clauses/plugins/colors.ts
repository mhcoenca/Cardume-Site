import { Palette } from 'lucide-react'
import { createColorClause } from '../factories/colorClause'

export const colorsClause = createColorClause({
  id: 'colors',
  label: 'Colors',
  description: "Filter by the card's own color.",
  category: 'Colors',
  icon: Palette,
  operator: 'c',
  metadata: {
    keywords: ['color', 'wubrg'],
    examples: ['c:WU', 'c<=WU', 'c:c'],
    docsUrl: 'https://scryfall.com/docs/syntax#colors',
  },
})
