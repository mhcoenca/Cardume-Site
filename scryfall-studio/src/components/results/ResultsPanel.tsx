import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCardSearch } from '@/hooks/useCardSearch'
import { useCopyboard } from '@/store/useCopyboard'
import { useQueryStore } from '@/store/useQueryStore'
import { CardThumbnail } from './CardThumbnail'
import { ResultsActionBar } from './ResultsActionBar'

interface ResultsPanelProps {
  query: string
  /** Clause-driven params like Sort's `order` — same ones baked into the Final URL. */
  params?: Record<string, string>
}

const MIN_THUMBNAIL_SIZE = 110
const MAX_THUMBNAIL_SIZE = 230
const DEFAULT_THUMBNAIL_SIZE = MAX_THUMBNAIL_SIZE

export function ResultsPanel({ query, params }: ResultsPanelProps) {
  const { cards, totalCards, loading, loadingMore, error, hasMore, loadMore } = useCardSearch(
    query,
    params,
  )
  const { sort, setSort } = useQueryStore()
  const { addCards } = useCopyboard()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [thumbnailSize, setThumbnailSize] = useState(DEFAULT_THUMBNAIL_SIZE)

  // A new query invalidates any selection made against the previous results;
  // "Load more" appending to the same query's results should not.
  useEffect(() => {
    setSelectedIds(new Set())
  }, [query])

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => (prev.size === cards.length ? new Set() : new Set(cards.map((c) => c.id))))
  }

  async function copySelected() {
    const text = cards
      .filter((card) => selectedIds.has(card.id))
      .map((card) => `1 ${card.name}`)
      .join('\n')
    await navigator.clipboard.writeText(text)
  }

  function sendToCopyboard() {
    addCards(
      cards.filter((card) => selectedIds.has(card.id)).map((card) => ({ id: card.id, name: card.name })),
    )
  }

  if (!query.trim()) return null

  return (
    <div className="flex flex-col gap-3 border-t border-border p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Results</h2>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {!loading && !error && (
            <span>
              {totalCards.toLocaleString()} card{totalCards === 1 ? '' : 's'}
            </span>
          )}
        </div>
      </div>

      {error &&
        (error.status === 404 ? (
          // Scryfall reports "zero matches" as a 404 with a friendly explanation —
          // that's an empty result, not a real failure, so it isn't styled as one.
          <p className="text-xs text-muted-foreground">{error.details}</p>
        ) : (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <p className="font-medium">Scryfall couldn't run this query.</p>
            <p className="mt-1 text-destructive/90">{error.details}</p>
          </div>
        ))}

      {cards.length > 0 && (
        <>
          <ResultsActionBar
            totalSelectable={cards.length}
            selectedCount={selectedIds.size}
            onToggleSelectAll={toggleSelectAll}
            onCopySelected={copySelected}
            onSendToCopyboard={sendToCopyboard}
            size={thumbnailSize}
            onSizeChange={setThumbnailSize}
            minSize={MIN_THUMBNAIL_SIZE}
            maxSize={MAX_THUMBNAIL_SIZE}
            sort={sort}
            onSortChange={setSort}
          />

          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${thumbnailSize}px, 1fr))` }}
          >
            {cards.map((card) => (
              <CardThumbnail
                key={card.id}
                card={card}
                selected={selectedIds.has(card.id)}
                onToggleSelect={() => toggleSelect(card.id)}
              />
            ))}
          </div>

          {hasMore && (
            <Button
              variant="outline"
              className="self-center"
              disabled={loadingMore}
              onClick={loadMore}
            >
              {loadingMore && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {loadingMore ? 'Loading…' : 'Load more'}
            </Button>
          )}
        </>
      )}

      <p className="text-center text-[11px] text-muted-foreground">
        Card data and images courtesy of{' '}
        <a
          href="https://scryfall.com"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-foreground"
        >
          Scryfall
        </a>
        .
      </p>
    </div>
  )
}
