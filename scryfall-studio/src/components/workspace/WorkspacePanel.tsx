import type { ReactNode } from 'react'
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
  const { query, url, importedQuery, hasImport } = useQueryStore()

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-sm font-semibold text-foreground">Workspace</h2>

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
  )
}
