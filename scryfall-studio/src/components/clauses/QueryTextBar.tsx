import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { Code2 } from 'lucide-react'
import { suggestOperators, type OperatorSuggestion } from '@/lib/operatorSuggestions'
import { useQueryStore } from '@/store/useQueryStore'

interface TokenRange {
  start: number
  end: number
  /** Whether the token being replaced started with `-` (kept on accept). */
  negated: boolean
}

/** Scans backward from `cursor` to the start of the word it's in — bounded by whitespace or `(`. */
function currentToken(value: string, cursor: number): TokenRange {
  let start = cursor
  while (start > 0 && !/[\s(]/.test(value[start - 1])) start--
  const negated = value[start] === '-'
  return { start: start + (negated ? 1 : 0), end: cursor, negated }
}

/**
 * A live, always-editable view of the query's syntax — the escape hatch for
 * anyone who'd rather type Scryfall syntax than click through filter cards.
 * Two-way: editing a clause card updates this text, and editing this text
 * (on commit) adds/updates/removes clause cards to match. Deliberately
 * excludes Card Name/Printed Only, which already have dedicated header
 * controls — see `useQueryStore`'s `clauseQueryText`.
 *
 * Also offers operator-name autocomplete (`t` → `t:`, `type:`) sourced
 * from the clause registry — see `src/lib/operatorSuggestions.ts`.
 */
export function QueryTextBar() {
  const { clauseQueryText, syncQueryText } = useQueryStore()
  const [draft, setDraft] = useState(clauseQueryText)
  const [focused, setFocused] = useState(false)
  const [suggestions, setSuggestions] = useState<OperatorSuggestion[]>([])
  const [highlighted, setHighlighted] = useState(0)
  const tokenRangeRef = useRef<TokenRange | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const pendingCursorRef = useRef<number | null>(null)

  // Only follow the store's canonical text while the user isn't actively
  // editing here — otherwise a change made via a filter card (or this
  // bar's own commit-triggered reparse) would fight the cursor mid-type.
  useEffect(() => {
    if (!focused) setDraft(clauseQueryText)
  }, [clauseQueryText, focused])

  // Restores the caret after accepting a suggestion splices the text —
  // setSelectionRange has to run after React commits the new value.
  useEffect(() => {
    if (pendingCursorRef.current === null) return
    textareaRef.current?.setSelectionRange(pendingCursorRef.current, pendingCursorRef.current)
    pendingCursorRef.current = null
  }, [draft])

  function commit() {
    // Skip reparsing when nothing actually changed — focusing and blurring
    // without editing shouldn't risk dropping a clause to a latent
    // round-trip bug in some clause's fromQuery.
    if (draft !== clauseQueryText) syncQueryText(draft)
  }

  function closeSuggestions() {
    setSuggestions([])
    tokenRangeRef.current = null
  }

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const value = event.target.value
    const cursor = event.target.selectionStart
    setDraft(value)

    const token = currentToken(value, cursor)
    const word = value.slice(token.start, token.end)
    if (!word || word.includes(':') || word.includes('"')) {
      closeSuggestions()
      return
    }
    const matches = suggestOperators(word)
    if (!matches.length) {
      closeSuggestions()
      return
    }
    tokenRangeRef.current = token
    setSuggestions(matches)
    setHighlighted(0)
  }

  function acceptSuggestion(index: number) {
    const token = tokenRangeRef.current
    const suggestion = suggestions[index]
    if (!token || !suggestion) return
    const replacement = `${token.negated ? '-' : ''}${suggestion.operator}:`
    const next = draft.slice(0, token.start - (token.negated ? 1 : 0)) + replacement + draft.slice(token.end)
    pendingCursorRef.current = token.start - (token.negated ? 1 : 0) + replacement.length
    setDraft(next)
    closeSuggestions()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (suggestions.length) {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setHighlighted((i) => (i + 1) % suggestions.length)
        return
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setHighlighted((i) => (i - 1 + suggestions.length) % suggestions.length)
        return
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault()
        acceptSuggestion(highlighted)
        return
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        closeSuggestions()
        return
      }
    }
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      event.currentTarget.blur()
    }
  }

  return (
    <div className="border-b border-border px-4 py-3">
      <label
        htmlFor="query-text-bar"
        className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
      >
        <Code2 className="h-3.5 w-3.5" />
        Query syntax
      </label>
      <div className="relative">
        <textarea
          ref={textareaRef}
          id="query-text-bar"
          value={draft}
          onFocus={() => setFocused(true)}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            setFocused(false)
            closeSuggestions()
            commit()
          }}
          placeholder='e.g. (o:"draw a card" -o:opponent) OR t:creature'
          rows={2}
          spellCheck={false}
          className="h-16 w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-1.5 font-mono text-sm transition-colors outline-none placeholder:text-muted-foreground placeholder:font-sans focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />

        {suggestions.length > 0 && (
          <div className="absolute z-20 mt-1 w-full max-w-xs overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.operator}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => acceptSuggestion(index)}
                className={`flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left text-sm ${
                  index === highlighted ? 'bg-accent' : 'hover:bg-accent'
                }`}
              >
                <span className="font-mono font-medium text-foreground">{suggestion.operator}:</span>
                <span className="truncate text-xs text-muted-foreground">{suggestion.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
