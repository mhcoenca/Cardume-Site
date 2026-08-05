import { useEffect, useState } from 'react'
import { Loader2, Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  ensureOracleTagsLoaded,
  getOracleTagRoots,
  getOracleTagsLoadError,
  searchOracleTags,
} from '@/services/oracleTags/OracleTagService'
import type { OracleTag, OracleTagValue } from '@/services/oracleTags/types'
import { OracleTagTreeNode } from './OracleTagTreeNode'

interface OracleTagBrowserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (value: OracleTagValue) => void
}

export function OracleTagBrowserModal({ open, onOpenChange, onSelect }: OracleTagBrowserModalProps) {
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [roots, setRoots] = useState<OracleTag[]>([])

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setError(null)
    ensureOracleTagsLoaded()
      .then(() => {
        setLoading(false)
        setRoots(getOracleTagRoots())
      })
      .catch(() => {
        setLoading(false)
        setError(getOracleTagsLoadError() ?? 'Failed to load Oracle Tags.')
      })
  }, [open])

  function handleSelect(tag: OracleTag) {
    onSelect({ id: tag.id, slug: tag.slug, label: tag.label, description: tag.description ?? undefined })
    onOpenChange(false)
    setSearch('')
  }

  const searchResults = search.trim() ? searchOracleTags(search, 60) : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[calc(100dvh-4rem)] flex-col sm:h-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Browse Oracle Tags</DialogTitle>
          <DialogDescription>
            {roots.length
              ? `${roots.length} top-level tags — expand to see their children, or search across all of them.`
              : "All tags from Scryfall's Tagger project."}
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search all tags…"
            className="pl-8"
            autoFocus
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-border p-1 sm:max-h-[28rem] sm:flex-none">
          {error ? (
            <p className="p-3 text-xs text-destructive">{error}</p>
          ) : loading ? (
            <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading Oracle Tags…
            </div>
          ) : search.trim() ? (
            searchResults.length ? (
              searchResults.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleSelect(tag)}
                  className="flex w-full flex-col items-start gap-0.5 rounded px-1.5 py-1 text-left text-sm hover:bg-accent"
                >
                  <span className="text-foreground">{tag.label}</span>
                  {tag.description && (
                    <span className="line-clamp-1 text-xs text-muted-foreground">
                      {tag.description}
                    </span>
                  )}
                </button>
              ))
            ) : (
              <p className="p-3 text-xs text-muted-foreground">No matching tags.</p>
            )
          ) : (
            roots.map((tag) => (
              <OracleTagTreeNode key={tag.id} tag={tag} depth={0} onSelect={handleSelect} />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
