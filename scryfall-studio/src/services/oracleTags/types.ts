/** The compact reference a QueryClauseInstance actually stores. */
export interface OracleTagValue {
  id: string
  slug: string
  label: string
}

/** The full tag record, resolvable on demand by id/slug — never stored inline in a value. */
export interface OracleTagMetadata extends OracleTagValue {
  description: string | null
  aliases: string[]
  parentIds: string[]
  childIds: string[]
  uri: string
  /** Number of oracle_ids directly tagged — the taggings array itself is not retained. */
  taggingCount: number
}
