import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CollapsibleSectionProps {
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

/** A titled section that can be retracted via a chevron next to its heading. */
export function CollapsibleSection({ title, open, onOpenChange, children }: CollapsibleSectionProps) {
  return (
    <div>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        className="flex w-full items-center gap-1 px-3 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase hover:text-foreground"
      >
        <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 transition-transform', !open && '-rotate-90')} />
        {title}
      </button>
      {open && children}
    </div>
  )
}
