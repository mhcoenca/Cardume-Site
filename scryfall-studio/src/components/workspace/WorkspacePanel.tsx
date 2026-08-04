import { useState, type ReactNode } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useQueryStore } from '@/store/useQueryStore'
import { QueryActions } from './QueryActions'
import { QueryPreview } from './QueryPreview'

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      {children}
    </div>
  )
}

export function WorkspacePanel() {
  const [expanded, setExpanded] = useState(false)
  const { query, url, importedQuery, hasImport } = useQueryStore()

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-1.5 p-4 text-left hover:bg-accent"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="text-sm font-semibold text-foreground">Workspace</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {expanded ? '' : 'Generate a query URL for Scryfall'}
        </span>
      </button>

      {expanded && (
        <div className="flex flex-col gap-4 px-4 pb-4">
          {hasImport && (
            <Section label="Imported Query">
              <code className="block rounded-md border border-border bg-muted/30 p-2 font-mono text-xs break-words text-foreground">
                {importedQuery || <span className="text-muted-foreground">(empty)</span>}
              </code>
            </Section>
          )}

          <Section label="Generated Query">
            <QueryPreview query={query} />
          </Section>

          <Section label="Final URL">
            <QueryPreview query={url} />
          </Section>

          <QueryActions query={query} url={url} />
        </div>
      )}
    </div>
  )
}
