const SCRYFALL_SEARCH_URL = 'https://scryfall.com/search'

export interface ParsedScryfallSearch {
  /** The raw `q` fragment from the URL, kept opaque — never decomposed into clauses. */
  baseQuery: string
  /** Every other search param (as, order, unique, prefer, dir, page…), preserved verbatim. */
  params: URLSearchParams
}

/**
 * Parses a Scryfall search URL without attempting to understand its `q` syntax.
 * Returns null for anything that isn't a scryfall.com URL.
 */
export function parseScryfallUrl(rawUrl: string): ParsedScryfallSearch | null {
  let url: URL
  try {
    url = new URL(rawUrl.trim())
  } catch {
    return null
  }
  if (!/(^|\.)scryfall\.com$/.test(url.hostname)) return null

  const params = new URLSearchParams(url.search)
  const baseQuery = params.get('q') ?? ''
  params.delete('q')

  return { baseQuery, params }
}

/** Builds a Scryfall search URL, preserving any extra params (order, as, prefer…). */
export function buildScryfallUrl(query: string, extraParams?: URLSearchParams): string {
  const params = new URLSearchParams(extraParams)
  params.set('q', query)
  return `${SCRYFALL_SEARCH_URL}?${params.toString()}`
}
