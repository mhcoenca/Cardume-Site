import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { getQueryClause } from '@/clauses/registry'
import { formatMultiWordClause } from '@/lib/textOperand'
import { buildScryfallUrl, parseScryfallUrl } from '@/lib/scryfallUrl'
import { DEFAULT_SORT, sortToUrlParams, type SortValue } from '@/lib/sortOptions'
import { readUrlState, writeUrlState } from '@/lib/urlState'
import { buildQuery } from '@/query/buildQuery'
import { buildUrlParams } from '@/query/buildUrlParams'
import {
  extractBareSearchWords,
  extractCardNameToken,
  extractPrintedOnlyToken,
  parseQuery,
} from '@/query/parseQuery'
import type { QueryClauseInstance } from '@/query/types'

interface QueryState {
  instances: QueryClauseInstance[]
  /** Fixed header field, not a clause — applies to every search unconditionally. */
  cardName: string
  /** Fixed header field, not a clause — emits `-is:digital` globally, default on. */
  printedOnly: boolean
  /** The portion of the (possibly imported) query no registered clause recognized. */
  baseQuery: string
  importedParams: URLSearchParams | null
  /** Not a clause — never affects `q`, only the result URL/fetch. Fixed control on the Results bar. */
  sort: SortValue
}

type QueryAction =
  | { type: 'ADD_CLAUSE'; clauseId: string }
  | { type: 'SET_CLAUSE_VALUE'; clauseId: string; value: unknown }
  | { type: 'REMOVE_INSTANCE'; instanceId: string }
  | { type: 'UPDATE_VALUE'; instanceId: string; value: unknown }
  | { type: 'MOVE_INSTANCE'; instanceId: string; direction: 'up' | 'down' }
  | { type: 'SET_CARD_NAME'; name: string }
  | { type: 'SET_PRINTED_ONLY'; printedOnly: boolean }
  | {
      type: 'IMPORT_URL'
      residual: string
      recognizedInstances: QueryClauseInstance[]
      params: URLSearchParams
      cardName: string | null
      printedOnly: boolean
    }
  | { type: 'SET_SORT'; sort: SortValue }
  | { type: 'RESET' }

function freshState(): QueryState {
  return {
    instances: [],
    cardName: '',
    printedOnly: true,
    baseQuery: '',
    importedParams: null,
    sort: DEFAULT_SORT,
  }
}

// Built lazily (as useReducer's third arg) rather than at module load — this
// file can be reached before `@/clauses/plugins`'s registration side effects
// have run, depending on import order elsewhere, so the registry can't be
// trusted until a component actually mounts.
function createInitialState(): QueryState {
  const shared = readUrlState()
  if (!shared) {
    return freshState()
  }

  return {
    instances: shared.instances,
    cardName: shared.cardName,
    printedOnly: shared.printedOnly,
    baseQuery: '',
    importedParams: null,
    sort: shared.sort,
  }
}

