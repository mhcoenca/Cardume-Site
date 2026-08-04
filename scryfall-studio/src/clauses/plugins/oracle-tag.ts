import { Tags } from 'lucide-react'
import { getOracleTagBySlug } from '@/services/oracleTags/OracleTagService'
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
  fromQuery: (fragment) => {
    if (!fragment.toLowerCase().startsWith('otag:')) return null
    const slug = fragment.slice('otag:'.length)
    if (!slug) return null
    // The dataset is lazy-loaded on first focus, so it likely isn't ready
    // yet during an import. Fall back to the slug as both id and label —
    // the real label appears once the user opens this card and the
    // dataset loads (label === slug for most tags anyway).
    const cached = getOracleTagBySlug(slug)
    return cached
      ? { id: cached.id, slug: cached.slug, label: cached.label }
      : { id: slug, slug, label: slug }
  },
  metadata: {
    keywords: ['tagger', 'functional tag', 'tagged'],
    examples: ['otag:activated-ability', 'otag:removal'],
    placeholder: 'Search Oracle Tags…',
    docsUrl: 'https://scryfall.com/docs/api/tags',
  },
}
