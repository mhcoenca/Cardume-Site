export type ColorCode = 'W' | 'U' | 'B' | 'R' | 'G'

export const WUBRG_ORDER: ColorCode[] = ['W', 'U', 'B', 'R', 'G']

export const COLOR_OPTIONS: { code: ColorCode; label: string }[] = [
  { code: 'W', label: 'White' },
  { code: 'U', label: 'Blue' },
  { code: 'B', label: 'Black' },
  { code: 'R', label: 'Red' },
  { code: 'G', label: 'Green' },
]

export function sortColors(colors: string[]): string[] {
  return [...colors].sort(
    (a, b) => WUBRG_ORDER.indexOf(a as ColorCode) - WUBRG_ORDER.indexOf(b as ColorCode),
  )
}
