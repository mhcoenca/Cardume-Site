/**
 * Splits a Scryfall query into whitespace-separated tokens, without
 * breaking apart quoted phrases (`o:"draw a card"`) or parenthesized
 * groups (`(t:creature or t:artifact)`) — both must survive as one token
 * for clause `fromQuery` matchers to recognize them.
 */
export function tokenizeQuery(query: string): string[] {
  const tokens: string[] = []
  let current = ''
  let parenDepth = 0
  let inQuotes = false

  for (const char of query) {
    if (char === '"') {
      inQuotes = !inQuotes
      current += char
      continue
    }
    if (!inQuotes) {
      if (char === '(') parenDepth++
      if (char === ')') parenDepth = Math.max(0, parenDepth - 1)
    }

    if (!inQuotes && parenDepth === 0 && /\s/.test(char)) {
      if (current) tokens.push(current)
      current = ''
      continue
    }
    current += char
  }
  if (current) tokens.push(current)
  return tokens
}
