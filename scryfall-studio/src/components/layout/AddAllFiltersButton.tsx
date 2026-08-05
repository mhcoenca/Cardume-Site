import { useState } from 'react'
import { listQueryClauses } from '@/clauses/registry'
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

interface AddAllFiltersButtonProps {
  onAdd?: () => void
}

export function AddAllFiltersButton({ onAdd }: AddAllFiltersButtonProps) {
  const { instances, addClause, removeInstance } = useQueryStore()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const allClauses = listQueryClauses()
  const clausesById = new Map(allClauses.map((clause) => [clause.id, clause]))
  const addedIds = new Set(instances.map((instance) => instance.clauseId))
  const remaining = allClauses.filter((clause) => !addedIds.has(clause.id))
  const allAdded = instances.length > 0 && remaining.length === 0

  // "Filled in" = the user actually changed a filter from its default —
  // an empty freshly-added card isn't worth interrupting them to confirm.
  const hasFilledValues = instances.some((instance) => {
    const clause = clausesById.get(instance.clauseId)
    if (!clause) return false
    return JSON.stringify(instance.value) !== JSON.stringify(clause.defaultValue)
  })

  function handleAddAll() {
    for (const clause of remaining) {
      addClause(clause.id)
    }
    onAdd?.()
  }

  function removeAll() {
    for (const instance of instances) {
      removeInstance(instance.instanceId)
    }
    onAdd?.()
  }

  function handleRemoveAllClick() {
    if (hasFilledValues) {
      setConfirmOpen(true)
    } else {
      removeAll()
    }
  }

  if (allAdded) {
    return (
      <>
        <Button variant="outline" className="w-full" onClick={handleRemoveAllClick}>
          Remove All Filters
        </Button>

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove all filters?</DialogTitle>
              <DialogDescription>
                Some of your filters have values entered. This removes every filter card and clears your
                query.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
              <Button
                variant="destructive"
                onClick={() => {
                  setConfirmOpen(false)
                  removeAll()
                }}
              >
                Remove All
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <Button
      variant="outline"
      className="w-full"
      disabled={remaining.length === 0}
      onClick={handleAddAll}
    >
      Add All Filters ({remaining.length})
    </Button>
  )
}
