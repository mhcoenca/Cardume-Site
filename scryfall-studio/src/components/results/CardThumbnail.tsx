import type { ScryfallCard } from '@/services/scryfall/searchCards'

function getImageUrl(card: ScryfallCard): string | null {
  return card.image_uris?.normal ?? card.card_faces?.[0]?.image_uris?.normal ?? null
}

export function CardThumbnail({ card }: { card: ScryfallCard }) {
  const imageUrl = getImageUrl(card)

  return (
    <a
      href={card.scryfall_uri}
      target="_blank"
      rel="noreferrer"
      title={card.name}
      className="group block overflow-hidden rounded-lg border border-border bg-muted/30 transition-shadow hover:shadow-md"
    >
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
    </a>
  )
}
