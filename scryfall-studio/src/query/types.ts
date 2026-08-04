export interface QueryClauseInstance<TValue = unknown> {
  instanceId: string
  clauseId: string
  value: TValue
}
