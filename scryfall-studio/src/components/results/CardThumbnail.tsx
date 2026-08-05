import { Check, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ScryfallCard } from '@/services/scryfall/searchCards'

function getImageUrl(card: ScryfallCard): string | null {
  return card.image_uris?.normal ?? card.card_faces?.[0]?.image_uris?.normal ?? null
}

interface CardThumbnailProps {
  card: ScryfallCard
  selected: boolean
  onToggleSelect: () => void
}

export function CardThumbnail({ card, selected, onToggleSelect }: CardThumbnailProps) {
  const imageUrl = getImageUrl(card)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggleSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onToggleSelect()
        }
      }}
      aria-pressed={selected}
      aria-label={selected ? `Deselect ${card.name}` : `Select ${card.name}`}
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-lg border bg-muted/30 transition-shadow hover:shadow-md',
        selected ? 'border-primary ring-2 ring-primary' : 'border-border',
      )}
    >
      <a
        href={card.scryfall_uri}
        target="_blank"
        rel="noreferrer"
        title={`Open ${card.name} on Scryfall`}
        onClick={(event) => event.stopPropagation()}
        className="absolute top-1.5 left-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-md border border-white/70 bg-black/50 text-white transition-colors hover:bg-black/70"
      >
        <ExternalLink className="h-3 w-3" />
      </a>

      {selected && (
        <div className="absolute top-1.5 right-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-3 w-3" />
        </div>
      )}

      <div className="aspect-[5/7] w-full">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={card.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-2 text-center text-xs text-muted-foreground">
            {card.name}
          </div>
        )}
      </div>
    </div>
  )
}
