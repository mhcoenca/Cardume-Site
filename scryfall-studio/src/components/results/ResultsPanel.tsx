import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCardSearch } from '@/hooks/useCardSearch'
import { CardThumbnail } from './CardThumbnail'

interface ResultsPanelProps {
  query: string
  /** Clause-driven params like Sort's `order` — same ones baked into the Final URL. */
  params?: Record<string, string>
}

export function ResultsPanel({ query, params }: ResultsPanelProps) {
  const { cards, totalCards, loading, loadingMore, error, hasMore, loadMore } = useCardSearch(
    query,
    params,
  )

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
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {cards.map((card) => (
              <CardThumbnail key={card.id} card={card} />
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
