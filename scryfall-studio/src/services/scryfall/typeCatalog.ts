export type TypeCategory =
  | 'card-types'
  | 'supertypes'
  | 'artifact-types'
  | 'battle-types'
  | 'creature-types'
  | 'enchantment-types'
  | 'land-types'
  | 'planeswalker-types'
  | 'spell-types'

export interface TypeCategoryGroup {
  category: TypeCategory
  label: string
  types: string[]
}

const CATALOG_ENDPOINT = 'https://api.scryfall.com/catalog'

// Order mirrors Scryfall's own Type Line autocomplete grouping.
export const TYPE_CATEGORIES: { category: TypeCategory; label: string }[] = [
  { category: 'card-types', label: 'Types' },
  { category: 'supertypes', label: 'Supertypes' },
  { category: 'artifact-types', label: 'Artifact Types' },
  { category: 'battle-types', label: 'Battle Types' },
  { category: 'enchantment-types', label: 'Enchantment Types' },
  { category: 'land-types', label: 'Land Types' },
  { category: 'planeswalker-types', label: 'Planeswalker Types' },
  { category: 'spell-types', label: 'Spell Types' },
  { category: 'creature-types', label: 'Creature Types' },
]

/** Small always-valid set, used to validate `fromQuery` matches before the live catalog has loaded. */
const FALLBACK_TYPES = new Set([
  'creature',
  'instant',
  'sorcery',
  'artifact',
  'enchantment',
  'planeswalker',
  'land',
  'battle',
  'legendary',
  'basic',
  'snow',
  'tribal',
  'kindred',
  'world',
])

let groups: TypeCategoryGroup[] | null = null
let loadPromise: Promise<void> | null = null
let loadError: string | null = null

async function fetchCatalog(category: TypeCategory): Promise<string[]> {
  const response = await fetch(`${CATALOG_ENDPOINT}/${category}`)
  if (!response.ok) throw new Error(`Failed to fetch ${category} (${response.status})`)
  const body = await response.json()
  return Array.isArray(body.data) ? body.data : []
}

async function load(): Promise<void> {
  const lists = await Promise.all(TYPE_CATEGORIES.map((c) => fetchCatalog(c.category)))
  groups = TYPE_CATEGORIES.map((c, i) => ({
    category: c.category,
    label: c.label,
    types: lists[i],
  }))
}

/** Fetches all 9 type catalogs at most once; safe to call repeatedly. Not called at startup. */
export function ensureTypeCatalogLoaded(): Promise<void> {
  if (groups) return Promise.resolve()
  if (!loadPromise) {
    loadError = null
    loadPromise = load().catch((error: unknown) => {
      loadError = error instanceof Error ? error.message : 'Failed to load the type catalog.'
      loadPromise = null
      throw error
    })
  }
  return loadPromise
}

export function isTypeCatalogLoaded(): boolean {
  return groups !== null
}

export function getTypeCatalogLoadError(): string | null {
  return loadError
}

export function getAllTypeGroups(): TypeCategoryGroup[] {
  return groups ?? []
}

/** True if the live catalog confirms this, or — before it's loaded — if it's in the small safe fallback set. */
export function isKnownType(type: string): boolean {
  const lower = type.toLowerCase()
  if (groups) return groups.some((g) => g.types.some((t) => t.toLowerCase() === lower))
  return FALLBACK_TYPES.has(lower)
}
