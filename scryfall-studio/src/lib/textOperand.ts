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

/**
 * The inverse of `formatMultiWordClause`, for the URL-import parser: scans
 * every token for any of the given operator names (Scryfall aliases, e.g.
 * `o`/`oracle`), claims all of them regardless of position, and joins their
 * operands back into one string — round-trips correctly through
 * `formatMultiWordClause` since a claimed quoted operand keeps its quotes,
 * so `tokenizeQuery` treats it as one atomic word again on re-serialize.
 */
export function extractMultiWordTokens(
  operatorNames: string[],
  tokens: string[],
): { value: string; remaining: string[] } | null {
  const pattern = new RegExp(`^(?:${operatorNames.join('|')}):(.+)$`, 'i')
  const words: string[] = []
  const remaining: string[] = []

  for (const token of tokens) {
    const match = pattern.exec(token)
    if (match) {
      words.push(match[1])
    } else {
      remaining.push(token)
    }
  }

  if (!words.length) return null
  return { value: words.join(' '), remaining }
}
