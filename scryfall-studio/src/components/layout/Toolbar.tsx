import { useState } from 'react'
import { Menu } from 'lucide-react'
import { CopyboardModal } from '@/components/copyboard/CopyboardModal'
import { Button } from '@/components/ui/button'
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
        <label
          className="flex shrink-0 items-center gap-2 text-xs whitespace-nowrap text-muted-foreground"
          title="Excludes Arena/Alchemy cards with no paper printing"
        >
          Printed only
          <Switch checked={printedOnly} onCheckedChange={setPrintedOnly} />
        </label>
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
