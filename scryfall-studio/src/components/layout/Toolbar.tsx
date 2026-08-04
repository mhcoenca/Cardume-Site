import { useState } from 'react'
import { Download, ExternalLink, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useQueryStore } from '@/store/useQueryStore'

export function Toolbar() {
  const { hasImport, importUrl, clearImport } = useQueryStore()
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleImport() {
    if (!value.trim()) return
    if (!importUrl(value.trim())) {
      setError("That doesn't look like a Scryfall search URL.")
      return
    }
    setError(null)
    setValue('')
  }

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold whitespace-nowrap text-foreground">
          Scryfall Studio
        </span>
      </div>

      <div className="flex w-full max-w-xl flex-col gap-1">
        {hasImport ? (
          <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
            <span>Base query imported from Scryfall</span>
            <button
              type="button"
              onClick={clearImport}
              aria-label="Clear imported query"
              className="text-foreground transition-colors hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Input
              value={value}
              onChange={(event) => {
                setValue(event.target.value)
                setError(null)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleImport()
              }}
              placeholder="Paste a Scryfall search URL to import…"
              className="h-8 text-xs"
            />
            <Button size="sm" variant="outline" onClick={handleImport} disabled={!value.trim()}>
              <Download className="h-3.5 w-3.5" />
              Import
            </Button>
          </div>
        )}
        {error && <p className="text-[11px] text-destructive">{error}</p>}
      </div>

      <a
        href="https://scryfall.com"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1 text-xs whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
      >
        scryfall.com
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  )
}
