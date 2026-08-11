import { ensureArtTagsLoaded, searchArtTags } from '@/services/artTags/ArtTagService'
import { ensureOracleTagsLoaded, searchOracleTags } from '@/services/oracleTags/OracleTagService'
import { ensureSetsLoaded, searchSets } from '@/services/sets/SetService'
import {
  ensureTypeCatalogLoaded,
  getKnownTypeNames,
  isTypeCatalogLoaded,
} from '@/services/scryfall/typeCatalog'

export interface ValueSuggestion {
  /** Raw value to insert after the operator's colon — never needs quoting, none of these contain spaces. */
  value: string
  /** Human-readable label, when it differs from `value` (e.g. a tag's full name vs. its slug). */
  label: string
}

type ValueSuggester = (partial: string) => Promise<ValueSuggestion[]>

async function suggestTypes(partial: string): Promise<ValueSuggestion[]> {
  // Kicks off the full catalog fetch in the background (idempotent, safe
  // to call repeatedly) but doesn't block on it — the small fallback set
  // already covers the most commonly typed types, so the first keystroke
  // gets an instant answer instead of waiting on 9 network requests; once
  // the catalog lands, the next keystroke's call sees the full list.
  if (!isTypeCatalogLoaded()) void ensureTypeCatalogLoaded()
  const p = partial.toLowerCase()
  const seen = new Set<string>()
  const results: ValueSuggestion[] = []
  for (const type of getKnownTypeNames()) {
    const lower = type.toLowerCase()
    if (!lower.startsWith(p) || seen.has(lower)) continue
    seen.add(lower)
    results.push({ value: lower, label: type })
  }
  return results.slice(0, 8)
}

async function suggestSets(partial: string): Promise<ValueSuggestion[]> {
  await ensureSetsLoaded().catch(() => {})
  return searchSets(partial, 'alphabetical', 8).map((s) => ({
    value: s.code,
    label: `${s.name} (${s.code.toUpperCase()})`,
  }))
}

async function suggestOracleTagValues(partial: string): Promise<ValueSuggestion[]> {
  await ensureOracleTagsLoaded().catch(() => {})
  return searchOracleTags(partial, 8).map((t) => ({ value: t.slug, label: t.label }))
}

async function suggestArtTagValues(partial: string): Promise<ValueSuggestion[]> {
  await ensureArtTagsLoaded().catch(() => {})
  return searchArtTags(partial, 8).map((t) => ({ value: t.slug, label: t.label }))
}

// Only operators with an existing, ready-made value dataset get suggestions
// — free-text (Oracle Text…) and numeric (Power…) operators have nothing
// meaningful to offer, so they're deliberately absent here.
const SUGGESTERS: Record<string, ValueSuggester> = {
  t: suggestTypes,
  type: suggestTypes,
  s: suggestSets,
  set: suggestSets,
  otag: suggestOracleTagValues,
  atag: suggestArtTagValues,
}

export function getValueSuggester(operator: string): ValueSuggester | null {
  return SUGGESTERS[operator.toLowerCase()] ?? null
}
