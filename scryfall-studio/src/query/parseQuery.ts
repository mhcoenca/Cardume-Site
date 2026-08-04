import { listQueryClauses } from '@/clauses/registry'
import { tokenizeQuery } from './tokenizeQuery'
import type { QueryClauseInstance } from './types'

export interface ParsedQuery {
  instances: QueryClauseInstance[]
  /** Tokens no registered clause recognized, rejoined — stays opaque, same as today. */
  residual: string
}

/**
 * Tries every registered clause's `fromQuery` against each token of a raw
 * query string. Driven entirely by the registry — this function has no
 * knowledge of what clauses exist. A token recognized by more than one
 * clause is claimed by whichever registered first.
 */
export function parseQuery(query: string): ParsedQuery {
  const clauses = listQueryClauses()
  const instances: QueryClauseInstance[] = []
  const residualTokens: string[] = []

  for (const token of tokenizeQuery(query)) {
    let matched = false
    for (const clause of clauses) {
      if (!clause.fromQuery) continue
      const value = clause.fromQuery(token)
      if (value === null || value === undefined) continue
      instances.push({ instanceId: crypto.randomUUID(), clauseId: clause.id, value })
      matched = true
      break
    }
    if (!matched) residualTokens.push(token)
  }

  return { instances, residual: residualTokens.join(' ') }
}
