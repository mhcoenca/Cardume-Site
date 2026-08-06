import { useState } from 'react'
import { Check, Copy, SendToBack, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SegmentedToggle } from '@/components/clauses/SegmentedToggle'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { SORT_DIRECTIONS, SORT_OPTIONS, type SortValue } from '@/lib/sortOptions'

interface ResultsActionBarProps {
  totalSelectable: number
  selectedCount: number
  onToggleSelectAll: () => void
  onCopySelected: () => void
  onSendToCopyboard: () => void
  size: number
  onSizeChange: (size: number) => void
  minSize: number
  maxSize: number
  sort: SortValue
  onSortChange: (sort: SortValue) => void
}

export function ResultsActionBar({
  totalSelectable,
  selectedCount,
  onToggleSelectAll,
  onCopySelected,
  onSendToCopyboard,
  size,
  onSizeChange,
  minSize,
  maxSize,
  sort,
  onSortChange,
}: ResultsActionBarProps) {
  const [copied, setCopied] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 640px)')
  const allSelected = totalSelectable > 0 && selectedCount === totalSelectable

  function handleCopy() {
    onCopySelected()
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const selectionCountLabel = selectedCount > 0 ? `${selectedCount} selected` : 'None selected'

  const selectAllButton = (
    <Button
      variant="outline"
      size="sm"
      className={isDesktop ? undefined : 'flex-1'}
      disabled={totalSelectable === 0}
      onClick={onToggleSelectAll}
    >
      {allSelected ? 'Deselect All' : 'Select All'}
    </Button>
  )

  const copyButton = (
    <Button
      variant="outline"
      size="sm"
      className={isDesktop ? undefined : 'flex-1'}
      disabled={selectedCount === 0}
      onClick={handleCopy}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied' : 'Copy Selected'}
    </Button>
  )

  const copyboardButton = (
    <Button
      variant="outline"
      size="sm"
      className={isDesktop ? undefined : 'flex-1'}
      disabled={selectedCount === 0}
      onClick={onSendToCopyboard}
    >
      <SendToBack className="h-3.5 w-3.5" />
      Send to Copyboard
    </Button>
  )

  const sortControls = (
    <>
      <Select
        items={SORT_OPTIONS}
        value={sort.order}
        onValueChange={(order) => onSortChange({ ...sort, order: order ?? '' })}
      >
        <SelectTrigger className={isDesktop ? 'h-8 w-40' : 'h-8 flex-1'}>
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <SegmentedToggle
        options={SORT_DIRECTIONS}
        value={sort.dir}
        onChange={(dir) => onSortChange({ ...sort, dir })}
      />
    </>
  )

  const zoomControls = (
    <>
      <ZoomOut className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <input
        type="range"
        min={minSize}
        max={maxSize}
        step={10}
        value={size}
        onChange={(event) => onSizeChange(Number(event.target.value))}
        className={isDesktop ? 'h-1.5 w-24 cursor-pointer accent-primary' : 'h-1.5 flex-1 cursor-pointer accent-primary'}
        aria-label="Card size"
      />
      <ZoomIn className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
    </>
  )

  if (!isDesktop) {
    return (
      <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/20 px-3 py-2">
        <span className="text-xs text-muted-foreground">{selectionCountLabel}</span>
        <div className="flex w-full items-center gap-2">
          {selectAllButton}
          {copyButton}
        </div>
        <div className="flex w-full items-center gap-2">{copyboardButton}</div>
        <div className="flex w-full items-center gap-2">{sortControls}</div>
        <div className="flex w-full items-center gap-2">{zoomControls}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-muted/20 px-3 py-2">
      {selectAllButton}
      <span className="text-xs text-muted-foreground">{selectionCountLabel}</span>
      {copyButton}
      {copyboardButton}
      <div className="ml-auto flex items-center gap-2">{sortControls}</div>
      <div className="flex items-center gap-2 border-l border-border pl-3">{zoomControls}</div>
    </div>
  )
}
