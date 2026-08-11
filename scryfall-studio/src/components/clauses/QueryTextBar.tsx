import { useEffect, useState } from 'react'
import { Code2 } from 'lucide-react'
import { useQueryStore } from '@/store/useQueryStore'

/**
 * A live, always-editable view of the query's syntax — the escape hatch for
 * anyone who'd rather type Scryfall syntax than click through filter cards.
 * Two-way: editing a clause card updates this text, and editing this text
 * (on commit) adds/updates/removes clause cards to match. Deliberately
 * excludes Card Name/Printed Only, which already have dedicated header
 * controls — see `useQueryStore`'s `clauseQueryText`.
 */
export function QueryTextBar() {
  const { clauseQueryText, syncQueryText } = useQueryStore()
  const [draft, setDraft] = useState(clauseQueryText)
  const [focused, setFocused] = useState(false)

  // Only follow the store's canonical text while the user isn't actively
  // editing here — otherwise a change made via a filter card (or this
  // bar's own commit-triggered reparse) would fight the cursor mid-type.
  useEffect(() => {
    if (!focused) setDraft(clauseQueryText)
  }, [clauseQueryText, focused])

  function commit() {
    // Skip reparsing when nothing actually changed — focusing and blurring
    // without editing shouldn't risk dropping a clause to a latent
    // round-trip bug in some clause's fromQuery.
    if (draft !== clauseQueryText) syncQueryText(draft)
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
      <textarea
        id="query-text-bar"
        value={draft}
        onFocus={() => setFocused(true)}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          setFocused(false)
          commit()
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            event.currentTarget.blur()
          }
        }}
        placeholder='e.g. (o:"draw a card" -o:opponent) OR t:creature'
        rows={2}
        spellCheck={false}
        className="h-16 w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-1.5 font-mono text-sm transition-colors outline-none placeholder:text-muted-foreground placeholder:font-sans focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
    </div>
  )
}
