export interface ScryfallCardSummary {
  id: string
  name: string
  oracleId: string
  scryfallUri: string
}

const AUTOCOMPLETE_ENDPOINT = 'https://api.scryfall.com/cards/autocomplete'
const NAMED_ENDPOINT = 'https://api.scryfall.com/cards/named'
const CARDS_ENDPOINT = 'https://api.scryfall.com/cards'

function toSummary(body: unknown): ScryfallCardSummary | null {
  const card = body as {
    id?: string
    name?: string
    oracle_id?: string
    scryfall_uri?: string
  }
  if (!card.id || !card.name || !card.oracle_id || !card.scryfall_uri) return null
  return { id: card.id, name: card.name, oracleId: card.oracle_id, scryfallUri: card.scryfall_uri }
}

/** Card name suggestions as the user types — Scryfall's own typeahead endpoint. */
export async function autocompleteCardNames(query: string, signal?: AbortSignal): Promise<string[]> {
  if (!query.trim()) return []
  const params = new URLSearchParams({ q: query })
  const response = await fetch(`${AUTOCOMPLETE_ENDPOINT}?${params.toString()}`, { signal })
  if (!response.ok) return []
  const body = await response.json()
  return Array.isArray(body.data) ? body.data : []
}

/** Fuzzy name match — forgiving of minor typos, still resolves exact names correctly. */
export async function getCardByName(
  name: string,
  signal?: AbortSignal,
): Promise<ScryfallCardSummary | null> {
  const params = new URLSearchParams({ fuzzy: name })
  const response = await fetch(`${NAMED_ENDPOINT}?${params.toString()}`, { signal })
  if (!response.ok) return null
  return toSummary(await response.json())
}

/** Direct lookup by Scryfall card id — e.g. resolving the `?lookup=` deep link. */
export async function getCardById(id: string, signal?: AbortSignal): Promise<ScryfallCardSummary | null> {
  const response = await fetch(`${CARDS_ENDPOINT}/${id}`, { signal })
  if (!response.ok) return null
  return toSummary(await response.json())
}

/** Parses a scryfall.com/card/<set>/<number>/... URL and resolves it directly. */
export async function getCardFromScryfallUrl(
  rawUrl: string,
  signal?: AbortSignal,
): Promise<ScryfallCardSummary | null> {
  let url: URL
  try {
    url = new URL(rawUrl.trim())
  } catch {
    return null
  }
  if (!/(^|\.)scryfall\.com$/.test(url.hostname)) return null

  const match = /^\/card\/([^/]+)\/([^/]+)/.exec(url.pathname)
  if (!match) return null
  const [, setCode, number] = match

  const response = await fetch(`${CARDS_ENDPOINT}/${setCode}/${number}`, { signal })
  if (!response.ok) return null
  return toSummary(await response.json())
}
