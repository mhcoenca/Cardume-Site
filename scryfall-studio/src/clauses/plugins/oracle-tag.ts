import { Tags } from 'lucide-react'
import type { OracleTagValue } from '@/services/oracleTags/types'
import type { QueryClause } from '../types'

export const oracleTagClause: QueryClause<OracleTagValue | null> = {
  id: 'oracle-tag',
  label: 'Oracle Tag',
  description: 'Match cards tagged with a community-curated functional tag.',
  category: 'Oracle Tags',
  icon: Tags,
  operator: 'otag',
  inputType: 'oracle-tag',
  defaultValue: null,
  toQuery: (value) => (value ? `otag:${value.slug}` : ''),
  metadata: {
    keywords: ['tagger', 'functional tag', 'tagged'],
    examples: ['otag:activated-ability', 'otag:removal'],
    placeholder: 'Search Oracle Tags…',
    docsUrl: 'https://scryfall.com/docs/api/tags',
  },
}
