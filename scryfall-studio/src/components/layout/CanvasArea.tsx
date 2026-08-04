import { BuilderCanvas } from '@/components/clauses/BuilderCanvas'
import { ResultsPanel } from '@/components/results/ResultsPanel'
import { useQueryStore } from '@/store/useQueryStore'

/** Query builder on top, live results underneath — the "document" and its output. */
export function CanvasArea() {
  const { query, resultParams } = useQueryStore()

  return (
    <div className="flex flex-col">
      <BuilderCanvas />
      <ResultsPanel query={query} params={resultParams} />
    </div>
  )
}
