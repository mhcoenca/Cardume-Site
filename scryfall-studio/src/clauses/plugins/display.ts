import { LayoutGrid } from 'lucide-react'
import type { QueryClause } from '../types'

const DISPLAY_OPTIONS = [
  { value: 'grid', label: 'Grid' },
  { value: 'list', label: 'List' },
  { value: 'checklist', label: 'Checklist' },
]

export const displayClause: QueryClause<string> = {
  id: 'display',
  label: 'Display',
  description: 'How results are laid out — does not affect the query, only the result URL.',
  category: 'Preferences',
  icon: LayoutGrid,
  operator: 'as',
  inputType: 'select',
  options: DISPLAY_OPTIONS,
  defaultValue: '',
  // Never contributes to `q` — see toUrlParams.
  toQuery: () => '',
  toUrlParams: (value) => {
    const params: Record<string, string> = {}
    if (value) params.as = value
    return params
  },
  metadata: {
    keywords: ['layout', 'view'],
    placeholder: 'Default layout',
  },
}
