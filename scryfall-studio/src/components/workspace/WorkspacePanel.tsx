import { useQueryStore } from '@/store/useQueryStore'
import { QueryActions } from './QueryActions'
import { QueryPreview } from './QueryPreview'

export function WorkspacePanel() {
  const { query, url, baseQuery, hasImport } = useQueryStore()

  return (
    <div className="flex flex-col gap-3 p-4">
      <h2 className="text-sm font-semibold text-foreground">Workspace</h2>
      {hasImport && (
        <div className="rounded-md border border-border bg-muted/30 p-2">
          <p className="mb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            Imported base query
          </p>
          <code className="block font-mono text-xs break-words text-foreground">
            {baseQuery || <span className="text-muted-foreground">(empty)</span>}
          </code>
        </div>
      )}
      <QueryPreview query={query} />
      <QueryActions query={query} url={url} />
    </div>
  )
}
