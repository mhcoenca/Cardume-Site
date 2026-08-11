import { listQueryClauses } from '@/clauses/registry'

export interface OperatorSuggestion {
  /** The bare operator name, without its trailing colon (e.g. `t`, `type`). */
  operator: string
  /** The clause this operator belongs to, for a human-readable hint. */
  label: string
}

let cache: OperatorSuggestion[] | null = null

/**
 * Every operator name (canonical + aliases) any registered clause accepts,
 * flattened to one entry per name — built once and cached, since the
 * registry only changes at module load (clause plugins register
 * themselves once, on import).
 */
function allOperators(): OperatorSuggestion[] {
  if (cache) return cache
  const seen = new Set<string>()
  const list: OperatorSuggestion[] = []
  for (const clause of listQueryClauses()) {
    for (const operator of [clause.operator, ...(clause.metadata?.aliases ?? [])]) {
      const key = operator.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      list.push({ operator, label: clause.label })
    }
  }
  cache = list
  return list
}

/** Operator names starting with `prefix` (case-insensitive), shortest first. */
export function suggestOperators(prefix: string, limit = 8): OperatorSuggestion[] {
  const p = prefix.toLowerCase()
  if (!p) return []
  return allOperators()
    .filter((o) => o.operator.toLowerCase().startsWith(p))
    .sort((a, b) => a.operator.length - b.operator.length || a.operator.localeCompare(b.operator))
    .slice(0, limit)
}
