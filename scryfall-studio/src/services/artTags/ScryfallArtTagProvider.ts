import type { ArtTag, ArtTagDataset } from './types'

const BULK_DATA_ENDPOINT = 'https://api.scryfall.com/bulk-data/art_tags'

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
  taggings: { illustration_id: string }[]
}

/**
 * Knows how to obtain the official Art (illustration) Tags dataset —
 * mirrors ScryfallOracleTagProvider, just pointed at the `art_tags`
 * bulk-data type instead of `oracle_tags`.
 */
export async function fetchArtTagDataset(): Promise<ArtTagDataset> {
  const metaResponse = await fetch(BULK_DATA_ENDPOINT)
  if (!metaResponse.ok) {
    throw new Error(`Failed to fetch Art Tags metadata (${metaResponse.status})`)
  }
  const meta = (await metaResponse.json()) as BulkDataMeta

  const fileResponse = await fetch(meta.jsonl_download_uri)
  if (!fileResponse.ok || !fileResponse.body) {
    throw new Error(`Failed to fetch Art Tags dataset (${fileResponse.status})`)
  }

  const decompressed = fileResponse.body.pipeThrough(new DecompressionStream('gzip'))
  const text = await new Response(decompressed).text()

  const tags: ArtTag[] = []
  for (const line of text.split('\n')) {
    if (!line.trim()) continue
    const record = JSON.parse(line) as ScryfallTagRecord
    if (record.type !== 'illustration') continue

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
      taggingIllustrationIds: record.taggings.map((t) => t.illustration_id),
    })
  }

  return { version: meta.updated_at, updatedAt: meta.updated_at, tags }
}
