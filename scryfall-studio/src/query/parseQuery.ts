import { listQueryClauses } from '@/clauses/registry'
import { tokenizeQuery } from './tokenizeQuery'
import type { QueryClauseInstance } from './types'

export interface ParsedQuery {
  instances: QueryClauseInstance[]
  /** Tokens no registered clause recognized, rejoined — stays opaque, same as today. */
  residual: string
}

/**
 * Pulls every `name:` token out of a raw query string (unquoted if
 * needed, joined with spaces), for imported URLs — Card Name isn't a
 * registered clause anymore (it's fixed header state), so `parseQuery`
 * below would leave `name:` fragments sitting opaquely in the residual
 * instead of recognizing them. Card Name's own multi-word input
 * serializes as one `name:` token per word (mirroring Oracle Text), so
 * this accumulates all of them rather than just the first. Returns
 * `null` name if no `name:` token is present.
 */
export function extractCardNameToken(query: string): { name: string | null; residual: string } {
  const words: string[] = []
  const residualTokens: string[] = []

  for (const token of tokenizeQuery(query)) {
    // Only a bare `name:` — a negated `-name:` is a different, exclusionary
    // search the header's always-positive Card Name field can't represent,
    // so it's left alone in the residual.
    const match = /^name:(.+)$/i.exec(token)
    if (match) {
      words.push(match[1])
    } else {
      residualTokens.push(token)
    }
  }

  if (!words.length) return { name: null, residual: query }
  return { name: words.join(' '), residual: residualTokens.join(' ') }
}

/**
 * Pulls bare (operator-less) words/phrases out of a raw query string, for
 * imported URLs — confirmed against Scryfall's actual search API that an
 * unprefixed word or `"quoted phrase"` in `q` is an implicit card-name
 * substring search (`dragon` returns exactly as many cards as
 * `name:dragon`, not `o:dragon`), not an oracle-text search. Meant to run
 * *after* `extractCardNameToken` and `parseQuery`, on whatever's left, so
 * it only picks up words no explicit `field:` operator already claimed.
 */
export function extractBareSearchWords(query: string): { words: string[]; residual: string } {
  const words: string[] = []
  const residualTokens: string[] = []

  for (const token of tokenizeQuery(query)) {
    // Comparison-operator clauses (cmc<3, pow>=4…) glue the operator
    // straight onto the field name with no colon — `:` alone isn't a
    // reliable enough test for "this is a structured field expression,
    // not a plain word" and previously let a stray `cmc<3` get swept into
    // Card Name as if it were literally a name search for "cmc<3".
    const isBare = !token.startsWith('-') && !token.startsWith('(') && !/[:<>=!]/.test(token)
    if (!isBare) {
      residualTokens.push(token)
      continue
    }
    const isQuoted = token.length >= 2 && token.startsWith('"') && token.endsWith('"')
    words.push(isQuoted ? token.slice(1, -1) : token)
  }

  return { words, residual: residualTokens.join(' ') }
}

/**
 * Looks for the exact `-is:digital` token Printed Only's own query
 * building emits, so importing a URL correctly reflects whether it
 * excluded digital-only cards — present means Printed Only should turn
 * on, absent means it should turn off (an imported search didn't ask to
 * exclude them, so silently keeping the default-on filter would narrow
 * results the pasted URL never asked to narrow). A bare `is:digital`
 * (digital-only, the opposite filter) is a different, unrelated query and
 * is deliberately left alone in the residual.
 */
export function extractPrintedOnlyToken(query: string): { printedOnly: boolean; residual: string } {
  const tokens = tokenizeQuery(query)
  const index = tokens.findIndex((token) => /^-is:digital$/i.test(token))
  if (index === -1) return { printedOnly: false, residual: query }
  const residual = [...tokens.slice(0, index), ...tokens.slice(index + 1)].join(' ')
  return { printedOnly: true, residual }
}

/**
 * Shared shape for a "grouped multi-value" clause's import parsing: a
 * single bare `operator:value` token anywhere in the list, or one
 * `(...)` token containing 2+ matching values joined by ` OR `/` or `
 * (case-insensitive — Type Line/Oracle Tag emit uppercase, Criteria/
 * Rarity emit lowercase) or plain whitespace (implicit AND). Returns the
 * first match found; null if nothing matches. `itemPattern` must capture
 * the value in its first group.
 */
export function extractGroupedTokens(
  tokens: string[],
  itemPattern: RegExp,
): { items: string[]; combineMode: 'and' | 'or'; remaining: string[] } | null {
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    const groupMatch = /^\((.+)\)$/.exec(token)
    if (groupMatch) {
      const inner = groupMatch[1]
      const isOr = /\sOR\s/i.test(inner)
      const parts = inner.split(isOr ? /\s+OR\s+/i : /\s+/)
      const items: string[] = []
      let ok = parts.length > 1
      for (const part of parts) {
        const match = itemPattern.exec(part)
        if (!match) {
          ok = false
          break
        }
        items.push(match[1])
      }
      if (ok) {
        return {
          items,
          combineMode: isOr ? 'or' : 'and',
          remaining: [...tokens.slice(0, i), ...tokens.slice(i + 1)],
        }
      }
      continue
    }
    const single = itemPattern.exec(token)
    if (single) {
      return {
        items: [single[1]],
        combineMode: 'and',
        remaining: [...tokens.slice(0, i), ...tokens.slice(i + 1)],
      }
    }
  }
  return null
}

/**
 * Tries every registered clause against a raw query string. Multi-token
 * clauses (`fromQueryAll`) get first crack at the whole token list, since
 * they may need to claim more than one token (or a single `(...)` group)
 * to reconstruct their value; whatever's left goes through the original
 * one-token-at-a-time `fromQuery` pass. Driven entirely by the registry —
 * this function has no knowledge of what clauses exist.
 */
export function parseQuery(query: string): ParsedQuery {
  const clauses = listQueryClauses()
  const instances: QueryClauseInstance[] = []
  let tokens = tokenizeQuery(query)

  for (const clause of clauses) {
    if (!clause.fromQueryAll) continue
    const result = clause.fromQueryAll(tokens)
    if (!result) continue
    instances.push({ instanceId: crypto.randomUUID(), clauseId: clause.id, value: result.value })
    tokens = result.remaining
  }

  const residualTokens: string[] = []
  for (const token of tokens) {
    let matched = false
    for (const clause of clauses) {
      if (!clause.fromQuery) continue
      const value = clause.fromQuery(token)
      if (value === null || value === undefined) continue
      instances.push({ instanceId: crypto.randomUUID(), clauseId: clause.id, value })
      matched = true
      break
    }
    if (!matched) residualTokens.push(token)
  }

  return { instances, residual: residualTokens.join(' ') }
}
