import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import type { TypeCombineMode, TypeLineValue } from '@/clauses/plugins/card-types'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'
import {
  ensureTypeCatalogLoaded,
  getAllTypeGroups,
  getTypeCatalogLoadError,
  TYPE_CATEGORIES,
  type TypeCategory,
  type TypeCategoryGroup,
} from '@/services/scryfall/typeCatalog'
import { SegmentedToggle } from './SegmentedToggle'
import { TypeCategoryRow } from './TypeCategoryRow'

interface TypeLineInputProps {
  value: TypeLineValue
  onChange: (value: TypeLineValue) => void
}

const COMBINE_MODES = [
  { value: 'and' as const, label: 'All', title: 'Match every selected type' },
  { value: 'or' as const, label: 'Any', title: 'Match at least one selected type (partial matches)' },
]

interface TypeCategoryMultiSelectProps {
  selected: Set<TypeCategory>
  onToggle: (category: TypeCategory) => void
}

/** Mobile equivalent of the desktop pill row — a checklist dropdown, since
 * 9 wrapping pills read poorly on a phone-width card. Multi-select, same
 * underlying `openCategories` state as the pills, just collapsed by default. */
function TypeCategoryMultiSelect({ selected, onToggle }: TypeCategoryMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const summary =
    selected.size === 0
      ? 'Choose type categories…'
      : selected.size === 1
        ? TYPE_CATEGORIES.find((c) => selected.has(c.category))?.label
        : `${selected.size} categories selected`

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex h-8 w-full items-center justify-between rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span className={cn(selected.size === 0 && 'text-muted-foreground')}>{summary}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md">
          {TYPE_CATEGORIES.map(({ category, label }) => {
            const isChecked = selected.has(category)
            return (
              <button
                key={category}
                type="button"
                onClick={() => onToggle(category)}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-accent"
              >
                <span
                  className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                    isChecked ? 'border-primary bg-primary text-primary-foreground' : 'border-border',
                  )}
                >
                  {isChecked && <Check className="h-3 w-3" />}
                </span>
                {label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function TypeLineInput({ value, onChange }: TypeLineInputProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [groups, setGroups] = useState<TypeCategoryGroup[]>([])
  const [openCategories, setOpenCategories] = useState<Set<TypeCategory>>(new Set())
  const didAutoOpen = useRef(false)
  const isDesktop = useMediaQuery('(min-width: 640px)')

  useEffect(() => {
    setLoading(true)
    ensureTypeCatalogLoaded()
      .then(() => {
        setLoading(false)
        const loaded = getAllTypeGroups()
        setGroups(loaded)
        // Auto-open any category that already has a selection (e.g. reconstructed from an imported URL).
        if (!didAutoOpen.current) {
          didAutoOpen.current = true
          const withSelections = loaded
            .filter((g) =>
              g.types.some((t) => value.types.some((v) => v.toLowerCase() === t.toLowerCase())),
            )
            .map((g) => g.category)
          if (withSelections.length) {
            setOpenCategories(new Set(withSelections))
          }
        }
      })
      .catch(() => {
        setLoading(false)
        setError(getTypeCatalogLoadError() ?? 'Failed to load the type catalog.')
      })
    // Loads once when a Type Line card is added — reasonable given this
    // component only mounts once the user has already opted into it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggleCategory(category: TypeCategory) {
    setOpenCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      return next
    })
  }

  const groupByCategory = new Map(groups.map((g) => [g.category, g]))

  return (
    <div className="flex flex-col gap-3">
      {isDesktop ? (
        <div className="flex flex-wrap gap-1.5">
          {TYPE_CATEGORIES.map(({ category, label }) => {
            const group = groupByCategory.get(category)
            const hasSelections =
              group?.types.some((t) => value.types.some((v) => v.toLowerCase() === t.toLowerCase())) ??
              false
            const isOpen = openCategories.has(category)
            return (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                aria-pressed={isOpen}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  isOpen || hasSelections
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-transparent text-foreground hover:bg-accent',
                )}
              >
                {label}
              </button>
            )
          })}
        </div>
      ) : (
        <TypeCategoryMultiSelect selected={openCategories} onToggle={toggleCategory} />
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      {!error && openCategories.size === 0 && (
        <p className="text-xs text-muted-foreground">
          Pick a category above to browse and select its types.
        </p>
      )}

      {TYPE_CATEGORIES.filter(({ category }) => openCategories.has(category)).map(
        ({ category, label }) => (
          <TypeCategoryRow
            key={category}
            label={label}
            types={groupByCategory.get(category)?.types ?? []}
            loading={loading && !groupByCategory.has(category)}
            value={value.types}
            // Prune a removed type out of `negated` too, so it doesn't
            // linger as dead state if the same type gets re-added later.
            onChange={(types) =>
              onChange({ ...value, types, negated: value.negated.filter((n) => types.includes(n)) })
            }
            negated={value.negated}
            onToggleNegate={(type) =>
              onChange({
                ...value,
                negated: value.negated.includes(type)
                  ? value.negated.filter((n) => n !== type)
                  : [...value.negated, type],
              })
            }
          />
        ),
      )}

      {value.types.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Match</span>
          <SegmentedToggle
            options={COMBINE_MODES}
            value={value.combineMode}
            onChange={(combineMode: TypeCombineMode) => onChange({ ...value, combineMode })}
          />
        </div>
      )}
    </div>
  )
}
