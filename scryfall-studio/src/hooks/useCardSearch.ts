import { useEffect, useRef, useState } from 'react'
import {
  fetchNextPage,
  isAbortError,
  searchCards,
  type CardSearchError,
  type ScryfallCard,
} from '@/services/scryfall/searchCards'

// Applies to every query change, not just typing — but a click/select isn't
// sensitive to debounce length the way composing a multi-word phrase
// (Oracle Text, Flavor Text, Lore Finder) is, so a global bump is the
// simplest fix: gives more room to finish a phrase before an intermediate,
// soon-to-change partial match re-renders the whole results grid, without
// making clicks/selections feel meaningfully slower.
const DEBOUNCE_MS = 800

interface CardSearchState {
  cards: ScryfallCard[]
  totalCards: number
  loading: boolean
  loadingMore: boolean
  error: CardSearchError | null
  hasMore: boolean
}

const EMPTY_STATE: CardSearchState = {
  cards: [],
  totalCards: 0,
  loading: false,
  loadingMore: false,
  error: null,
  hasMore: false,
}

/**
 * Debounced, cancelable, paginated card search against Scryfall's live API.
 * `params` are extra query-string params (e.g. Sort's `order`) layered onto
 * the request — pass a new object each render, it's compared by value.
 */
export function useCardSearch(query: string, params: Record<string, string> = {}) {
  const [state, setState] = useState<CardSearchState>(EMPTY_STATE)
  const nextPageRef = useRef<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const paramsKey = JSON.stringify(params)

  useEffect(() => {
    abortRef.current?.abort()
    const trimmed = query.trim()

    if (!trimmed) {
      nextPageRef.current = null
      setState(EMPTY_STATE)
      return
    }

    const timeout = setTimeout(() => {
      const controller = new AbortController()
      abortRef.current = controller
      // Clear previous results up front — the preview should always reflect
      // the current query, never a stale card grid left over from before it
      // changed (e.g. while loading, or if the new query matches nothing).
      setState({ ...EMPTY_STATE, loading: true })

      searchCards(trimmed, JSON.parse(paramsKey), controller.signal)
        .then((result) => {
          nextPageRef.current = result.nextPage
          setState({
            cards: result.cards,
            totalCards: result.totalCards,
            loading: false,
            loadingMore: false,
            error: null,
            hasMore: result.hasMore,
          })
        })
        .catch((error: unknown) => {
          if (isAbortError(error)) return
          setState({ ...EMPTY_STATE, loading: false, error: error as CardSearchError })
        })
    }, DEBOUNCE_MS)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- paramsKey is the stable, by-value form of params
  }, [query, paramsKey])

  async function loadMore() {
    const nextPage = nextPageRef.current
    if (!nextPage || state.loadingMore) return
    setState((s) => ({ ...s, loadingMore: true }))
    try {
      const result = await fetchNextPage(nextPage)
      nextPageRef.current = result.nextPage
      setState((s) => ({
        ...s,
        cards: [...s.cards, ...result.cards],
        loadingMore: false,
        hasMore: result.hasMore,
      }))
    } catch (error) {
      setState((s) => ({ ...s, loadingMore: false, error: error as CardSearchError }))
    }
  }

  return { ...state, loadMore }
}
