import { useState } from 'react'
import { Copy, Download, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCopyboard } from '@/store/useCopyboard'

interface CopyboardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Standard decklist line format — matches ResultsPanel's own "Copy Selected". */
function toDecklistText(cards: { name: string }[]): string {
  return cards.map((card) => `1 ${card.name}`).join('\n')
}

export function CopyboardModal({ open, onOpenChange }: CopyboardModalProps) {
  const { cards, removeCard, clear } = useCopyboard()
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)

  function download() {
    const blob = new Blob([toDecklistText(cards)], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'copyboard.txt'
    link.click()
    URL.revokeObjectURL(url)
  }

  async function copy() {
    await navigator.clipboard.writeText(toDecklistText(cards))
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copyboard</DialogTitle>
            <DialogDescription>
              Cards you've sent here from any search — builds up across queries.
            </DialogDescription>
          </DialogHeader>

          {cards.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing here yet.</p>
          ) : (
            <ul className="flex max-h-80 flex-col gap-1 overflow-y-auto">
              {cards.map((card) => (
                <li
                  key={card.id}
                  className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <span className="truncate text-foreground">{card.name}</span>
                  <button
                    type="button"
                    onClick={() => removeCard(card.id)}
                    aria-label={`Remove ${card.name} from Copyboard`}
                    className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {cards.length > 0 && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmClearOpen(true)}>
                Clear
              </Button>
              <Button variant="outline" onClick={download}>
                <Download className="h-3.5 w-3.5" />
                Download .txt
              </Button>
              <Button onClick={copy}>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear the Copyboard?</DialogTitle>
            <DialogDescription>
              Removes all {cards.length} card{cards.length === 1 ? '' : 's'}. This can't be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmClearOpen(false)
                clear()
              }}
            >
              Clear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
