export interface ScryfallCardFace {
  name?: string
  image_uris?: Record<string, string>
}

export interface ScryfallCard {
  id: string
  name: string
  scryfall_uri: string
  image_uris?: Record<string, string>
  card_faces?: ScryfallCardFace[]
}

export interface CardSearchResult {
  totalCards: number
  cards: ScryfallCard[]
  hasMore: boolean
  nextPage: string | null
}

/** Scryfall's own explanation of what's wrong with the query — surfaced as-is to the user. */
export interface CardSearchError {
  status: number
  details: string
}

const SEARCH_ENDPOINT = 'https://api.scryfall.com/cards/search'

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

async function fetchAndParse(url: string, signal?: AbortSignal): Promise<CardSearchResult> {
  const response = await fetch(url, { signal })
  const body = await response.json()

  if (!response.ok) {
    const error: CardSearchError = {
      status: typeof body.status === 'number' ? body.status : response.status,
      details:
        typeof body.details === 'string' ? body.details : 'Something went wrong searching Scryfall.',
    }
    throw error
  }

  return {
    totalCards: body.total_cards ?? 0,
    cards: body.data ?? [],
    hasMore: Boolean(body.has_more),
    nextPage: body.next_page ?? null,
  }
}

export async function searchCards(
  query: string,
  extraParams: Record<string, string> = {},
  signal?: AbortSignal,
): Promise<CardSearchResult> {
  // Same params baked into the "Open in Scryfall" URL (e.g. Sort's `order`)
  // apply here too, so results in-app match what following that link shows.
  const params = new URLSearchParams(extraParams)
  params.set('q', query)
  return fetchAndParse(`${SEARCH_ENDPOINT}?${params.toString()}`, signal)
}

export async function fetchNextPage(url: string, signal?: AbortSignal): Promise<CardSearchResult> {
  return fetchAndParse(url, signal)
}

export { isAbortError }