function queryReducer(state: QueryState, action: QueryAction): QueryState {
  switch (action.type) {
    case 'ADD_CLAUSE': {
      const clause = getQueryClause(action.clauseId)
      if (!clause) return state
      // Each clause type can only appear once — a second Flavor Text card,
      // say, wouldn't mean anything the first one couldn't already express.
      if (state.instances.some((i) => i.clauseId === action.clauseId)) return state
      const instance: QueryClauseInstance = {
        instanceId: crypto.randomUUID(),
        clauseId: clause.id,
        value: clause.defaultValue,
      }
      return { ...state, instances: [...state.instances, instance] }
    }
    // Adds the clause if missing, or updates it in place if already present
    // — the atomic "upsert" ADD_CLAUSE + UPDATE_VALUE can't express, since
    // ADD_CLAUSE only dispatches; it doesn't hand back the new instanceId
    // an immediately-following UPDATE_VALUE would need. Used by the
    // ?lookup= deep-link bootstrap, where the value is only known once an
    // async fetch resolves, after the initial render.
    case 'SET_CLAUSE_VALUE': {
      const clause = getQueryClause(action.clauseId)
      if (!clause) return state
      const existingIndex = state.instances.findIndex((i) => i.clauseId === action.clauseId)
      if (existingIndex === -1) {
        const instance: QueryClauseInstance = {
          instanceId: crypto.randomUUID(),
          clauseId: clause.id,
          value: action.value,
        }
        return { ...state, instances: [...state.instances, instance] }
      }
      const instances = [...state.instances]
      instances[existingIndex] = { ...instances[existingIndex], value: action.value }
      return { ...state, instances }
    }
    case 'REMOVE_INSTANCE':
      return {
        ...state,
        instances: state.instances.filter((i) => i.instanceId !== action.instanceId),
      }
    case 'UPDATE_VALUE':
      return {
        ...state,
        instances: state.instances.map((i) =>
          i.instanceId === action.instanceId ? { ...i, value: action.value } : i,
        ),
      }
    case 'MOVE_INSTANCE': {
      const index = state.instances.findIndex((i) => i.instanceId === action.instanceId)
      if (index === -1) return state
      const targetIndex = action.direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= state.instances.length) return state
      const instances = [...state.instances]
      ;[instances[index], instances[targetIndex]] = [instances[targetIndex], instances[index]]
      return { ...state, instances }
    }
    case 'SET_CARD_NAME':
      return { ...state, cardName: action.name }
    case 'SET_PRINTED_ONLY':
      return { ...state, printedOnly: action.printedOnly }
    case 'IMPORT_URL': {
      // Merge by clauseId instead of blindly prepending — re-importing a
      // URL that repeats an already-added clause updates it in place
      // rather than duplicating it.
      const instances = [...state.instances]
      const newInstances: QueryClauseInstance[] = []
      for (const recognized of action.recognizedInstances) {
        const existingIndex = instances.findIndex((i) => i.clauseId === recognized.clauseId)
        if (existingIndex === -1) {
          newInstances.push(recognized)
        } else {
          instances[existingIndex] = { ...instances[existingIndex], value: recognized.value }
        }
      }
      // New clauses surface near the top.
      instances.splice(0, 0, ...newInstances)
      return {
        ...state,
        baseQuery: action.residual,
        importedParams: action.params,
        instances,
        // An imported name: token wins over whatever was already typed —
        // consistent with every other clause's merge-by-recognition above.
        cardName: action.cardName ?? state.cardName,
        printedOnly: action.printedOnly,
      }
    }
    case 'SET_SORT':
      return { ...state, sort: action.sort }
    case 'RESET':
      return freshState()
    default:
      return state
  }
}

interface QueryStoreValue {
  instances: QueryClauseInstance[]
  cardName: string
  setCardName: (name: string) => void
  printedOnly: boolean
  setPrintedOnly: (printedOnly: boolean) => void
  /** The full query: Card Name + Printed Only + unrecognized imported portion + every clause's toQuery(). */
  query: string
  /**
   * Whether there's a deliberate search to run/show — Card Name, at least
   * one clause, or an imported base query. Deliberately excludes Printed
   * Only alone: it's a modifier default-on from a fresh state, not
   * something that should make an untouched app auto-run a search for
   * every non-digital card the moment it loads.
   */
  hasActiveSearch: boolean
  /** The final Scryfall search URL: query + imported params + clause-driven params + Sort. */
  url: string
  /**
   * Same params baked into `url` (imported + clause-driven + Sort), minus
   * `q` — for the in-app Results fetch, which otherwise has no way to know
   * about params like Sort's `order`/`dir`.
   */
  resultParams: Record<string, string>
  sort: SortValue
  setSort: (sort: SortValue) => void
  /** Clears every clause, Card Name, imported URL, and Sort back to a fresh start. */
  resetAll: () => void
  addClause: (clauseId: string) => void
  /** Adds the clause with this value if missing, or updates it in place if present. */
  setClauseValue: (clauseId: string, value: unknown) => void
  removeInstance: (instanceId: string) => void
  updateInstanceValue: (instanceId: string, value: unknown) => void
  moveInstance: (instanceId: string, direction: 'up' | 'down') => void
  /**
   * Attempts to import a Scryfall search URL. Returns false if it isn't one.
   * Recognized fragments of its query become clause cards; a `name:`
   * fragment populates Card Name; the rest stays an opaque base query.
   */
  importUrl: (rawUrl: string) => boolean
}

const QueryStoreContext = createContext<QueryStoreValue | null>(null)

