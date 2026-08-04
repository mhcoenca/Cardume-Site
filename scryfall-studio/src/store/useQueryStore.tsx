import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react'
import { getQueryClause } from '@/clauses/registry'
import { buildScryfallUrl, parseScryfallUrl } from '@/lib/scryfallUrl'
import { buildQuery } from '@/query/buildQuery'
import type { QueryClauseInstance } from '@/query/types'

interface QueryState {
  instances: QueryClauseInstance[]
  baseQuery: string
  importedParams: URLSearchParams | null
}

type QueryAction =
  | { type: 'ADD_CLAUSE'; clauseId: string }
  | { type: 'REMOVE_INSTANCE'; instanceId: string }
  | { type: 'UPDATE_VALUE'; instanceId: string; value: unknown }
  | { type: 'MOVE_INSTANCE'; instanceId: string; direction: 'up' | 'down' }
  | { type: 'IMPORT_URL'; baseQuery: string; params: URLSearchParams }
  | { type: 'CLEAR_IMPORT' }

const initialState: QueryState = { instances: [], baseQuery: '', importedParams: null }

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
      return { ...state, baseQuery: action.baseQuery, importedParams: action.params }
    case 'CLEAR_IMPORT':
      return { ...state, baseQuery: '', importedParams: null }
    default:
      return state
  }
}

interface QueryStoreValue {
  instances: QueryClauseInstance[]
  baseQuery: string
  hasImport: boolean
  /** The full query, combining the imported base query with clause additions. */
  query: string
  /** The final Scryfall search URL, preserving any imported params (order, as, prefer…). */
  url: string
  addClause: (clauseId: string) => void
  removeInstance: (instanceId: string) => void
  updateInstanceValue: (instanceId: string, value: unknown) => void
  moveInstance: (instanceId: string, direction: 'up' | 'down') => void
  /** Attempts to import a Scryfall search URL. Returns false if it isn't one. */
  importUrl: (rawUrl: string) => boolean
  clearImport: () => void
}

const QueryStoreContext = createContext<QueryStoreValue | null>(null)

export function QueryStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(queryReducer, initialState)

  const value = useMemo<QueryStoreValue>(() => {
    const additions = buildQuery(state.instances)
    const query = [state.baseQuery, additions].filter(Boolean).join(' ')

    return {
      instances: state.instances,
      baseQuery: state.baseQuery,
      hasImport: state.importedParams !== null,
      query,
      url: buildScryfallUrl(query, state.importedParams ?? undefined),
      addClause: (clauseId) => dispatch({ type: 'ADD_CLAUSE', clauseId }),
      removeInstance: (instanceId) => dispatch({ type: 'REMOVE_INSTANCE', instanceId }),
      updateInstanceValue: (instanceId, value) =>
        dispatch({ type: 'UPDATE_VALUE', instanceId, value }),
      moveInstance: (instanceId, direction) =>
        dispatch({ type: 'MOVE_INSTANCE', instanceId, direction }),
      importUrl: (rawUrl) => {
        const parsed = parseScryfallUrl(rawUrl)
        if (!parsed) return false
        dispatch({ type: 'IMPORT_URL', baseQuery: parsed.baseQuery, params: parsed.params })
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
