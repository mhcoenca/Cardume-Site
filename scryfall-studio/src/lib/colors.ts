export type ColorCode = 'W' | 'U' | 'B' | 'R' | 'G' | 'C'

/** Sort order for the 5 true colors. Colorless ('C') is handled separately — see colorClause.ts. */
export const WUBRG_ORDER: ColorCode[] = ['W', 'U', 'B', 'R', 'G']

export const COLOR_OPTIONS: { code: ColorCode; label: string }[] = [
  { code: 'W', label: 'White' },
  { code: 'U', label: 'Blue' },
  { code: 'B', label: 'Black' },
  { code: 'R', label: 'Red' },
  { code: 'G', label: 'Green' },
  { code: 'C', label: 'Colorless' },
]

export function sortColors(colors: string[]): string[] {
  return [...colors].sort(
    (a, b) => WUBRG_ORDER.indexOf(a as ColorCode) - WUBRG_ORDER.indexOf(b as ColorCode),
  )
}
