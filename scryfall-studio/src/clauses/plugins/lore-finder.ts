import { BookOpen } from 'lucide-react'
import { formatMultiWordClause } from '@/lib/textOperand'
import type { QueryClause } from '../types'

// lore: isn't in the main syntax reference (scryfall.com/docs/syntax) but is
// a real operator backing the "Lore Finder™" field on scryfall.com/advanced.
// Confirmed live: lore:jhoira matches cards that merely mention "Jhoira" in
// their name, type line, oracle text, or flavor text — not just cards named
// Jhoira — exactly matching Scryfall's own description of the field.
export const loreFinderClause: QueryClause<string> = {
  id: 'lore-finder',
  label: 'Lore Finder',
  description:
    'Search every part of a card — name, type, oracle text, and flavor text — for a word. Great for finding cards that mention a character or creature type.',
  category: 'Flavor',
  icon: BookOpen,
  operator: 'lore',
  inputType: 'text',
  defaultValue: '',
  toQuery: (value) => (value.trim() ? formatMultiWordClause('lore', value) : ''),
  fromQuery: (fragment) => {
    if (!fragment.toLowerCase().startsWith('lore:')) return null
    const operand = fragment.slice('lore:'.length)
    const isQuoted = operand.length >= 2 && operand.startsWith('"') && operand.endsWith('"')
    const unquoted = isQuoted ? operand.slice(1, -1) : operand
    return unquoted || null
  },
  metadata: {
    keywords: ['character', 'creature type', 'mentions', 'full text', 'name search'],
    examples: ['lore:jhoira', 'lore:goblin'],
    placeholder: 'e.g. Jhoira',
    docsUrl: 'https://scryfall.com/advanced',
  },
}
