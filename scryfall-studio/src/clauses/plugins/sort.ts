import { ArrowUpDown } from 'lucide-react'
import type { QueryClause } from '../types'

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'set', label: 'Set' },
  { value: 'released', label: 'Release Date' },
  { value: 'rarity', label: 'Rarity' },
  { value: 'color', label: 'Color' },
  { value: 'cmc', label: 'Mana Value' },
  { value: 'power', label: 'Power' },
  { value: 'toughness', label: 'Toughness' },
  { value: 'artist', label: 'Artist' },
  { value: 'edhrec', label: 'EDHREC Rank' },
  { value: 'usd', label: 'Price (USD)' },
]

export const sortClause: QueryClause<string> = {
  id: 'sort',
  label: 'Sort',
  description: 'Order results — does not affect the query, only the result URL.',
  category: 'Sort',
  icon: ArrowUpDown,
  operator: 'order',
  inputType: 'select',
  options: SORT_OPTIONS,
  defaultValue: '',
  // Never contributes to `q` — see toUrlParams.
  toQuery: () => '',
  toUrlParams: (value) => {
    const params: Record<string, string> = {}
    if (value) params.order = value
    return params
  },
  metadata: {
    keywords: ['order', 'sort by'],
    placeholder: 'Default order',
  },
}
