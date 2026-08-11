import { useState } from 'react'
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
import { useQueryStore } from '@/store/useQueryStore'
import { CardumeLogo } from './CardumeLogo'

/** Clicking the logo resets the app — with a confirmation if there's an active search to lose. */
export function LogoResetButton() {
  const { hasActiveSearch, resetAll } = useQueryStore()
  const [confirmOpen, setConfirmOpen] = useState(false)

  function handleClick() {
    if (hasActiveSearch) {
      setConfirmOpen(true)
    } else {
      resetAll()
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label="Reset search"
        title="Reset search"
        className="cursor-pointer"
      >
        <CardumeLogo className="h-6 w-auto shrink-0 text-foreground" />
      </button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start over?</DialogTitle>
            <DialogDescription>
              This clears every filter, Card Name, and any imported query back to a clean slate.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmOpen(false)
                resetAll()
              }}
            >
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
