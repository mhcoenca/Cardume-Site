import { useState, type ChangeEvent, type ReactNode } from 'react'
import { HelpCircle, Loader2, Search, X } from 'lucide-react'
import { SegmentedToggle } from '@/components/clauses/SegmentedToggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { OracleTagClauseValue, OracleTagCombineMode } from '@/clauses/plugins/oracle-tag'
import {
  ensureOracleTagsLoaded,
  getOracleTagsLoadError,
  searchOracleTags,
} from '@/services/oracleTags/OracleTagService'
import { addRecentOracleTag, getRecentOracleTags } from '@/services/oracleTags/recentOracleTags'
import { toOracleTagValue } from '@/services/oracleTags/types'
import type { OracleTag, OracleTagValue } from '@/services/oracleTags/types'
import { OracleTagBrowserModal } from './OracleTagBrowserModal'

interface OracleTagInputProps {
  value: OracleTagClauseValue
  onChange: (value: OracleTagClauseValue) => void
  placeholder?: string
}

interface OracleTagOption {
  id: string
  label: string
  description?: string | null
}

const COMBINE_MODES = [
  { value: 'and' as const, label: 'All', title: 'Match every selected tag' },
  { value: 'or' as const, label: 'Any', title: 'Match at least one selected tag (partial matches)' },
]

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
    <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md">
      {children}
    </div>
  )
}

export function OracleTagInput({ value, onChange, placeholder }: OracleTagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<OracleTag[]>([])
  const [recent, setRecent] = useState<OracleTagValue[]>([])
  const [browserOpen, setBrowserOpen] = useState(false)

  const selectedIds = new Set(value.tags.map((tag) => tag.id))

  function addTag(tag: OracleTagValue) {
    if (selectedIds.has(tag.id)) return
    onChange({ ...value, tags: [...value.tags, tag] })
    setInputValue('')
    setOpen(false)
    addRecentOracleTag(tag)
    setRecent(getRecentOracleTags())
  }

  function removeTag(tagId: string) {
    onChange({ ...value, tags: value.tags.filter((tag) => tag.id !== tagId) })
  }

  function setCombineMode(combineMode: OracleTagCombineMode) {
    onChange({ ...value, combineMode })
  }

  function handleFocus() {
    setOpen(true)
    setError(null)
    setRecent(getRecentOracleTags())
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
    setOpen(true)
  }

  function handleBlur() {
    setOpen(false)
  }

  const hasQuery = inputValue.trim().length > 0
  const availableResults = results.filter((tag) => !selectedIds.has(tag.id))
  const availableRecent = recent.filter((tag) => !selectedIds.has(tag.id))

  return (
    <div className="flex flex-col gap-2">
      {value.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.tags.map((tag) => (
            <span
              key={tag.id}
              className="flex items-center gap-1 rounded-md border border-primary bg-primary px-2 py-1 text-xs font-medium text-primary-foreground"
            >
              {tag.label}
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                aria-label={`Remove ${tag.label}`}
                className="opacity-80 hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
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
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => setBrowserOpen(true)}
            aria-label="Browse all Oracle Tags"
            title="Browse all Oracle Tags"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>

        <OracleTagBrowserModal open={browserOpen} onOpenChange={setBrowserOpen} onSelect={addTag} />

        {open && (
          <Dropdown>
            {hasQuery ? (
              error ? (
                <p className="p-3 text-xs text-destructive">{error}</p>
              ) : loading ? (
                <p className="p-3 text-xs text-muted-foreground">Loading Oracle Tags…</p>
              ) : availableResults.length ? (
                availableResults.map((tag) => (
                  <OptionRow key={tag.id} option={tag} onSelect={() => addTag(toOracleTagValue(tag))} />
                ))
              ) : (
                <p className="p-3 text-xs text-muted-foreground">No matching tags.</p>
              )
            ) : availableRecent.length ? (
              <>
                <p className="px-3 pt-2 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Recent
                </p>
                {availableRecent.map((tag) => (
                  <OptionRow key={tag.id} option={tag} onSelect={() => addTag(tag)} />
                ))}
              </>
            ) : (
              <p className="p-3 text-xs text-muted-foreground">Start typing to search…</p>
            )}
          </Dropdown>
        )}
      </div>

      {value.tags.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Match</span>
          <SegmentedToggle options={COMBINE_MODES} value={value.combineMode} onChange={setCombineMode} />
        </div>
      )}
    </div>
  )
}
