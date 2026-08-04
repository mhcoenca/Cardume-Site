import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  ensureTypeCatalogLoaded,
  getAllTypeGroups,
  getTypeCatalogLoadError,
  TYPE_CATEGORIES,
  type TypeCategory,
  type TypeCategoryGroup,
} from '@/services/scryfall/typeCatalog'
import { TypeCategoryRow } from './TypeCategoryRow'

interface TypeLineInputProps {
  value: string[]
  onChange: (value: string[]) => void
}

export function TypeLineInput({ value, onChange }: TypeLineInputProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [groups, setGroups] = useState<TypeCategoryGroup[]>([])
  const [openCategories, setOpenCategories] = useState<Set<TypeCategory>>(new Set())
  const didAutoOpen = useRef(false)

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
            .filter((g) => g.types.some((t) => value.some((v) => v.toLowerCase() === t.toLowerCase())))
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
      <div className="flex flex-wrap gap-1.5">
        {TYPE_CATEGORIES.map(({ category, label }) => {
          const group = groupByCategory.get(category)
          const hasSelections =
            group?.types.some((t) => value.some((v) => v.toLowerCase() === t.toLowerCase())) ??
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
            value={value}
            onChange={onChange}
          />
        ),
      )}
    </div>
  )
}
