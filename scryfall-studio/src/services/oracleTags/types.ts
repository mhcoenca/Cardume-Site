/** The compact reference a QueryClauseInstance actually stores. */
export interface OracleTagValue {
  id: string
  slug: string
  label: string
  /** Carried along at selection time so tooltips/inspectors don't need a re-lookup. */
  description?: string
}

/** The full tag record, as held by the repository. */
export interface OracleTag {
  id: string
  slug: string
  label: string
  description: string | null
  aliases: string[]
  parentIds: string[]
  childIds: string[]
  uri: string
  /** Number of oracle_ids directly tagged — the taggings array itself is not retained. */
  taggingCount: number
}

/** A dataset snapshot plus the metadata needed to reason about its freshness. */
export interface OracleTagDataset {
  /**
   * Scryfall doesn't publish a separate semantic version for tag data —
   * `updatedAt` doubles as the version until/unless one exists. Kept as a
   * distinct field so a future data source with a real version doesn't
   * require a shape change here.
   */
  version: string
  updatedAt: string
  tags: OracleTag[]
}

export function toOracleTagValue(tag: OracleTag): OracleTagValue {
  return {
    id: tag.id,
    slug: tag.slug,
    label: tag.label,
    description: tag.description ?? undefined,
  }
}
