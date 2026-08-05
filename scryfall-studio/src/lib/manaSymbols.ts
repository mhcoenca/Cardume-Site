/**
 * Scryfall's own hosted mana symbol SVGs — the official MTG pip icons.
 * Hybrid/Phyrexian tokens like "W/U" or "B/G/P" have their slashes
 * stripped in the filename (e.g. "WU.svg", "BGP.svg"), confirmed against
 * api.scryfall.com/symbology.
 */
export function manaSymbolIconUrl(token: string): string {
  const filename = token.replace(/\//g, '').toUpperCase()
  return `https://svgs.scryfall.io/card-symbols/${filename}.svg`
}

/** Splits a mana cost string into its symbol tokens — handles both the
 * canonical `{2}{G}{G}` form and Scryfall's bare shorthand (`2GG`). */
export function parseManaCostTokens(raw: string): string[] {
  const tokens: string[] = []
  const pattern = /\{([^}]+)\}|([0-9]+|[WUBRGCXYZS])/gi
  let match: RegExpExecArray | null
  while ((match = pattern.exec(raw))) {
    tokens.push((match[1] ?? match[2]).toUpperCase())
  }
  return tokens
}

/** Always serializes back to the unambiguous, canonical bracketed form. */
export function formatManaCostTokens(tokens: string[]): string {
  return tokens.map((token) => `{${token}}`).join('')
}

const VARIABLE_ORDER = ['X', 'Y', 'Z']
const COLOR_ORDER = ['W', 'U', 'B', 'R', 'G']

/**
 * Rank within the order symbols appear on a real printed card: variables
 * (X/Y/Z), then the generic number, then WUBRG colors, then colorless
 * ({C}) — confirmed against printed mana_cost values via the Scryfall API
 * (e.g. "Assault on Osgiliath" {X}{R}{R}{R}, "Primeval Spawn" {5}{W}{U}{B}{R}{G},
 * "Breaker of Creation" {6}{C}{C}). No printed card combines {C} with a
 * colored pip, so C-vs-color tie-breaking is unverified; placed last as
 * the closest read of the rules. Anything else (hybrid/phyrexian, only
 * ever produced via the color-variant picker, e.g. hybrid/Phyrexian) sorts
 * after that.
 */
function tokenRank(token: string): number {
  if (VARIABLE_ORDER.includes(token)) return 0
  if (/^\d+$/.test(token)) return 1
  const colorIndex = COLOR_ORDER.indexOf(token)
  if (colorIndex !== -1) return 2 + colorIndex
  if (token === 'C') return 7
  return 8
}

/** Reorders tokens to match how mana costs are actually printed on cards. */
export function sortManaCostTokens(tokens: string[]): string[] {
  return tokens
    .map((token, index) => ({ token, index }))
    .sort((a, b) => tokenRank(a.token) - tokenRank(b.token) || a.index - b.index)
    .map(({ token }) => token)
}

export type BaseManaColor = 'W' | 'U' | 'B' | 'R' | 'G'

/** Human-readable labels for every hybrid/Phyrexian/generic-hybrid symbol,
 * sourced verbatim from api.scryfall.com/symbology's `english` field. */
const VARIANT_LABELS: Record<string, string> = {
  'W/U': 'White or blue',
  'W/B': 'White or black',
  'R/W': 'Red or white',
  'G/W': 'Green or white',
  'U/B': 'Blue or black',
  'U/R': 'Blue or red',
  'G/U': 'Green or blue',
  'B/R': 'Black or red',
  'B/G': 'Black or green',
  'R/G': 'Red or green',
  'G/W/P': 'Green, white, or 2 life',
  'R/W/P': 'Red, white, or 2 life',
  'W/B/P': 'White, black, or 2 life',
  'W/U/P': 'White, blue, or 2 life',
  'G/U/P': 'Green, blue, or 2 life',
  'U/B/P': 'Blue, black, or 2 life',
  'U/R/P': 'Blue, red, or 2 life',
  'B/G/P': 'Black, green, or 2 life',
  'B/R/P': 'Black, red, or 2 life',
  'R/G/P': 'Red, green, or 2 life',
  'C/W': 'Colorless or white',
  'C/U': 'Colorless or blue',
  'C/B': 'Colorless or black',
  'C/R': 'Colorless or red',
  'C/G': 'Colorless or green',
  '2/W': 'Two generic or white',
  '2/U': 'Two generic or blue',
  '2/B': 'Two generic or black',
  '2/R': 'Two generic or red',
  '2/G': 'Two generic or green',
  'W/P': 'White or 2 life',
  'U/P': 'Blue or 2 life',
  'B/P': 'Black or 2 life',
  'R/P': 'Red or 2 life',
  'G/P': 'Green or 2 life',
}

/** Every non-basic symbol that involves a given color — hybrid, Phyrexian,
 * hybrid-Phyrexian, colorless-hybrid, and generic-hybrid — in the order
 * Scryfall itself lists them for that color in its symbology data. */
const COLOR_VARIANT_TOKENS: Record<BaseManaColor, string[]> = {
  W: ['W/U', 'W/B', 'R/W', 'G/W', 'G/W/P', 'R/W/P', 'W/B/P', 'W/U/P', 'C/W', '2/W', 'W/P'],
  U: ['W/U', 'U/B', 'U/R', 'G/U', 'G/U/P', 'U/B/P', 'U/R/P', 'W/U/P', 'C/U', '2/U', 'U/P'],
  B: ['W/B', 'B/R', 'B/G', 'U/B', 'B/G/P', 'B/R/P', 'U/B/P', 'W/B/P', 'C/B', '2/B', 'B/P'],
  R: ['B/R', 'U/R', 'R/G', 'R/W', 'B/R/P', 'R/G/P', 'R/W/P', 'U/R/P', 'C/R', '2/R', 'R/P'],
  G: ['B/G', 'R/G', 'G/W', 'G/U', 'B/G/P', 'G/U/P', 'G/W/P', 'R/G/P', 'C/G', '2/G', 'G/P'],
}

export interface ManaSymbolVariant {
  token: string
  label: string
}

export function getColorVariants(color: BaseManaColor): ManaSymbolVariant[] {
  return COLOR_VARIANT_TOKENS[color].map((token) => ({ token, label: VARIANT_LABELS[token] }))
}

export const BASE_COLOR_LABELS: Record<BaseManaColor, string> = {
  W: 'White',
  U: 'Blue',
  B: 'Black',
  R: 'Red',
  G: 'Green',
}