export function QueryStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(queryReducer, undefined, createInitialState)

  // Keeps the address bar itself the shareable link — debounced so typing
  // doesn't rewrite it on every keystroke, and replaceState (never
  // pushState) so it doesn't spam the back button.
  useEffect(() => {
    const timeout = setTimeout(() => {
      writeUrlState(state.instances, state.sort, state.cardName, state.printedOnly)
    }, 500)
    return () => clearTimeout(timeout)
  }, [state.instances, state.sort, state.cardName, state.printedOnly])

  const value = useMemo<QueryStoreValue>(() => {
    // One `name:` token per word, ANDed — matches Scryfall's own bare-word
    // search semantics (confirmed against the API: `name:bolt name:lightning`
    // finds "Lightning Bolt" regardless of word order, while a single quoted
    // `name:"bolt lightning"` phrase matches nothing). A deliberately quoted
    // segment still survives as one literal phrase, same as Oracle Text.
    const nameToken = state.cardName.trim() ? formatMultiWordClause('name', state.cardName) : ''
    const printedOnlyToken = state.printedOnly ? '-is:digital' : ''
    const additions = buildQuery(state.instances)
    const query = [nameToken, printedOnlyToken, state.baseQuery, additions]
      .filter(Boolean)
      .join(' ')

    const mergedParams = new URLSearchParams(state.importedParams ?? undefined)
    for (const [key, val] of Object.entries(buildUrlParams(state.instances))) {
      mergedParams.set(key, val)
    }
    for (const [key, val] of Object.entries(sortToUrlParams(state.sort))) {
      mergedParams.set(key, val)
    }

    return {
      instances: state.instances,
      cardName: state.cardName,
      setCardName: (name) => dispatch({ type: 'SET_CARD_NAME', name }),
      printedOnly: state.printedOnly,
      setPrintedOnly: (printedOnly) => dispatch({ type: 'SET_PRINTED_ONLY', printedOnly }),
      query,
      hasActiveSearch: Boolean(
        state.cardName.trim() || state.instances.length > 0 || state.baseQuery.trim(),
      ),
      url: buildScryfallUrl(query, mergedParams),
      resultParams: Object.fromEntries(mergedParams.entries()),
      sort: state.sort,
      setSort: (sort) => dispatch({ type: 'SET_SORT', sort }),
      resetAll: () => dispatch({ type: 'RESET' }),
      addClause: (clauseId) => dispatch({ type: 'ADD_CLAUSE', clauseId }),
      setClauseValue: (clauseId, value) => dispatch({ type: 'SET_CLAUSE_VALUE', clauseId, value }),
      removeInstance: (instanceId) => dispatch({ type: 'REMOVE_INSTANCE', instanceId }),
      updateInstanceValue: (instanceId, value) =>
        dispatch({ type: 'UPDATE_VALUE', instanceId, value }),
      moveInstance: (instanceId, direction) =>
        dispatch({ type: 'MOVE_INSTANCE', instanceId, direction }),
      importUrl: (rawUrl) => {
        const parsed = parseScryfallUrl(rawUrl)
        if (!parsed) return false
        const { name: explicitName, residual: withoutName } = extractCardNameToken(parsed.baseQuery)
        const { instances: recognizedInstances, residual: withoutClauses } = parseQuery(withoutName)
        const { printedOnly, residual: withoutPrintedOnly } = extractPrintedOnlyToken(withoutClauses)
        // Bare words/phrases in `q` are an implicit name search on Scryfall
        // (`dragon` behaves like `name:dragon`, not `o:dragon`) — folded in
        // after explicit `name:` and every clause has already claimed its
        // tokens, so only genuinely unrecognized words reach here.
        const { words: bareWords, residual } = extractBareSearchWords(withoutPrintedOnly)
        const impliedName = [explicitName, ...bareWords].filter(Boolean).join(' ') || null
        dispatch({
          type: 'IMPORT_URL',
          residual,
          recognizedInstances,
          params: parsed.params,
          cardName: impliedName,
          printedOnly,
        })
        return true
      },
    }
  }, [state])

  return <QueryStoreContext.Provider value={value}>{children}</QueryStoreContext.Provider>
}

export function useQueryStore(): QueryStoreValue {
  const context = useContext(QueryStoreContext)
  if (!context) {
    throw new Error('useQueryStore must be used within a QueryStoreProvider')
  }
  return context
}
