import { DollarSign } from 'lucide-react'
import type { ComparisonOperator } from '../factories/operatorNumberClause'
import type { QueryClause } from '../types'

export type PriceCurrency = 'usd' | 'eur' | 'tix'

// usd/eur/tix comparisons confirmed against api.scryfall.com/cards/search.
export const PRICE_CURRENCIES: { value: PriceCurrency; label: string }[] = [
  { value: 'usd', label: 'USD ($)' },
  { value: 'eur', label: 'EUR (€)' },
  { value: 'tix', label: 'TIX' },
]

export interface PriceValue {
  currency: PriceCurrency
  operator: ComparisonOperator
  value: number | null
}

const PATTERN = /^(usd|eur|tix)(!=|<=|>=|=|<|>)(\d+(?:\.\d+)?)$/i

export const priceClause: QueryClause<PriceValue> = {
  id: 'price',
  label: 'Price',
  description: "Filter by a card's market price in a specific currency.",
  category: 'Collecting',
  icon: DollarSign,
  operator: 'usd',
  inputType: 'price',
  defaultValue: { currency: 'usd', operator: '>=', value: null },
  toQuery: (value) =>
    value.value === null ? '' : `${value.currency}${value.operator}${value.value}`,
  fromQuery: (fragment) => {
    const match = PATTERN.exec(fragment)
    if (!match) return null
    return {
      currency: match[1].toLowerCase() as PriceCurrency,
      operator: match[2] as ComparisonOperator,
      value: Number(match[3]),
    }
  },
  metadata: {
    keywords: ['cost', 'value', 'market price', 'usd', 'eur', 'tix', 'mtgo'],
    examples: ['usd>=1', 'eur<=5', 'tix>15'],
    docsUrl: 'https://scryfall.com/docs/syntax#prices',
  },
}
