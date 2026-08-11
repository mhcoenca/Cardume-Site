/** The compact reference a QueryClauseInstance actually stores. */
export interface ArtTagValue {
  id: string
  slug: string
  label: string
  /** Carried along at selection time so tooltips/inspectors don't need a re-lookup. */
  description?: string
}

/** The full tag record, as held by the repository. */
export interface ArtTag {
  id: string
  slug: string
  label: string
  description: string | null
  aliases: string[]
  parentIds: string[]
  childIds: string[]
  uri: string
  /** How many artworks carry this tag directly — kept even though taggingIllustrationIds also has the count, for cheap display. */
  taggingCount: number
  /** The illustration_ids of directly-tagged artworks — one per unique piece of art, not per card/print. */
  taggingIllustrationIds: string[]
}

/** A dataset snapshot plus the metadata needed to reason about its freshness. */
export interface ArtTagDataset {
  version: string
  updatedAt: string
  tags: ArtTag[]
}

export function toArtTagValue(tag: ArtTag): ArtTagValue {
  return {
    id: tag.id,
    slug: tag.slug,
    label: tag.label,
    description: tag.description ?? undefined,
  }
}
