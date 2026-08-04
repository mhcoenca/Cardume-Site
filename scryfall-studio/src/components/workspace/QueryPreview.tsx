interface QueryPreviewProps {
  query: string
}

export function QueryPreview({ query }: QueryPreviewProps) {
  return (
    <pre className="min-h-24 rounded-md border border-border bg-muted/40 p-3 font-mono text-sm whitespace-pre-wrap break-words text-foreground">
      {query || <span className="text-muted-foreground">Your query will appear here…</span>}
    </pre>
  )
}
