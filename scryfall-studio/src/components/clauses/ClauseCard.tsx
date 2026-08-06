import { useState } from 'react'
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, X } from 'lucide-react'
import type { CardNameValue } from '@/clauses/plugins/card-name'
import type { AnyQueryClause } from '@/clauses/types'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { ClauseInput } from './ClauseInput'

interface ClauseCardProps {
  clause: AnyQueryClause
  value: unknown
  onChange: (value: unknown) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  canMoveUp: boolean
  canMoveDown: boolean
}

export function ClauseCard({
  clause,
  value,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: ClauseCardProps) {
  const pinned = clause.pinned ?? false
  const isCardName = clause.id === 'card-name'
  const [collapsed, setCollapsed] = useState(false)
  const Icon = clause.icon

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className={collapsed ? '' : 'mb-3'}>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-expanded={!collapsed}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
          >
            {collapsed ? (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            )}
            <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate text-sm font-medium text-foreground">{clause.label}</span>
          </button>
          {isCardName ? (
            <label
              className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground"
              title="Excludes Arena/Alchemy cards with no paper printing"
            >
              Printed only
              <Switch
                checked={(value as CardNameValue).printedOnly}
                onCheckedChange={(checked) =>
                  onChange({ ...(value as CardNameValue), printedOnly: checked })
                }
              />
            </label>
          ) : (
            !pinned && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={!canMoveUp}
                  onClick={onMoveUp}
                  aria-label="Move clause up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={!canMoveDown}
                  onClick={onMoveDown}
                  aria-label="Move clause down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={onRemove} aria-label="Remove clause">
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            )
          )}
        </div>
      </div>
      {!collapsed && <ClauseInput clause={clause} value={value} onChange={onChange} />}
    </div>
  )
}
