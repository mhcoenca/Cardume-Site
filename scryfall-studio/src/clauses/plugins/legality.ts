import { ShieldCheck } from 'lucide-react'
import type { QueryClause } from '../types'

const FORMATS = [
  'standard',
  'pioneer',
  'modern',
  'legacy',
  'vintage',
  'commander',
  'pauper',
  'brawl',
  'historic',
  'alchemy',
  'penny',
  'duel',
  'oldschool',
  'premodern',
]

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export const legalityClause: QueryClause<string> = {
  id: 'legality',
  label: 'Legality',
  description: 'Restrict results to cards legal in a specific format.',
  category: 'Formats',
  icon: ShieldCheck,
  operator: 'legal',
  inputType: 'select',
  options: FORMATS.map((format) => ({ value: format, label: capitalize(format) })),
  defaultValue: FORMATS[0],
  toQuery: (value) => (value ? `legal:${value}` : ''),
  metadata: {
    keywords: ['format', 'banned', 'restricted', 'tournament'],
    examples: ['legal:commander'],
    docsUrl: 'https://scryfall.com/docs/syntax#format',
  },
}
