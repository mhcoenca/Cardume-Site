import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AnyQueryClause } from '@/clauses/types'

interface ClauseSelectorProps {
  clause: AnyQueryClause
  onSelect: (clauseId: string) => void
  added?: boolean
}

export function ClauseSelector({ clause, onSelect, added = false }: ClauseSelectorProps) {
  const Icon = clause.icon

  return (
    <button
      type="button"
      disabled={added}
      onClick={() => onSelect(clause.id)}
      className={cn(
        'flex w-full items-start gap-3 rounded-md px-3 py-2 text-left transition-colors',
        added ? 'cursor-default opacity-50' : 'hover:bg-accent',
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="flex flex-1 flex-col">
        <span className="text-sm font-medium text-foreground">{clause.label}</span>
        <span className="text-xs text-muted-foreground">{clause.description}</span>
      </span>
      {added && <Check className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}
    </button>
  )
}
