import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface TypeCategoryRowProps {
  label: string
  /** This category's full type list — empty while still loading. */
  types: string[]
  loading: boolean
  /** The clause's full selected-types array, spanning every open category. */
  value: string[]
  onChange: (value: string[]) => void
  /** The clause's full negated-types array, spanning every open category. */
  negated: string[]
  onToggleNegate: (type: string) => void
}

export function TypeCategoryRow({
  label,
  types,
  loading,
  value,
  onChange,
  negated,
  onToggleNegate,
}: TypeCategoryRowProps) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const selected = value.filter((v) => types.some((t) => t.toLowerCase() === v.toLowerCase()))
  const filtered = search.trim()
    ? types.filter((t) => t.toLowerCase().includes(search.trim().toLowerCase()))
    : types

  function toggle(type: string) {
    const exists = value.some((v) => v.toLowerCase() === type.toLowerCase())
    onChange(
      exists ? value.filter((v) => v.toLowerCase() !== type.toLowerCase()) : [...value, type],
    )
  }

  return (
    <div className="rounded-md border border-border p-3">
      <p className="mb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>

      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selected.map((type) => {
            const isNegated = negated.includes(type)
            return (
              <span
                key={type}
                className="flex items-center gap-1 rounded-md border border-primary bg-primary py-1 pr-2 pl-1 text-xs font-medium text-primary-foreground"
              >
                <button
                  type="button"
                  onClick={() => onToggleNegate(type)}
                  title={isNegated ? 'Excluding — click to include' : 'Including — click to exclude'}
                  className={cn(
                    'rounded px-1.5 py-0.5 text-[10px] font-semibold',
                    isNegated ? 'bg-destructive text-white' : 'bg-primary-foreground/20',
                  )}
                >
                  {isNegated ? 'NOT' : 'IS'}
                </button>
                {type}
                <button
                  type="button"
                  onClick={() => toggle(type)}
                  aria-label={`Remove ${type}`}
                  className="opacity-80 hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )
          })}
        </div>
      )}

      <div className="relative">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            placeholder={`Search ${label.toLowerCase()}…`}
            className="pl-8"
          />
        </div>

        {open && (
          <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md">
            {loading ? (
              <p className="p-3 text-xs text-muted-foreground">Loading…</p>
            ) : filtered.length ? (
              filtered.map((type) => {
                const isSelected = selected.includes(type)
                return (
                  <button
                    key={type}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => toggle(type)}
                    aria-pressed={isSelected}
                    className="flex w-full items-center justify-between px-3 py-1.5 text-left text-sm hover:bg-accent"
                  >
                    <span className="text-foreground">{type}</span>
                    {isSelected && <span className="text-xs text-primary">Selected</span>}
                  </button>
                )
              })
            ) : (
              <p className="p-3 text-xs text-muted-foreground">No matches.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
