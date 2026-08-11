import type { ArtTagValue } from './types'

const STORAGE_KEY = 'scryfall-studio:recent-art-tags'
const MAX_RECENT = 8

function readAll(): ArtTagValue[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as ArtTagValue[]) : []
  } catch {
    return []
  }
}

export function getRecentArtTags(): ArtTagValue[] {
  return readAll()
}

export function addRecentArtTag(value: ArtTagValue): void {
  const next = [value, ...readAll().filter((tag) => tag.id !== value.id)].slice(0, MAX_RECENT)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Storage unavailable (private browsing, quota) — recency just won't persist.
  }
}
