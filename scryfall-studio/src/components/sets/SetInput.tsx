import { useState, type ChangeEvent } from 'react'
import { Loader2, Search, X } from 'lucide-react'
import { SegmentedToggle } from '@/components/clauses/SegmentedToggle'
import { Input } from '@/components/ui/input'
import {
  browseSets,
  ensureSetsLoaded,
  getSetByCode,
  getSetsLoadError,
  searchSets,
} from '@/services/sets/SetService'
import type { ScryfallSet, SetSortOrder } from '@/services/sets/types'

interface SetInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const SORT_OPTIONS: { value: SetSortOrder; label: string; title: string }[] = [
  { value: 'alphabetical', label: 'A–Z', title: 'Sort alphabetically' },
  { value: 'newest', label: 'Newest', title: 'Sort by most recently released' },
  { value: 'oldest', label: 'Oldest', title: 'Sort by earliest released' },
]

function SetRow({ set, onSelect }: { set: ScryfallSet; onSelect: () => void }) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onSelect}
      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-accent"
    >
      <img src={set.iconSvgUri} alt="" className="h-4 w-4 shrink-0 dark:invert" />
      <span className="flex-1 truncate text-foreground">{set.name}</span>
      <span className="shrink-0 text-xs text-muted-foreground uppercase">{set.code}</span>
    </button>
  )
}

export function SetInput({ value, onChange, placeholder }: SetInputProps) {
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(false)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sort, setSort] = useState<SetSortOrder>('alphabetical')

  const resolved = value ? getSetByCode(value) : undefined
  const displayValue = editing ? query : resolved ? `${resolved.name} (${resolved.code.toUpperCase()})` : value

  function selectSet(set: ScryfallSet) {
    onChange(set.code)
    setQuery('')
    setEditing(false)
    setOpen(false)
  }

  function handleFocus() {
    setEditing(true)
    setQuery('')
    setOpen(true)
    setError(null)
    setLoading(true)
    ensureSetsLoaded()
      .then(() => setLoading(false))
      .catch(() => {
        setLoading(false)
        setError(getSetsLoadError() ?? 'Failed to load sets.')
      })
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value)
    setOpen(true)
  }

  function handleBlur() {
    setOpen(false)
    setEditing(false)
    // No dataset match picked from the dropdown — fall back to whatever was
    // typed, same as the free-text input this replaces, so an exact code
    // the user already knows (or a set not yet in the cached list) still
    // works.
    const trimmed = query.trim()
    if (trimmed && trimmed !== value) onChange(trimmed)
  }

  function clear() {
    onChange('')
    setQuery('')
  }

  const results = query.trim() ? searchSets(query, sort) : browseSets(sort)

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="pr-8 pl-8"
        />
        {loading ? (
          <Loader2 className="absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : (
          value && (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={clear}
              aria-label="Clear set"
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )
        )}
      </div>

      {open && (
        <div className="absolute z-10 mt-1 max-h-80 w-full overflow-y-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md">
          <div
            onMouseDown={(event) => event.preventDefault()}
            className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-popover px-3 py-1.5"
          >
            <span className="text-xs text-muted-foreground">Sort</span>
            <SegmentedToggle options={SORT_OPTIONS} value={sort} onChange={setSort} />
          </div>
          {error ? (
            <p className="p-3 text-xs text-destructive">{error}</p>
          ) : loading ? (
            <p className="p-3 text-xs text-muted-foreground">Loading sets…</p>
          ) : results.length ? (
            results.map((set) => <SetRow key={set.code} set={set} onSelect={() => selectSet(set)} />)
          ) : (
            <p className="p-3 text-xs text-muted-foreground">No matching sets.</p>
          )}
        </div>
      )}
    </div>
  )
}
