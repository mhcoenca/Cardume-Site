import { useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { OracleTagInput } from '@/components/oracle-tags/OracleTagInput'
import { ReverseOracleTagInput } from '@/components/oracle-tags/ReverseOracleTagInput'
import { CriteriaInput } from './CriteriaInput'
import { ManaCostInput } from './ManaCostInput'
import { ToggleButtonGroup } from './ToggleButtonGroup'
import { TypeLineInput } from './TypeLineInput'
import { COLOR_OPERATORS, type ColorClauseValue } from '@/clauses/factories/colorClause'
import { COMPARISON_OPERATORS, type OperatorNumberValue } from '@/clauses/factories/operatorNumberClause'
import type { CriteriaValue } from '@/clauses/plugins/criteria'
import type { TypeLineValue } from '@/clauses/plugins/card-types'
import {
  FORMAT_OPTIONS,
  LEGALITY_STATUSES,
  type LegalityValue,
} from '@/clauses/plugins/legality'
import type { OracleTagClauseValue } from '@/clauses/plugins/oracle-tag'
import { PRICE_CURRENCIES, type PriceValue } from '@/clauses/plugins/price'
import type { ReverseOracleTagValue } from '@/clauses/plugins/reverse-oracle-tag'
import type { AnyQueryClause } from '@/clauses/types'

interface ClauseInputProps {
  clause: AnyQueryClause
  value: unknown
  onChange: (value: unknown) => void
}

export function ClauseInput({ clause, value, onChange }: ClauseInputProps) {
  const [helpOpen, setHelpOpen] = useState(false)

  switch (clause.inputType) {
    case 'text': {
      const helpText = clause.metadata?.helpText
      return (
        <div className="flex items-center gap-1.5">
          <Input
            value={(value as string) ?? ''}
            placeholder={clause.metadata?.placeholder}
            onChange={(event) => onChange(event.target.value)}
            className="flex-1"
          />
          {helpText && helpText.length > 0 && (
            <>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => setHelpOpen(true)}
                aria-label={`${clause.label} search tips`}
                title={`${clause.label} search tips`}
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
              <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{clause.label} search tips</DialogTitle>
                  </DialogHeader>
                  <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
                    {helpText.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      )
    }

    case 'oracle-tag':
      return (
        <OracleTagInput
          value={value as OracleTagClauseValue}
          onChange={onChange}
          placeholder={clause.metadata?.placeholder}
        />
      )

    case 'select':
      return (
        <Select items={clause.options ?? []} value={value as string} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={clause.metadata?.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {clause.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

    case 'reverse-oracle-tag':
      return (
        <ReverseOracleTagInput
          value={value as ReverseOracleTagValue}
          onChange={onChange}
        />
      )

    case 'type-line':
      return <TypeLineInput value={value as TypeLineValue} onChange={onChange} />

    case 'mana-cost':
      return <ManaCostInput value={(value as string) ?? ''} onChange={onChange} />

    case 'criteria':
      return <CriteriaInput value={value as CriteriaValue} onChange={onChange} />

    case 'multi-select': {
      const selected = (value as string[]) ?? []
      return (
        <ToggleButtonGroup
          options={clause.options ?? []}
          selected={selected}
          onToggle={(optionValue) =>
            onChange(
              selected.includes(optionValue)
                ? selected.filter((v) => v !== optionValue)
                : [...selected, optionValue],
            )
          }
        />
      )
    }

    case 'color-operator-multiselect': {
      const colorValue = value as ColorClauseValue
      return (
        <div className="flex flex-col gap-2">
          <Select
            items={COLOR_OPERATORS}
            value={colorValue.operator}
            onValueChange={(operator) => onChange({ ...colorValue, operator })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COLOR_OPERATORS.map((op) => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ToggleButtonGroup
            options={clause.options ?? []}
            selected={colorValue.colors}
            onToggle={(code) =>
              onChange({
                ...colorValue,
                colors: colorValue.colors.includes(code)
                  ? colorValue.colors.filter((c) => c !== code)
                  : [...colorValue.colors, code],
              })
            }
          />
        </div>
      )
    }

    case 'operator-number': {
      const numberValue = value as OperatorNumberValue
      return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select
            items={COMPARISON_OPERATORS}
            value={numberValue.operator}
            onValueChange={(operator) => onChange({ ...numberValue, operator })}
          >
            <SelectTrigger className="w-full sm:w-56 sm:shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMPARISON_OPERATORS.map((op) => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            value={numberValue.value ?? ''}
            placeholder={clause.metadata?.placeholder}
            onChange={(event) =>
              onChange({
                ...numberValue,
                value: event.target.value === '' ? null : Number(event.target.value),
              })
            }
            className="flex-1"
          />
        </div>
      )
    }

    case 'price': {
      const priceValue = value as PriceValue
      return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select
            items={PRICE_CURRENCIES}
            value={priceValue.currency}
            onValueChange={(currency) => onChange({ ...priceValue, currency })}
          >
            <SelectTrigger className="w-full sm:w-28 sm:shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRICE_CURRENCIES.map((currency) => (
                <SelectItem key={currency.value} value={currency.value}>
                  {currency.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            items={COMPARISON_OPERATORS}
            value={priceValue.operator}
            onValueChange={(operator) => onChange({ ...priceValue, operator })}
          >
            <SelectTrigger className="w-full sm:w-44 sm:shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMPARISON_OPERATORS.map((op) => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            value={priceValue.value ?? ''}
            placeholder={clause.metadata?.placeholder}
            onChange={(event) =>
              onChange({
                ...priceValue,
                value: event.target.value === '' ? null : Number(event.target.value),
              })
            }
            className="flex-1"
          />
        </div>
      )
    }

    case 'legality': {
      const legalityValue = value as LegalityValue
      return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select
            items={LEGALITY_STATUSES}
            value={legalityValue.status}
            onValueChange={(status) => onChange({ ...legalityValue, status })}
          >
            <SelectTrigger className="w-full sm:w-36 sm:shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEGALITY_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            items={FORMAT_OPTIONS}
            value={legalityValue.format}
            onValueChange={(format) => onChange({ ...legalityValue, format })}
          >
            <SelectTrigger className="w-full sm:flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FORMAT_OPTIONS.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  {format.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )
    }

    case 'checkbox': {
      const checked = Boolean(value)
      return (
        <label className="flex w-fit items-center gap-2 text-sm text-foreground">
          <Checkbox checked={checked} onCheckedChange={(next) => onChange(next === true)} />
          {clause.metadata?.placeholder ?? clause.label}
        </label>
      )
    }

    default:
      return null
  }
}
