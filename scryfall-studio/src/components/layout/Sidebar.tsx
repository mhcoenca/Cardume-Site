import { useMemo, useState } from 'react'
import { listQueryClausesByCategory, searchQueryClauses } from '@/clauses/registry'
import type { AnyQueryClause } from '@/clauses/types'
import { ClauseSelector } from '@/components/clauses/ClauseSelector'
import { SearchBox } from '@/components/shared/SearchBox'
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel'
import { useQueryStore } from '@/store/useQueryStore'

function groupByCategory(clauses: AnyQueryClause[]): Map<string, AnyQueryClause[]> {
  const grouped = new Map<string, AnyQueryClause[]>()
  for (const clause of clauses) {
    const list = grouped.get(clause.category) ?? []
    list.push(clause)
    grouped.set(clause.category, list)
  }
  return grouped
}

export function Sidebar() {
  const [search, setSearch] = useState('')
  const { addClause } = useQueryStore()

  const grouped = useMemo(
    () => (search.trim() ? groupByCategory(searchQueryClauses(search)) : listQueryClausesByCategory()),
    [search],
  )

  return (
    <div className="flex flex-col gap-4 p-3">
      <SearchBox value={search} onChange={setSearch} placeholder="Search clauses…" />
      {Array.from(grouped.entries()).map(([category, clauses]) =>
        clauses.length ? (
          <div key={category}>
            <h3 className="px-3 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {category}
            </h3>
            <div className="flex flex-col">
              {clauses.map((clause) => (
                <ClauseSelector key={clause.id} clause={clause} onSelect={addClause} />
              ))}
            </div>
          </div>
        ) : null,
      )}

      <div className="-mx-3 mt-2 border-t border-border">
        <WorkspacePanel />
      </div>
    </div>
  )
}
