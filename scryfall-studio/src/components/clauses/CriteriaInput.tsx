import { useState, type ChangeEvent } from 'react'
import { Search, X } from 'lucide-react'
import type { CriteriaValue } from '@/clauses/plugins/criteria'
import { CRITERIA_OPTIONS } from '@/lib/criteria'
import { cn } from '@/lib/utils'
import { SegmentedToggle } from './SegmentedToggle'

interface CriteriaInputProps {
  value: CriteriaValue
  onChange: (value: CriteriaValue) => void
}

const COMBINE_MODES = [
  { value: 'and' as const, label: 'All', title: 'Match every selected criterion' },
  { value: 'or' as const, label: 'Any', title: 'Match at least one selected criterion (partial matches)' },
]

const MAX_SUGGESTIONS = 8

export function CriteriaInput({ value, onChange }: CriteriaInputProps) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const selectedValues = new Set(value.items.map((item) => item.value))
  const suggestions = search.trim()
    ? CRITERIA_OPTIONS.filter(
        (option) =>
          !selectedValues.has(option.value) &&
          (option.label.toLowerCase().includes(search.trim().toLowerCase()) ||
            option.description.toLowerCase().includes(search.trim().toLowerCase())),
      ).slice(0, MAX_SUGGESTIONS)
    : []

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value)
    setOpen(true)
  }

  function addItem(optionValue: string) {
    onChange({ ...value, items: [...value.items, { value: optionValue, negated: false }] })
    setSearch('')
    setOpen(false)
  }

  function removeItemAt(index: number) {
    onChange({ ...value, items: value.items.filter((_, i) => i !== index) })
  }

  function toggleNegatedAt(index: number) {
    onChange({
      ...value,
      items: value.items.map((item, i) => (i === index ? { ...item, negated: !item.negated } : item)),
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={handleSearchChange}
          onFocus={() => search.trim() && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search criteria, e.g. promo, foil, reprint…"
          className="h-8 w-full rounded-lg border border-input bg-transparent pl-8 pr-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />

        {open && suggestions.length > 0 && (
          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md">
            {suggestions.map((option) => (
              <button
                key={option.value}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => addItem(option.value)}
                className="flex w-full flex-col items-start gap-0.5 px-3 py-1.5 text-left hover:bg-accent"
              >
                <span className="text-sm text-foreground">{option.label}</span>
                <span className="line-clamp-1 text-xs text-muted-foreground">{option.description}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {value.items.length === 0 ? (
        <p className="text-xs text-muted-foreground">Search above to add criteria like promo, foil, or reprint.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {value.items.map((item, index) => {
            const option = CRITERIA_OPTIONS.find((o) => o.value === item.value)
            return (
              <div
                key={item.value}
                className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5"
              >
                <button
                  type="button"
                  onClick={() => toggleNegatedAt(index)}
                  title={item.negated ? 'Excluding — click to include' : 'Including — click to exclude'}
                  className={cn(
                    'shrink-0 rounded px-2 py-0.5 text-[11px] font-semibold transition-colors',
                    item.negated
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-primary/10 text-primary',
                  )}
                >
                  {item.negated ? 'NOT' : 'IS'}
                </button>
                <span className="flex-1 text-sm text-foreground">{option?.label ?? item.value}</span>
                <button
                  type="button"
                  onClick={() => removeItemAt(index)}
                  aria-label={`Remove ${option?.label ?? item.value}`}
                  className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {value.items.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Match</span>
          <SegmentedToggle
            options={COMBINE_MODES}
            value={value.combineMode}
            onChange={(combineMode) => onChange({ ...value, combineMode })}
          />
        </div>
      )}
    </div>
  )
}
