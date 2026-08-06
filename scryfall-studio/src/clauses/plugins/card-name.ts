import { Search } from 'lucide-react'
import { formatTextOperand } from '@/lib/textOperand'
import type { QueryClause } from '../types'

export interface CardNameValue {
  name: string
  /** Excludes Arena/Alchemy-only digital cards (-is:digital) — on by default. */
  printedOnly: boolean
}

const DEFAULT_VALUE: CardNameValue = { name: '', printedOnly: true }

export const cardNameClause: QueryClause<CardNameValue> = {
  id: 'card-name',
  label: 'Card Name',
  description: 'Search for a card by its name.',
  category: 'Oracle',
  icon: Search,
  operator: 'name',
  inputType: 'card-name',
  defaultValue: DEFAULT_VALUE,
  pinned: true,
  toQuery: (value) => {
    if (!value.name.trim()) return ''
    const nameToken = `name:${formatTextOperand(value.name)}`
    return value.printedOnly ? `${nameToken} -is:digital` : nameToken
  },
  // Only reconstructs the name: token on import — printedOnly can't be
  // recovered from a single token the way toQuery emits it (a separate
  // -is:digital token, which the token-at-a-time import parser would hand
  // to Criteria instead, same class of limitation as every other
  // multi-token clause in this app), so it defaults to true either way,
  // matching the clause's own default.
  fromQuery: (fragment) => {
    if (!fragment.toLowerCase().startsWith('name:')) return null
    const operand = fragment.slice('name:'.length)
    const isQuoted = operand.length >= 2 && operand.startsWith('"') && operand.endsWith('"')
    const unquoted = isQuoted ? operand.slice(1, -1) : operand
    return unquoted ? { name: unquoted, printedOnly: true } : null
  },
  metadata: {
    keywords: ['name', 'title'],
    examples: ['name:Bolt', 'name:"Black Lotus" -is:digital'],
    placeholder: 'e.g. Black Lotus',
    docsUrl: 'https://scryfall.com/docs/syntax#name',
  },
}
