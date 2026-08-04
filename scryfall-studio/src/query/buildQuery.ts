import { getQueryClause } from '@/clauses/registry'
import type { QueryClauseInstance } from './types'

export function buildQuery(instances: QueryClauseInstance[]): string {
  return instances
    .map((instance) => getQueryClause(instance.clauseId)?.toQuery(instance.value) ?? '')
    .filter(Boolean)
    .join(' ')
}
