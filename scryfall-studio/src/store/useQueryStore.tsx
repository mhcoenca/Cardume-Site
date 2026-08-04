import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react'
import { getQueryClause } from '@/clauses/registry'
import { buildScryfallUrl, parseScryfallUrl } from '@/lib/scryfallUrl'
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

const initialState: QueryState = {
  instances: [],
  importedQuery: null,
  baseQuery: '',
  importedParams: null,
}

function queryReducer(state: QueryState, action: QueryAction): QueryState {
  switch (action.type) {
    case 'ADD_CLAUSE': {
      const clause = getQueryClause(action.clauseId)
      if (!clause) return state
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
  /** The final Scryfall search URL: query + imported params + any clause-driven params (Sort, Display…). */
  url: string
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

    return {
      instances: state.instances,
      importedQuery: state.importedQuery,
      hasImport: state.importedParams !== null,
      query,
      url: buildScryfallUrl(query, mergedParams),
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
