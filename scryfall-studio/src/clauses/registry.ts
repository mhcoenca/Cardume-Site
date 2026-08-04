import type { AnyQueryClause } from './types'

const clauses = new Map<string, AnyQueryClause>()
const categoryOrder: string[] = []

export function registerQueryClause(clause: AnyQueryClause): void {
  if (clauses.has(clause.id)) {
    throw new Error(`QueryClause with id "${clause.id}" is already registered.`)
  }
  clauses.set(clause.id, clause)
  if (!categoryOrder.includes(clause.category)) {
    categoryOrder.push(clause.category)
  }
}

export function getQueryClause(id: string): AnyQueryClause | undefined {
  return clauses.get(id)
}

export function listQueryClauses(): AnyQueryClause[] {
  return Array.from(clauses.values())
}

export function listCategories(): string[] {
  return [...categoryOrder]
}

export function listQueryClausesByCategory(): Map<string, AnyQueryClause[]> {
  const grouped = new Map<string, AnyQueryClause[]>()
  for (const category of categoryOrder) grouped.set(category, [])
  for (const clause of clauses.values()) {
    grouped.get(clause.category)?.push(clause)
  }
  return grouped
}

export function searchQueryClauses(term: string): AnyQueryClause[] {
  const query = term.trim().toLowerCase()
  if (!query) return listQueryClauses()

  return listQueryClauses().filter((clause) => {
    const haystack = [
      clause.label,
      clause.description,
      clause.operator,
      ...(clause.metadata?.keywords ?? []),
      ...(clause.metadata?.aliases ?? []),
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(query)
  })
}
