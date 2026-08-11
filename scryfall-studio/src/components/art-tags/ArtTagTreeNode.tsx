import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { getArtTagChildren } from '@/services/artTags/ArtTagService'
import type { ArtTag } from '@/services/artTags/types'

interface ArtTagTreeNodeProps {
  tag: ArtTag
  depth: number
  onSelect: (tag: ArtTag) => void
}

export function ArtTagTreeNode({ tag, depth, onSelect }: ArtTagTreeNodeProps) {
  const [expanded, setExpanded] = useState(false)
  const hasChildren = tag.childIds.length > 0
  const children = expanded ? getArtTagChildren(tag.id) : []

  return (
    <div>
      <div className="flex items-center gap-0.5" style={{ paddingLeft: depth * 16 }}>
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-label={expanded ? 'Collapse' : 'Expand'}
            className="flex h-5 w-5 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
          >
            {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        ) : (
          <span className="h-5 w-5 shrink-0" />
        )}
        <button
          type="button"
          onClick={() => onSelect(tag)}
          className="flex flex-1 items-baseline justify-between gap-2 rounded px-1.5 py-1 text-left text-sm hover:bg-accent"
        >
          <span className="text-foreground">{tag.label}</span>
          {tag.taggingCount > 0 && (
            <span className="shrink-0 text-xs text-muted-foreground">{tag.taggingCount}</span>
          )}
        </button>
      </div>
      {expanded &&
        children.map((child) => (
          <ArtTagTreeNode key={child.id} tag={child} depth={depth + 1} onSelect={onSelect} />
        ))}
    </div>
  )
}
