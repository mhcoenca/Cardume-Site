import { Crown } from 'lucide-react'
import type { QueryClause } from '../types'

export const commanderLegalClause: QueryClause<boolean> = {
  id: 'commander-legal',
  label: 'Commander Legal',
  description: 'Only show cards legal in Commander.',
  category: 'Commander',
  icon: Crown,
  operator: 'f',
  inputType: 'checkbox',
  defaultValue: false,
  toQuery: (value) => (value ? 'f:commander' : ''),
  fromQuery: (fragment) => (fragment.toLowerCase() === 'f:commander' ? true : null),
  metadata: {
    keywords: ['legal', 'edh', 'format'],
    examples: ['f:commander'],
    placeholder: 'Legal in Commander',
    docsUrl: 'https://scryfall.com/docs/syntax#format',
  },
}
