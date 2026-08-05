import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import {
  BASE_COLOR_LABELS,
  formatManaCostTokens,
  getColorVariants,
  manaSymbolIconUrl,
  parseManaCostTokens,
  sortManaCostTokens,
  type BaseManaColor,
} from '@/lib/manaSymbols'
import { cn } from '@/lib/utils'

interface ManaCostInputProps {
  value: string
  onChange: (value: string) => void
}

const LONG_PRESS_MS = 450
const COLOR_SYMBOLS: BaseManaColor[] = ['W', 'U', 'B', 'R', 'G']

interface ManaColorButtonProps {
  color: BaseManaColor
  onAdd: () => void
  onOpenVariants: () => void
}

/**
 * Short press adds the plain color; press-and-hold opens its variant
 * picker as soon as the hold threshold is reached — same as a native
 * long-press menu, no need to release first. That requires
 * `setPointerCapture`: once the dialog opens mid-press, it renders its
 * backdrop on top of this button, so without capture the eventual release
 * would hit the backdrop instead (which dismisses the dialog it just
 * opened, immediately). Capture keeps the release routed to this button
 * regardless of what renders on top of it.
 */
function ManaColorButton({ color, onAdd, onOpenVariants }: ManaColorButtonProps) {
  const longPressFired = useRef(false)
  const pointerHandled = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function cancelTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  function endPress(event: React.PointerEvent<HTMLButtonElement>) {
    cancelTimer()
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    pointerHandled.current = true
    if (!longPressFired.current) {
      onAdd()
    }
    longPressFired.current = false
  }

  return (
    <button
      type="button"
      onPointerDown={(event) => {
        longPressFired.current = false
        cancelTimer()
        event.currentTarget.setPointerCapture(event.pointerId)
        timerRef.current = setTimeout(() => {
          longPressFired.current = true
          onOpenVariants()
        }, LONG_PRESS_MS)
      }}
      onPointerUp={endPress}
      onPointerCancel={endPress}
      onContextMenu={(event) => event.preventDefault()}
      onClick={() => {
        // Keyboard activation (Enter/Space) fires a click with no preceding
        // pointer events; a pointer-driven press was already handled above.
        if (pointerHandled.current) {
          pointerHandled.current = false
          return
        }
        onAdd()
      }}
      title={`${BASE_COLOR_LABELS[color]} — hold for hybrid/Phyrexian variants`}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-transparent transition-colors hover:bg-accent"
    >
      <img src={manaSymbolIconUrl(color)} alt={color} className="h-5 w-5" />
    </button>
  )
}

const NUMERIC_TOKEN = /^\d+$/

export function ManaCostInput({ value, onChange }: ManaCostInputProps) {
  const [draftTokens, setDraftTokens] = useState<string[]>(() =>
    sortManaCostTokens(parseManaCostTokens(value)),
  )
  const [genericValue, setGenericValue] = useState(
    () => draftTokens.find((token) => NUMERIC_TOKEN.test(token)) ?? '',
  )
  const [variantColor, setVariantColor] = useState<BaseManaColor | null>(null)
  const isDesktop = useMediaQuery('(min-width: 640px)')

  const appliedTokens = sortManaCostTokens(parseManaCostTokens(value))
  const isDirty = formatManaCostTokens(draftTokens) !== formatManaCostTokens(appliedTokens)

  function appendDraftToken(token: string) {
    setDraftTokens((prev) => sortManaCostTokens([...prev, token]))
  }

  function removeDraftTokenAt(index: number) {
    if (NUMERIC_TOKEN.test(draftTokens[index])) setGenericValue('')
    setDraftTokens((prev) => prev.filter((_, i) => i !== index))
  }

  // No separate "Add" step for the generic amount — typing it updates the
  // draft directly. A cost only ever has one generic symbol, so this
  // replaces any existing one rather than appending another.
  function handleGenericChange(nextValue: string) {
    setGenericValue(nextValue)
    setDraftTokens((prev) => {
      const withoutGeneric = prev.filter((token) => !NUMERIC_TOKEN.test(token))
      return sortManaCostTokens(nextValue.trim() ? [...withoutGeneric, nextValue.trim()] : withoutGeneric)
    })
  }

  function handleClear() {
    setGenericValue('')
    setDraftTokens([])
    onChange('')
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className={cn(
          'flex min-h-10 flex-wrap items-center gap-1 rounded-md border border-border px-2 py-1.5',
          draftTokens.length === 0 && 'text-xs text-muted-foreground',
        )}
      >
        {draftTokens.length === 0 ? (
          'No mana symbols yet — add some below.'
        ) : (
          draftTokens.map((token, index) => (
            <button
              key={`${token}-${index}`}
              type="button"
              onClick={() => removeDraftTokenAt(index)}
              title="Remove"
              className="group relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
            >
              <img src={manaSymbolIconUrl(token)} alt={token} className="h-6 w-6" />
              <span className="absolute inset-0 hidden items-center justify-center rounded-full bg-black/60 group-hover:flex">
                <X className="h-3.5 w-3.5 text-white" />
              </span>
            </button>
          ))
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Input
          type="number"
          min={0}
          value={genericValue}
          onChange={(event) => handleGenericChange(event.target.value)}
          className="h-8 w-16"
          aria-label="Generic mana amount"
        />

        <div className="mx-1 h-6 w-px bg-border" />

        {COLOR_SYMBOLS.map((color) => (
          <ManaColorButton
            key={color}
            color={color}
            onAdd={() => appendDraftToken(color)}
            onOpenVariants={() => setVariantColor(color)}
          />
        ))}

        <button
          type="button"
          onClick={() => appendDraftToken('X')}
          title="Add {X}"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-transparent transition-colors hover:bg-accent"
        >
          <img src={manaSymbolIconUrl('X')} alt="X" className="h-5 w-5" />
        </button>

        {isDesktop && (
          <div className="ml-auto flex items-center gap-2">
            <Button
              type="button"
              variant={isDirty ? 'default' : 'outline'}
              size="sm"
              disabled={!isDirty}
              onClick={() => onChange(formatManaCostTokens(draftTokens))}
            >
              Apply
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
              Clear
            </Button>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">Long press a mana symbol to see hybrid options.</p>

      {!isDesktop && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={isDirty ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            disabled={!isDirty}
            onClick={() => onChange(formatManaCostTokens(draftTokens))}
          >
            Apply
          </Button>
          <Button type="button" variant="ghost" size="sm" className="flex-1" onClick={handleClear}>
            Clear
          </Button>
        </div>
      )}

      <Dialog open={variantColor !== null} onOpenChange={(open) => !open && setVariantColor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{variantColor && BASE_COLOR_LABELS[variantColor]} variants</DialogTitle>
            <DialogDescription>Hybrid, Phyrexian, and other special mana symbols.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {variantColor &&
              getColorVariants(variantColor).map((variant) => (
                <button
                  key={variant.token}
                  type="button"
                  onClick={() => {
                    appendDraftToken(variant.token)
                    setVariantColor(null)
                  }}
                  className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-accent"
                >
                  <img
                    src={manaSymbolIconUrl(variant.token)}
                    alt={variant.token}
                    className="h-5 w-5 shrink-0"
                  />
                  {variant.label}
                </button>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
