/** A single Magic set, as needed for the Set field's search/browse UI. */
export interface ScryfallSet {
  code: string
  name: string
  setType: string
  /** ISO date (YYYY-MM-DD); null for unreleased/unannounced sets. */
  releasedAt: string | null
  digital: boolean
  iconSvgUri: string
}

export type SetSortOrder = 'alphabetical' | 'newest' | 'oldest'
