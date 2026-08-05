import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { BuilderCanvas } from '@/components/clauses/BuilderCanvas'
import { ResultsPanel } from '@/components/results/ResultsPanel'
import { useQueryStore } from '@/store/useQueryStore'

/** Query builder on top, live results underneath — the "document" and its output. */
export function CanvasArea() {
  const { query, resultParams, instances } = useQueryStore()
  const [filtersExpanded, setFiltersExpanded] = useState(true)
  const [resultsExpanded, setResultsExpanded] = useState(true)

  const showFiltersToggle = instances.length > 0
  const showResultsToggle = query.trim().length > 0

  return (
    <div className="flex flex-col">
      {filtersExpanded && <BuilderCanvas />}

      {(showFiltersToggle || showResultsToggle) && (
        <div className="flex justify-center gap-2 border-b border-border py-4">
          {showFiltersToggle && (
            <button
              type="button"
              onClick={() => setFiltersExpanded((e) => !e)}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {filtersExpanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  Hide Filters
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  Show Filters ({instances.length})
                </>
              )}
            </button>
          )}

          {showResultsToggle && (
            <button
              type="button"
              onClick={() => setResultsExpanded((e) => !e)}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {resultsExpanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  Hide Results
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  Show Results
                </>
              )}
            </button>
          )}
        </div>
      )}

      {resultsExpanded && <ResultsPanel query={query} params={resultParams} />}
    </div>
  )
}
