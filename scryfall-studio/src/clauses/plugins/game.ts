import { Gamepad2 } from 'lucide-react'
import type { QueryClause } from '../types'

const GAMES = [
  { value: 'paper', label: 'Paper' },
  { value: 'arena', label: 'Arena' },
  { value: 'mtgo', label: 'Magic Online' },
]

export const gameClause: QueryClause<string> = {
  id: 'game',
  label: 'Game',
  description: 'Restrict results to cards available in a specific game.',
  category: 'Games',
  icon: Gamepad2,
  operator: 'game',
  inputType: 'select',
  options: GAMES,
  defaultValue: GAMES[0].value,
  toQuery: (value) => (value ? `game:${value}` : ''),
  metadata: {
    keywords: ['paper', 'arena', 'mtgo', 'digital'],
    examples: ['game:arena'],
    docsUrl: 'https://scryfall.com/docs/syntax#game',
  },
}
