import { getQueryClause } from '@/clauses/registry'
import type { QueryClauseInstance } from './types'

/** Collects URL params contributed by clauses like Sort/Display (see toUrlParams). */
export function buildUrlParams(instances: QueryClauseInstance[]): Record<string, string> {
  const params: Record<string, string> = {}
  for (const instance of instances) {
    const clause = getQueryClause(instance.clauseId)
    if (!clause?.toUrlParams) continue
    Object.assign(params, clause.toUrlParams(instance.value))
  }
  return params
}
