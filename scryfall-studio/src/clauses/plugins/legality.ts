import { ShieldCheck } from 'lucide-react'
import type { QueryClause } from '../types'

export type LegalityStatus = 'legal' | 'not_legal' | 'restricted' | 'banned'

export const LEGALITY_STATUSES: { value: LegalityStatus; label: string }[] = [
  { value: 'legal', label: 'Legal' },
  { value: 'not_legal', label: 'Not Legal' },
  { value: 'restricted', label: 'Restricted' },
  { value: 'banned', label: 'Banned' },
]

export interface LegalityValue {
  status: LegalityStatus
  format: string
}

// Every format key Scryfall's own card `legalities` object actually uses.
const FORMAT_LABELS: Record<string, string> = {
  standard: 'Standard',
  future: 'Future Standard',
  historic: 'Historic',
  timeless: 'Timeless',
  gladiator: 'Gladiator',
  pioneer: 'Pioneer',
  modern: 'Modern',
  legacy: 'Legacy',
  pauper: 'Pauper',
  vintage: 'Vintage',
  penny: 'Penny Dreadful',
  commander: 'Commander',
  oathbreaker: 'Oathbreaker',
  standardbrawl: 'Standard Brawl',
  brawl: 'Brawl',
  competitivebrawl: 'Competitive Brawl',
  alchemy: 'Alchemy',
  paupercommander: 'Pauper Commander',
  duel: 'Duel Commander',
  oldschool: 'Old School 93/94',
  premodern: 'Premodern',
  predh: 'PreDH',
  tlr: 'TLR',
}

export const FORMAT_OPTIONS = Object.entries(FORMAT_LABELS).map(([value, label]) => ({
  value,
  label,
}))

// legal:X / banned:X / restricted:X, or -legal:X for "not legal" — Scryfall
// has no dedicated "not legal" operator, it's the negation of `legal:`.
const PATTERN = /^(-?)(legal|banned|restricted):(\w+)$/i

export const legalityClause: QueryClause<LegalityValue> = {
  id: 'legality',
  label: 'Legality',
  description: "Filter by a card's legal status in a specific format.",
  category: 'Collecting',
  icon: ShieldCheck,
  operator: 'legal',
  inputType: 'legality',
  defaultValue: { status: 'legal', format: 'commander' },
  toQuery: (value) => {
    if (!value.format) return ''
    const prefix = value.status === 'not_legal' ? '-legal' : value.status
    return `${prefix}:${value.format}`
  },
  fromQuery: (fragment) => {
    const match = PATTERN.exec(fragment)
    if (!match) return null
    const [, negation, statusWord, format] = match
    const lowerFormat = format.toLowerCase()
    if (!(lowerFormat in FORMAT_LABELS)) return null

    if (negation) {
      return statusWord.toLowerCase() === 'legal'
        ? { status: 'not_legal', format: lowerFormat }
        : null
    }
    return { status: statusWord.toLowerCase() as LegalityStatus, format: lowerFormat }
  },
  metadata: {
    keywords: ['format', 'banned', 'restricted', 'tournament', 'legal'],
    examples: ['legal:commander', 'banned:standard', '-legal:modern'],
    docsUrl: 'https://scryfall.com/docs/syntax#format',
  },
}
