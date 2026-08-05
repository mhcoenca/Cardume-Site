import type { OracleTag, OracleTagDataset } from './types'

const BULK_DATA_ENDPOINT = 'https://api.scryfall.com/bulk-data/oracle_tags'

interface BulkDataMeta {
  jsonl_download_uri: string
  updated_at: string
}

interface ScryfallTagRecord {
  id: string
  label: string
  slug: string
  type: string
  uri: string
  description: string | null
  parent_ids: string[]
  child_ids: string[]
  aliases: string[]
  taggings: { oracle_id: string }[]
}

/**
 * Knows how to obtain the official Oracle Tags dataset — nothing else in the
 * app should know it's Scryfall's bulk-data API specifically. Swapping this
 * for an embedded dataset, an IndexedDB-backed cache, or a Service Worker
 * fetch later means replacing this one function; OracleTagRepository and
 * everything above it stays the same.
 */
export async function fetchOracleTagDataset(): Promise<OracleTagDataset> {
  const metaResponse = await fetch(BULK_DATA_ENDPOINT)
  if (!metaResponse.ok) {
    throw new Error(`Failed to fetch Oracle Tags metadata (${metaResponse.status})`)
  }
  const meta = (await metaResponse.json()) as BulkDataMeta

  const fileResponse = await fetch(meta.jsonl_download_uri)
  if (!fileResponse.ok || !fileResponse.body) {
    throw new Error(`Failed to fetch Oracle Tags dataset (${fileResponse.status})`)
  }

  // Parsing lives here, isolated from storage/indexing — moving this to a
  // Web Worker later only means this function's body moves; its signature
  // (Promise<OracleTagDataset>) doesn't change.
  const decompressed = fileResponse.body.pipeThrough(new DecompressionStream('gzip'))
  const text = await new Response(decompressed).text()

  const tags: OracleTag[] = []
  for (const line of text.split('\n')) {
    if (!line.trim()) continue
    const record = JSON.parse(line) as ScryfallTagRecord
    if (record.type !== 'oracle') continue

    tags.push({
      id: record.id,
      slug: record.slug,
      label: record.label,
      description: record.description,
      aliases: record.aliases,
      parentIds: record.parent_ids,
      childIds: record.child_ids,
      uri: record.uri,
      taggingCount: record.taggings.length,
      taggingOracleIds: record.taggings.map((t) => t.oracle_id),
    })
  }

  return { version: meta.updated_at, updatedAt: meta.updated_at, tags }
}
