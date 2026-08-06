import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export interface CopyboardCard {
  id: string
  name: string
}

const STORAGE_KEY = 'scryfall-studio-copyboard'

function getInitialCards(): CopyboardCard[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

interface CopyboardValue {
  cards: CopyboardCard[]
  /** Dedupes by id — sending a card already on the board is a no-op for it. */
  addCards: (cards: CopyboardCard[]) => void
  removeCard: (id: string) => void
  clear: () => void
}

const CopyboardContext = createContext<CopyboardValue | null>(null)

export function CopyboardProvider({ children }: { children: ReactNode }) {
  const [cards, setCards] = useState<CopyboardCard[]>(getInitialCards)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
  }, [cards])

  const value = useMemo<CopyboardValue>(
    () => ({
      cards,
      addCards: (newCards) => {
        setCards((current) => {
          const existingIds = new Set(current.map((c) => c.id))
          const toAdd = newCards.filter((c) => !existingIds.has(c.id))
          return toAdd.length ? [...current, ...toAdd] : current
        })
      },
      removeCard: (id) => {
        setCards((current) => current.filter((c) => c.id !== id))
      },
      clear: () => setCards([]),
    }),
    [cards],
  )

  return <CopyboardContext.Provider value={value}>{children}</CopyboardContext.Provider>
}

export function useCopyboard(): CopyboardValue {
  const context = useContext(CopyboardContext)
  if (!context) {
    throw new Error('useCopyboard must be used within a CopyboardProvider')
  }
  return context
}
