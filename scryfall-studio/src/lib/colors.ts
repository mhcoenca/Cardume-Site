import { manaSymbolIconUrl } from './manaSymbols'

export type ColorCode = 'W' | 'U' | 'B' | 'R' | 'G' | 'C'

/** Sort order for the 5 true colors. Colorless ('C') is handled separately — see colorClause.ts. */
export const WUBRG_ORDER: ColorCode[] = ['W', 'U', 'B', 'R', 'G']

export const COLOR_OPTIONS: { code: ColorCode; label: string; iconUrl: string }[] = [
  { code: 'W', label: 'White', iconUrl: manaSymbolIconUrl('W') },
  { code: 'U', label: 'Blue', iconUrl: manaSymbolIconUrl('U') },
  { code: 'B', label: 'Black', iconUrl: manaSymbolIconUrl('B') },
  { code: 'R', label: 'Red', iconUrl: manaSymbolIconUrl('R') },
  { code: 'G', label: 'Green', iconUrl: manaSymbolIconUrl('G') },
  { code: 'C', label: 'Colorless', iconUrl: manaSymbolIconUrl('C') },
]

export function sortColors(colors: string[]): string[] {
  return [...colors].sort(
    (a, b) => WUBRG_ORDER.indexOf(a as ColorCode) - WUBRG_ORDER.indexOf(b as ColorCode),
  )
}
