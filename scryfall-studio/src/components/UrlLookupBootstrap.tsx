import { useEffect } from 'react'
import type { ReverseOracleTagValue } from '@/clauses/plugins/reverse-oracle-tag'
import { getCardById } from '@/services/scryfall/cardLookup'
import { ensureOracleTagsLoaded, getOracleTagsForCard } from '@/services/oracleTags/OracleTagService'
import { toOracleTagValue } from '@/services/oracleTags/types'
import { useQueryStore } from '@/store/useQueryStore'

const PARAM_NAME = 'lookup'

function stripParam(): void {
  const params = new URLSearchParams(window.location.search)
  params.delete(PARAM_NAME)
  const rest = params.toString()
  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${rest ? `?${rest}` : ''}${window.location.hash}`,
  )
}

/**
 * Resolves the `?lookup=<scryfall card id>` deep link (from a search
 * result's "Reverse Oracle Tag" menu action, opened in a new tab) into a
 * populated Reverse Oracle Tag clause. Async, so unlike `?state=` this
 * can't happen inside the store's synchronous initial-state construction —
 * it adds the clause with its default value first (same as a user picking
 * it from the sidebar would), then fills it in once the lookup resolves.
 * Renders nothing; mounted once inside QueryStoreProvider.
 */
export function UrlLookupBootstrap() {
  const { setClauseValue } = useQueryStore()

  useEffect(() => {
    const cardId = new URLSearchParams(window.location.search).get(PARAM_NAME)
    if (!cardId) return

    // Stripping the param only happens once this specific effect instance's
    // work actually finishes (success or failure), gated on `cancelled` —
    // not synchronously up front. StrictMode double-invokes effects in dev
    // (mount, cleanup, mount again); stripping early meant the second
    // invocation found no param left to resolve, while the first one's
    // cleanup had already marked it cancelled — net result, nothing ever
    // completed. Production doesn't double-invoke, but the fix is correct
    // either way: cleanup abandons in-flight work without side effects,
    // full stop.
    let cancelled = false

    async function resolve(id: string) {
      const summary = await getCardById(id)
      if (cancelled) return
      if (summary) {
        await ensureOracleTagsLoaded()
        if (cancelled) return
        const tags = getOracleTagsForCard(summary.oracleId).map(toOracleTagValue)
        const value: ReverseOracleTagValue = {
          card: { id: summary.id, name: summary.name, scryfallUri: summary.scryfallUri },
          tags,
          pendingTagIds: tags.map((tag) => tag.id),
          activeTagIds: [],
          combineMode: 'or',
        }
        setClauseValue('reverse-oracle-tag', value)
      }
      stripParam()
    }
    resolve(cardId)

    return () => {
      cancelled = true
    }
    // Runs once per mounted instance — setClauseValue is stable across the
    // QueryStoreProvider's lifetime (recreated only when `state` changes,
    // which this effect itself doesn't trigger until it resolves).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
