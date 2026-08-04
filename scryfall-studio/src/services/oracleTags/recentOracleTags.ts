import type { OracleTagValue } from './types'

const STORAGE_KEY = 'scryfall-studio:recent-oracle-tags'
const MAX_RECENT = 8

function readAll(): OracleTagValue[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as OracleTagValue[]) : []
  } catch {
    return []
  }
}

export function getRecentOracleTags(): OracleTagValue[] {
  return readAll()
}

export function addRecentOracleTag(value: OracleTagValue): void {
  const next = [value, ...readAll().filter((tag) => tag.id !== value.id)].slice(0, MAX_RECENT)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Storage unavailable (private browsing, quota) — recency just won't persist.
  }
}
