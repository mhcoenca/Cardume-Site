import { tokenizeQuery } from '@/query/tokenizeQuery'

/** Quotes a free-text operand for Scryfall syntax when it contains whitespace. */
export function formatTextOperand(value: string): string {
  const trimmed = value.trim()
  return trimmed.includes(' ') ? `"${trimmed}"` : trimmed
}

/**
 * Formats free-text prose search input (Oracle Text, Flavor Text, Lore
 * Finder) as one `operator:word` clause per word, ANDed together — matching
 * how Scryfall's own bare/unquoted multi-word text search behaves. Treating
 * the whole phrase as one literal substring (what `formatTextOperand` does)
 * is wrong here: real card text is virtually never a verbatim match for an
 * arbitrary multi-word search, so a query like `o:"whenever gain life
 * untap"` matches nothing even though cards satisfying all four words
 * individually clearly exist.
 *
 * A user-typed quoted segment (e.g. entering `"draw a card"` with the quote
 * characters) survives as one literal-phrase token instead of being split —
 * `tokenizeQuery` already returns each quoted span pre-formatted with its
 * quotes intact, so it's appended after the operator as-is, unlike a bare
 * word.
 */
export function formatMultiWordClause(operator: string, value: string): string {
  return tokenizeQuery(value.trim())
    .map((token) => `${operator}:${token}`)
    .join(' ')
}
