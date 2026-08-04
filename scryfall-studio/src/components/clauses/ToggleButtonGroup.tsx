import { cn } from '@/lib/utils'
import type { QueryClauseOption } from '@/clauses/types'

interface ToggleButtonGroupProps {
  options: QueryClauseOption[]
  selected: string[]
  onToggle: (value: string) => void
}

export function ToggleButtonGroup({ options, selected, onToggle }: ToggleButtonGroupProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option.value)
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onToggle(option.value)}
            className={cn(
              'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
              isSelected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-transparent text-foreground hover:bg-accent',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
