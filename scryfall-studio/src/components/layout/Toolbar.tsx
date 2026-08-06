import { useState } from 'react'
import { Download, Menu, X } from 'lucide-react'
import { CopyboardModal } from '@/components/copyboard/CopyboardModal'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useCopyboard } from '@/store/useCopyboard'
import { useQueryStore } from '@/store/useQueryStore'
import { CardumeLogo } from './CardumeLogo'
import { ThemeToggle } from './ThemeToggle'

interface ToolbarProps {
  onOpenSidebar: () => void
}

export function Toolbar({ onOpenSidebar }: ToolbarProps) {
  const { hasImport, importUrl, clearImport } = useQueryStore()
  const { cards: copyboardCards } = useCopyboard()
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [copyboardOpen, setCopyboardOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  function handleImport() {
    if (!value.trim()) return
    if (!importUrl(value.trim())) {
      setError("That doesn't look like a Scryfall search URL.")
      return
    }
    setError(null)
    setValue('')
    setImportDialogOpen(false)
  }

  const importForm = (
    <div className="flex flex-col gap-1">
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
  )

  return (
    <div className="flex items-center gap-3 px-4 py-3 lg:gap-4 lg:px-6 lg:py-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          className="lg:hidden"
          onClick={onOpenSidebar}
          aria-label="Open filters"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <CardumeLogo className="h-6 w-auto shrink-0 text-foreground" />
      </div>

      <div className="flex flex-1 items-center justify-end gap-3 lg:gap-4">
        {isDesktop ? (
          <div className="w-full max-w-xl">{importForm}</div>
        ) : (
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger
              render={<Button variant="outline" size="icon" aria-label="Import from Scryfall URL" />}
            >
              <Download className="h-4 w-4" />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import from Scryfall</DialogTitle>
                <DialogDescription>Paste a Scryfall search URL to import its query.</DialogDescription>
              </DialogHeader>
              {importForm}
            </DialogContent>
          </Dialog>
        )}

        <Button
          variant="outline"
          size="sm"
          disabled={copyboardCards.length === 0}
          onClick={() => setCopyboardOpen(true)}
        >
          Copyboard ({copyboardCards.length})
        </Button>
        <CopyboardModal open={copyboardOpen} onOpenChange={setCopyboardOpen} />

        <ThemeToggle />
      </div>
    </div>
  )
}
