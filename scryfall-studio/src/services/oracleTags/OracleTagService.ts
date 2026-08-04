import type { OracleTagMetadata } from './types'

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
  taggings: unknown[]
}

let tagsById: Map<string, OracleTagMetadata> | null = null
let tagsBySlug: Map<string, OracleTagMetadata> | null = null
let loadPromise: Promise<void> | null = null
let loadError: string | null = null

async function fetchAndParse(): Promise<void> {
  const metaResponse = await fetch(BULK_DATA_ENDPOINT)
  if (!metaResponse.ok) {
    throw new Error(`Failed to fetch Oracle Tags metadata (${metaResponse.status})`)
  }
  const meta = (await metaResponse.json()) as BulkDataMeta

  const fileResponse = await fetch(meta.jsonl_download_uri)
  if (!fileResponse.ok || !fileResponse.body) {
    throw new Error(`Failed to fetch Oracle Tags dataset (${fileResponse.status})`)
  }

  const decompressed = fileResponse.body.pipeThrough(new DecompressionStream('gzip'))
  const text = await new Response(decompressed).text()

  const byId = new Map<string, OracleTagMetadata>()
  const bySlug = new Map<string, OracleTagMetadata>()

  for (const line of text.split('\n')) {
    if (!line.trim()) continue
    const record = JSON.parse(line) as ScryfallTagRecord
    if (record.type !== 'oracle') continue

    const tag: OracleTagMetadata = {
      id: record.id,
      slug: record.slug,
      label: record.label,
      description: record.description,
      aliases: record.aliases,
      parentIds: record.parent_ids,
      childIds: record.child_ids,
      uri: record.uri,
      taggingCount: record.taggings.length,
    }
    byId.set(tag.id, tag)
    bySlug.set(tag.slug, tag)
  }

  tagsById = byId
  tagsBySlug = bySlug
}

/** Fetches and parses the official dataset at most once; safe to call repeatedly. */
export function ensureOracleTagsLoaded(): Promise<void> {
  if (tagsById) return Promise.resolve()
  if (!loadPromise) {
    loadError = null
    loadPromise = fetchAndParse().catch((error: unknown) => {
      loadError = error instanceof Error ? error.message : 'Failed to load Oracle Tags.'
      loadPromise = null
      throw error
    })
  }
  return loadPromise
}

export function isOracleTagsLoaded(): boolean {
  return tagsById !== null
}

export function getOracleTagsLoadError(): string | null {
  return loadError
}

export function getOracleTagById(id: string): OracleTagMetadata | undefined {
  return tagsById?.get(id)
}

export function getOracleTagBySlug(slug: string): OracleTagMetadata | undefined {
  return tagsBySlug?.get(slug)
}

export function getOracleTagChildren(id: string): OracleTagMetadata[] {
  const tag = tagsById?.get(id)
  if (!tag) return []
  return tag.childIds
    .map((childId) => tagsById?.get(childId))
    .filter((t): t is OracleTagMetadata => t !== undefined)
}

export function getOracleTagParents(id: string): OracleTagMetadata[] {
  const tag = tagsById?.get(id)
  if (!tag) return []
  return tag.parentIds
    .map((parentId) => tagsById?.get(parentId))
    .filter((t): t is OracleTagMetadata => t !== undefined)
}

/** Full descendant closure via child_ids — mirrors how Scryfall's own otag: resolves hierarchy. */
export function getOracleTagDescendants(id: string): OracleTagMetadata[] {
  const root = tagsById?.get(id)
  if (!root) return []

  const seen = new Map<string, OracleTagMetadata>()
  const stack = [...root.childIds]
  while (stack.length) {
    const nextId = stack.pop()
    if (!nextId || seen.has(nextId)) continue
    const tag = tagsById?.get(nextId)
    if (!tag) continue
    seen.set(nextId, tag)
    stack.push(...tag.childIds)
  }
  return [...seen.values()]
}

/** Matches label, slug, or aliases; prefix hits rank above mid-string hits. */
export function searchOracleTags(query: string, limit = 20): OracleTagMetadata[] {
  if (!tagsById) return []
  const q = query.trim().toLowerCase()
  if (!q) return []

  const isPrefixHit = (tag: OracleTagMetadata) =>
    tag.label.toLowerCase().startsWith(q) || tag.slug.toLowerCase().startsWith(q)

  const matches = [...tagsById.values()].filter(
    (tag) =>
      tag.label.toLowerCase().includes(q) ||
      tag.slug.toLowerCase().includes(q) ||
      tag.aliases.some((alias) => alias.toLowerCase().includes(q)),
  )

  matches.sort((a, b) => {
    const rank = Number(isPrefixHit(b)) - Number(isPrefixHit(a))
    return rank !== 0 ? rank : a.label.localeCompare(b.label)
  })

  return matches.slice(0, limit)
}
