/** Quotes a free-text operand for Scryfall syntax when it contains whitespace. */
export function formatTextOperand(value: string): string {
  const trimmed = value.trim()
  return trimmed.includes(' ') ? `"${trimmed}"` : trimmed
}
