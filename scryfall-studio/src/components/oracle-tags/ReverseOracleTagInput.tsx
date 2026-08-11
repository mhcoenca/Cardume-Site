import { useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { Check, Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type {
  ReverseOracleTagCombineMode,
  ReverseOracleTagValue,
} from '@/clauses/plugins/reverse-oracle-tag'
import { ensureOracleTagsLoaded, getOracleTagsForCard } from '@/services/oracleTags/OracleTagService'
import { toOracleTagValue } from '@/services/oracleTags/types'
import {
  autocompleteCardNames,
  getCardByName,
  getCardFromScryfallUrl,
} from '@/services/scryfall/cardLookup'
import { SegmentedToggle } from '@/components/clauses/SegmentedToggle'

interface ReverseOracleTagInputProps {
  value: ReverseOracleTagValue
  onChange: (value: ReverseOracleTagValue) => void
}

const AUTOCOMPLETE_DEBOUNCE_MS = 250

const COMBINE_MODES: { value: ReverseOracleTagCombineMode; label: string; title: string }[] = [
  { value: 'or', label: 'Any', title: 'Match any selected tag' },
  { value: 'and', label: 'All', title: 'Match all selected tags' },
]

function looksLikeUrl(text: string): boolean {
  return /^https?:\/\//i.test(text.trim())
}

export function ReverseOracleTagInput({ value, onChange }: ReverseOracleTagInputProps) {
  const [inputValue, setInputValue] = useState(value.card?.name ?? '')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value
    setInputValue(next)
    setError(null)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (looksLikeUrl(next) || !next.trim()) {
      setSuggestions([])
      setOpen(false)
      return
    }
    debounceRef.current = setTimeout(() => {
      autocompleteCardNames(next).then((names) => {
        setSuggestions(names)
        setOpen(names.length > 0)
      })
    }, AUTOCOMPLETE_DEBOUNCE_MS)
  }

  async function resolveCard(text: string) {
    setResolving(true)
    setError(null)
    setOpen(false)
    try {
      const summary = looksLikeUrl(text)
        ? await getCardFromScryfallUrl(text)
        : await getCardByName(text)
      if (!summary) {
        setResolving(false)
        setError("Couldn't find that card.")
        return
      }
      await ensureOracleTagsLoaded()
      const tags = getOracleTagsForCard(summary.oracleId).map(toOracleTagValue)
      setResolving(false)
      setInputValue(summary.name)
      onChange({
        card: { id: summary.id, name: summary.name, scryfallUri: summary.scryfallUri },
        tags,
        pendingTagIds: tags.map((tag) => tag.id),
        activeTagIds: [],
        combineMode: value.combineMode,
      })
    } catch {
      setResolving(false)
      setError('Something went wrong looking up that card.')
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && inputValue.trim()) {
      event.preventDefault()
      resolveCard(inputValue.trim())
    }
  }

  function togglePending(tagId: string) {
    onChange({
      ...value,
      pendingTagIds: value.pendingTagIds.includes(tagId)
        ? value.pendingTagIds.filter((id) => id !== tagId)
        : [...value.pendingTagIds, tagId],
    })
  }

  function setCombineMode(combineMode: ReverseOracleTagCombineMode) {
    onChange({ ...value, combineMode })
  }

  function handleSearch() {
    onChange({ ...value, activeTagIds: value.pendingTagIds })
  }

  function toggleSelectAll() {
    const allSelected = value.pendingTagIds.length === value.tags.length
    onChange({ ...value, pendingTagIds: allSelected ? [] : value.tags.map((tag) => tag.id) })
  }

  const isSearchStale =
    value.pendingTagIds.length !== value.activeTagIds.length ||
    value.pendingTagIds.some((id) => !value.activeTagIds.includes(id))
  const selectedCount = value.pendingTagIds.length
  const allSelected = value.tags.length > 0 && selectedCount === value.tags.length

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="Paste a Scryfall card URL or type a card name…"
            className="pl-8"
          />
          {resolving && (
            <Loader2 className="absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>

        {open && suggestions.length > 0 && (
          <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md">
            {suggestions.map((name) => (
              <button
                key={name}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => resolveCard(name)}
                className="block w-full px-3 py-1.5 text-left text-sm hover:bg-accent"
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {value.card && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Oracle Tags on {value.card.name}
            </p>

            {value.tags.length === 0 ? (
              <p className="text-xs text-muted-foreground">This card has no Oracle Tags yet.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {value.tags.map((tag) => {
                  const pending = value.pendingTagIds.includes(tag.id)
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => togglePending(tag.id)}
                      aria-pressed={pending}
                      className={cn(
                        'flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                        pending
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-transparent text-foreground hover:bg-accent',
                      )}
                    >
                      {tag.label}
                      {pending && <Check className="h-3 w-3" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {value.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
              <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                {allSelected ? 'Unselect All' : 'Select All'}
              </Button>
              <SegmentedToggle options={COMBINE_MODES} value={value.combineMode} onChange={setCombineMode} />
              <Button
                variant={isSearchStale ? 'default' : 'outline'}
                size="sm"
                disabled={selectedCount === 0}
                onClick={handleSearch}
                className="ml-auto"
              >
                <Search className="h-3.5 w-3.5" />
                Search cards with these tags ({selectedCount} selected)
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
