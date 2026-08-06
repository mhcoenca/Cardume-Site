import type { LucideIcon } from 'lucide-react'

export type QueryClauseInputType =
  | 'text'
  | 'oracle-tag'
  | 'reverse-oracle-tag'
  | 'type-line'
  | 'mana-cost'
  | 'multi-select'
  | 'color-operator-multiselect'
  | 'operator-number'
  | 'price'
  | 'criteria'
  | 'legality'
  | 'checkbox'
  | 'select'

export interface QueryClauseMetadata {
  /** Extra search terms that should surface this clause without knowing its operator. */
  keywords?: string[]
  /** Alternative names/operators Scryfall accepts for the same clause. */
  aliases?: string[]
  /** Example rendered queries, shown to teach the syntax. */
  examples?: string[]
  /** Link to the relevant Scryfall syntax documentation. */
  docsUrl?: string
  /** Placeholder text shown inside the clause's input. */
  placeholder?: string
  /** Short explanation shown in a tooltip next to the clause. */
  tooltip?: string
  /**
   * Longer-form syntax nuances, each one rendered as its own line in a
   * dedicated help dialog (triggered by a (?) button next to the input) —
   * for fields whose search behavior has real gotchas worth spelling out,
   * not just a one-line tooltip's worth.
   */
  helpText?: string[]
}

export interface QueryClauseOption {
  value: string
  label: string
  /** Optional icon shown before the label, e.g. official MTG mana symbols for colors. */
  iconUrl?: string
}

export interface QueryClause<TValue = unknown> {
  id: string
  label: string
  description: string
  category: string
  icon: LucideIcon
  operator: string
  inputType: QueryClauseInputType
  /** Static choices for 'select' and multi-select input types. */
  options?: QueryClauseOption[]
  defaultValue: TValue
  /**
   * Always present in the canvas, at the top, and can't be removed or
   * reordered — for the one or two clauses so fundamental they aren't
   * really "optional filters" (e.g. Card Name). Not offered in the sidebar.
   */
  pinned?: boolean
  /** Serializes the clause's current value into its Scryfall query (`q`) fragment. */
  toQuery: (value: TValue) => string
  /**
   * For clauses whose effect is a URL param rather than a query fragment.
   * Most clauses don't need this.
   */
  toUrlParams?: (value: TValue) => Record<string, string>
  /**
   * Reconstructs the clause's value from a single query token. Used by the
   * URL-import parser to recognize known fragments; return null to leave a
   * token unrecognized (it stays in the opaque base query).
   */
  fromQuery?: (fragment: string) => TValue | null
  validate?: (value: TValue) => boolean
  metadata?: QueryClauseMetadata
}

/** A `QueryClause` with its generic erased, as stored in the registry. */
export type AnyQueryClause = QueryClause<any>
