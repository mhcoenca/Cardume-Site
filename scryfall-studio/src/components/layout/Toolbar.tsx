import { useState } from 'react'
import { HelpCircle, Menu } from 'lucide-react'
import { CopyboardModal } from '@/components/copyboard/CopyboardModal'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useCopyboard } from '@/store/useCopyboard'
import { useQueryStore } from '@/store/useQueryStore'
import { LogoResetButton } from './LogoResetButton'
import { ThemeToggle } from './ThemeToggle'

interface ToolbarProps {
  onOpenSidebar: () => void
}

export function Toolbar({ onOpenSidebar }: ToolbarProps) {
  const { cardName, setCardName, printedOnly, setPrintedOnly } = useQueryStore()
  const { cards: copyboardCards } = useCopyboard()
  const [copyboardOpen, setCopyboardOpen] = useState(false)
  const [printedOnlyHelpOpen, setPrintedOnlyHelpOpen] = useState(false)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 lg:flex-nowrap lg:gap-4 lg:px-6 lg:py-4">
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
        <LogoResetButton />
      </div>

      <div className="order-3 flex w-full items-center justify-center gap-2 lg:order-none lg:w-auto lg:flex-1">
        <Input
          value={cardName}
          onChange={(event) => setCardName(event.target.value)}
          placeholder="Search by card name…"
          className="max-w-xl flex-1"
        />
        <div className="flex shrink-0 items-center gap-1.5">
          <label className="flex items-center gap-2 text-xs whitespace-nowrap text-muted-foreground">
            Paper only
            <Switch checked={printedOnly} onCheckedChange={setPrintedOnly} />
          </label>
          <button
            type="button"
            onClick={() => setPrintedOnlyHelpOpen(true)}
            aria-label="What does Paper only do?"
            title="What does Paper only do?"
            className="text-muted-foreground hover:text-foreground"
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
          <Dialog open={printedOnlyHelpOpen} onOpenChange={setPrintedOnlyHelpOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Paper only</DialogTitle>
                <DialogDescription>
                  Excludes Arena/Alchemy cards that only exist digitally, with no paper
                  version — on by default so results only show cards you could actually
                  hold in your hand.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-3">
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
