import { useState } from 'react'
import { Check, ExternalLink, RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ScryfallCard } from '@/services/scryfall/searchCards'

// Only transform/modal-DFC layouts have a separate image per face — split,
// flip, and Adventure cards also carry a `card_faces` array (for their two
// halves' text/mana cost) but render both halves on one physical image, so
// there's nothing to flip *to*. Checking each face has its own `image_uris`
// (rather than just `card_faces.length >= 2`) is what tells them apart —
// verified against the live API for one card of each layout.
function getFaceImageUrls(card: ScryfallCard): string[] {
  const faces = card.card_faces ?? []
  const faceImages = faces.map((f) => f.image_uris?.normal).filter((url): url is string => Boolean(url))
  if (faceImages.length >= 2) return faceImages
  return card.image_uris?.normal ? [card.image_uris.normal] : []
}

interface CardThumbnailProps {
  card: ScryfallCard
  selected: boolean
  onToggleSelect: () => void
}

export function CardThumbnail({ card, selected, onToggleSelect }: CardThumbnailProps) {
  const [faceIndex, setFaceIndex] = useState(0)
  const faceImages = getFaceImageUrls(card)
  const isDoubleFaced = faceImages.length >= 2
  const imageUrl = faceImages[faceIndex] ?? faceImages[0] ?? null
  const displayedFaceName = isDoubleFaced ? (card.card_faces?.[faceIndex]?.name ?? card.name) : card.name

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

      {isDoubleFaced && (
        <button
          type="button"
          title={`Show ${faceIndex === 0 ? 'back' : 'front'} face`}
          aria-label={`Show ${faceIndex === 0 ? 'back' : 'front'} face`}
          onClick={(event) => {
            event.stopPropagation()
            setFaceIndex((i) => (i + 1) % faceImages.length)
          }}
          className="absolute top-8 left-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-md border border-white/70 bg-black/50 text-white transition-colors hover:bg-black/70"
        >
          <RotateCw className="h-3 w-3" />
        </button>
      )}

      {selected && (
        <div className="absolute top-1.5 right-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-3 w-3" />
        </div>
      )}

      <div className="aspect-[5/7] w-full">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={displayedFaceName}
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
