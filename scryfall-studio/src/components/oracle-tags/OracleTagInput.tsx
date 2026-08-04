import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { Loader2, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  ensureOracleTagsLoaded,
  getOracleTagsLoadError,
  searchOracleTags,
} from '@/services/oracleTags/OracleTagService'
import { addRecentOracleTag, getRecentOracleTags } from '@/services/oracleTags/recentOracleTags'
import { toOracleTagValue } from '@/services/oracleTags/types'
import type { OracleTag, OracleTagValue } from '@/services/oracleTags/types'

interface OracleTagInputProps {
  value: OracleTagValue | null
  onChange: (value: OracleTagValue | null) => void
  placeholder?: string
}

interface OracleTagOption {
  id: string
  label: string
  description?: string | null
}

function OptionRow({ option, onSelect }: { option: OracleTagOption; onSelect: () => void }) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onSelect}
      className="flex w-full flex-col items-start gap-0.5 px-3 py-1.5 text-left text-sm hover:bg-accent"
    >
      <span className="font-medium text-foreground">{option.label}</span>
      {option.description && (
        <span className="line-clamp-1 text-xs text-muted-foreground">{option.description}</span>
      )}
    </button>
  )
}

function Dropdown({ children }: { children: ReactNode }) {
  return (
    <div className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md">
      {children}
    </div>
  )
}

export function OracleTagInput({ value, onChange, placeholder }: OracleTagInputProps) {
  const [inputValue, setInputValue] = useState(value?.label ?? '')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<OracleTag[]>([])
  const [recent, setRecent] = useState<OracleTagValue[]>([])

  // The dataset load is async; by the time it resolves the user may have
  // already typed further. A ref (updated every render) lets that callback
  // read the query as it stands *then*, instead of the one closed over when
  // the load started — otherwise a stale, usually-empty query would
  // overwrite whatever the user had already typed.
  const inputValueRef = useRef(inputValue)
  inputValueRef.current = inputValue

  // Stays in sync if the value is ever changed from outside this component
  // (e.g. a future reverse-parsed query or an Inspector edit).
  useEffect(() => {
    setInputValue(value?.label ?? '')
  }, [value])

  function commitSelection(tag: OracleTagValue) {
    onChange(tag)
    setInputValue(tag.label)
    setOpen(false)
    addRecentOracleTag(tag)
    setRecent(getRecentOracleTags())
  }

  function handleFocus() {
    setOpen(true)
    setError(null)
    setRecent(getRecentOracleTags())
    setLoading(true)
    ensureOracleTagsLoaded()
      .then(() => {
        setLoading(false)
        setResults(searchOracleTags(inputValueRef.current))
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
    // Typing never blurs the field, so a selection made just before this
    // (which closes the dropdown but keeps focus, by design) wouldn't
    // otherwise reopen it.
    setOpen(true)
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

  const hasQuery = inputValue.trim().length > 0

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onClick={() => setOpen(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="pl-8"
        />
        {loading && (
          <Loader2 className="absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && (
        <Dropdown>
          {hasQuery ? (
            error ? (
              <p className="p-3 text-xs text-destructive">{error}</p>
            ) : loading ? (
              <p className="p-3 text-xs text-muted-foreground">Loading Oracle Tags…</p>
            ) : results.length ? (
              results.map((tag) => (
                <OptionRow
                  key={tag.id}
                  option={tag}
                  onSelect={() => commitSelection(toOracleTagValue(tag))}
                />
              ))
            ) : (
              <p className="p-3 text-xs text-muted-foreground">No matching tags.</p>
            )
          ) : recent.length ? (
            <>
              <p className="px-3 pt-2 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Recent
              </p>
              {recent.map((tag) => (
                <OptionRow key={tag.id} option={tag} onSelect={() => commitSelection(tag)} />
              ))}
            </>
          ) : (
            <p className="p-3 text-xs text-muted-foreground">Start typing to search…</p>
          )}
        </Dropdown>
      )}
    </div>
  )
}
