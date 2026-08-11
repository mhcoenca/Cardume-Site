import { useState } from 'react'
import { Download } from 'lucide-react'
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
import { useQueryStore } from '@/store/useQueryStore'

export function ImportUrlButton() {
  const { importUrl } = useQueryStore()
  const [open, setOpen] = useState(false)
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
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" className="w-full" />}>
        <Download className="h-3.5 w-3.5" />
        Import from Scryfall
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import from Scryfall</DialogTitle>
          <DialogDescription>
            Paste a Scryfall search URL — recognized filters become clause cards and the rest is
            folded into your query.
          </DialogDescription>
        </DialogHeader>
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
            placeholder="Paste a Scryfall search URL…"
            autoFocus
          />
          <Button onClick={handleImport} disabled={!value.trim()}>
            Import
          </Button>
        </div>
        {error && <p className="text-[11px] text-destructive">{error}</p>}
      </DialogContent>
    </Dialog>
  )
}
