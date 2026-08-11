import type { ScryfallSet } from './types'

const SETS_ENDPOINT = 'https://api.scryfall.com/sets'

interface ScryfallSetRecord {
  code: string
  name: string
  set_type: string
  released_at?: string
  digital: boolean
  icon_svg_uri: string
}

interface ScryfallSetList {
  data: ScryfallSetRecord[]
  has_more: boolean
}

/**
 * Unlike Oracle/Art Tags, Scryfall's full set list is a single small JSON
 * response (~1000 sets, no bulk-data dance needed) — one `fetch` covers it.
 */
export async function fetchSets(): Promise<ScryfallSet[]> {
  const response = await fetch(SETS_ENDPOINT)
  if (!response.ok) {
    throw new Error(`Failed to fetch sets (${response.status})`)
  }
  const body = (await response.json()) as ScryfallSetList

  return body.data.map((record) => ({
    code: record.code,
    name: record.name,
    setType: record.set_type,
    releasedAt: record.released_at ?? null,
    digital: record.digital,
    iconSvgUri: record.icon_svg_uri,
  }))
}
