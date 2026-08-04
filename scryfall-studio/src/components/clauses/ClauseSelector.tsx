import type { AnyQueryClause } from '@/clauses/types'

interface ClauseSelectorProps {
  clause: AnyQueryClause
  onSelect: (clauseId: string) => void
}

export function ClauseSelector({ clause, onSelect }: ClauseSelectorProps) {
  const Icon = clause.icon

  return (
    <button
      type="button"
      onClick={() => onSelect(clause.id)}
      className="flex w-full items-start gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-accent"
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="flex flex-col">
        <span className="text-sm font-medium text-foreground">{clause.label}</span>
        <span className="text-xs text-muted-foreground">{clause.description}</span>
      </span>
    </button>
  )
}
