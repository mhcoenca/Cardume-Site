import { useEffect, useState, type ChangeEvent } from 'react'
import { Loader2, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  ensureOracleTagsLoaded,
  getOracleTagsLoadError,
  searchOracleTags,
} from '@/services/oracleTags/OracleTagService'
import type { OracleTagMetadata, OracleTagValue } from '@/services/oracleTags/types'

interface OracleTagInputProps {
  value: OracleTagValue | null
  onChange: (value: OracleTagValue | null) => void
  placeholder?: string
}

export function OracleTagInput({ value, onChange, placeholder }: OracleTagInputProps) {
  const [inputValue, setInputValue] = useState(value?.label ?? '')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<OracleTagMetadata[]>([])

  useEffect(() => {
    setInputValue(value?.label ?? '')
  }, [value])

  function handleFocus() {
    setOpen(true)
    setError(null)
    setLoading(true)
    ensureOracleTagsLoaded()
      .then(() => {
        setLoading(false)
        setResults(searchOracleTags(inputValue))
      })
      .catch(() => {
        setLoading(false)
        setError(getOracleTagsLoadError() ?? 'Failed to load Oracle Tags.')
      })
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value
    setInputValue(next)
    setResults(searchOracleTags(next))
  }

  function handleSelect(tag: OracleTagMetadata) {
    onChange({ id: tag.id, slug: tag.slug, label: tag.label })
    setInputValue(tag.label)
    setOpen(false)
  }

  function handleBlur() {
    setOpen(false)
    if (!inputValue.trim()) {
      onChange(null)
      return
    }
    // Typed text that was never selected from the list doesn't become the
    // value — revert to whatever was last actually chosen.
    setInputValue(value?.label ?? '')
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="pl-8"
        />
        {loading && (
          <Loader2 className="absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && (
        <div className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md">
          {error ? (
            <p className="p-3 text-xs text-destructive">{error}</p>
          ) : loading ? (
            <p className="p-3 text-xs text-muted-foreground">Loading Oracle Tags…</p>
          ) : results.length ? (
            results.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(tag)}
                className="flex w-full flex-col items-start gap-0.5 px-3 py-1.5 text-left text-sm hover:bg-accent"
              >
                <span className="font-medium text-foreground">{tag.label}</span>
                {tag.description && (
                  <span className="line-clamp-1 text-xs text-muted-foreground">
                    {tag.description}
                  </span>
                )}
              </button>
            ))
          ) : (
            <p className="p-3 text-xs text-muted-foreground">
              {inputValue.trim() ? 'No matching tags.' : 'Start typing to search…'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
