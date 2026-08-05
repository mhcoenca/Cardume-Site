import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react'
import { getQueryClause } from '@/clauses/registry'
import { buildScryfallUrl, parseScryfallUrl } from '@/lib/scryfallUrl'
import { DEFAULT_SORT, sortToUrlParams, type SortValue } from '@/lib/sortOptions'
import { buildQuery } from '@/query/buildQuery'
import { buildUrlParams } from '@/query/buildUrlParams'
import { parseQuery } from '@/query/parseQuery'
import type { QueryClauseInstance } from '@/query/types'

interface QueryState {
  instances: QueryClauseInstance[]
  /** Raw `q` as imported, unmodified — shown as-is in the Workspace. */
  importedQuery: string | null
  /** The portion of the (possibly imported) query no registered clause recognized. */
  baseQuery: string
  importedParams: URLSearchParams | null
  /** Not a clause — never affects `q`, only the result URL/fetch. Fixed control on the Results bar. */
  sort: SortValue
}

type QueryAction =
  | { type: 'ADD_CLAUSE'; clauseId: string }
  | { type: 'REMOVE_INSTANCE'; instanceId: string }
  | { type: 'UPDATE_VALUE'; instanceId: string; value: unknown }
  | { type: 'MOVE_INSTANCE'; instanceId: string; direction: 'up' | 'down' }
  | {
      type: 'IMPORT_URL'
      importedQuery: string
      residual: string
      recognizedInstances: QueryClauseInstance[]
      params: URLSearchParams
    }
  | { type: 'CLEAR_IMPORT' }
  | { type: 'SET_SORT'; sort: SortValue }

const initialState: QueryState = {
  instances: [],
  importedQuery: null,
  baseQuery: '',
  importedParams: null,
  sort: DEFAULT_SORT,
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
    case 'IMPORT_URL':
      return {
        ...state,
        importedQuery: action.importedQuery,
        baseQuery: action.residual,
        importedParams: action.params,
        instances: [...action.recognizedInstances, ...state.instances],
      }
    case 'CLEAR_IMPORT':
      return { ...state, importedQuery: null, baseQuery: '', importedParams: null }
    case 'SET_SORT':
      return { ...state, sort: action.sort }
    default:
      return state
  }
}

interface QueryStoreValue {
  instances: QueryClauseInstance[]
  /** Raw `q` as imported, unmodified — null if nothing was imported. */
  importedQuery: string | null
  hasImport: boolean
  /** The full query: unrecognized imported portion + every clause's toQuery(). */
  query: string
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
  addClause: (clauseId: string) => void
  removeInstance: (instanceId: string) => void
  updateInstanceValue: (instanceId: string, value: unknown) => void
  moveInstance: (instanceId: string, direction: 'up' | 'down') => void
  /**
   * Attempts to import a Scryfall search URL. Returns false if it isn't one.
   * Recognized fragments of its query become clause cards; the rest stays
   * an opaque base query, same as before.
   */
  importUrl: (rawUrl: string) => boolean
  clearImport: () => void
}

const QueryStoreContext = createContext<QueryStoreValue | null>(null)

export function QueryStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(queryReducer, initialState)

  const value = useMemo<QueryStoreValue>(() => {
    const additions = buildQuery(state.instances)
    const query = [state.baseQuery, additions].filter(Boolean).join(' ')

    const mergedParams = new URLSearchParams(state.importedParams ?? undefined)
    for (const [key, val] of Object.entries(buildUrlParams(state.instances))) {
      mergedParams.set(key, val)
    }
    for (const [key, val] of Object.entries(sortToUrlParams(state.sort))) {
      mergedParams.set(key, val)
    }

    return {
      instances: state.instances,
      importedQuery: state.importedQuery,
      hasImport: state.importedParams !== null,
      query,
      url: buildScryfallUrl(query, mergedParams),
      resultParams: Object.fromEntries(mergedParams.entries()),
      sort: state.sort,
      setSort: (sort) => dispatch({ type: 'SET_SORT', sort }),
      addClause: (clauseId) => dispatch({ type: 'ADD_CLAUSE', clauseId }),
      removeInstance: (instanceId) => dispatch({ type: 'REMOVE_INSTANCE', instanceId }),
      updateInstanceValue: (instanceId, value) =>
        dispatch({ type: 'UPDATE_VALUE', instanceId, value }),
      moveInstance: (instanceId, direction) =>
        dispatch({ type: 'MOVE_INSTANCE', instanceId, direction }),
      importUrl: (rawUrl) => {
        const parsed = parseScryfallUrl(rawUrl)
        if (!parsed) return false
        const { instances: recognizedInstances, residual } = parseQuery(parsed.baseQuery)
        dispatch({
          type: 'IMPORT_URL',
          importedQuery: parsed.baseQuery,
          residual,
          recognizedInstances,
          params: parsed.params,
        })
        return true
      },
      clearImport: () => dispatch({ type: 'CLEAR_IMPORT' }),
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
