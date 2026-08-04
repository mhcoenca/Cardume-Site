import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { OracleTagInput } from '@/components/oracle-tags/OracleTagInput'
import { ToggleButtonGroup } from './ToggleButtonGroup'
import { TypeLineInput } from './TypeLineInput'
import { COLOR_OPERATORS, type ColorClauseValue } from '@/clauses/factories/colorClause'
import { COMPARISON_OPERATORS, type OperatorNumberValue } from '@/clauses/factories/operatorNumberClause'
import {
  FORMAT_OPTIONS,
  LEGALITY_STATUSES,
  type LegalityValue,
} from '@/clauses/plugins/legality'
import type { AnyQueryClause } from '@/clauses/types'
import type { OracleTagValue } from '@/services/oracleTags/types'

interface ClauseInputProps {
  clause: AnyQueryClause
  value: unknown
  onChange: (value: unknown) => void
}

export function ClauseInput({ clause, value, onChange }: ClauseInputProps) {
  switch (clause.inputType) {
    case 'text':
      return (
        <Input
          value={(value as string) ?? ''}
          placeholder={clause.metadata?.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )

    case 'oracle-tag':
      return (
        <OracleTagInput
          value={value as OracleTagValue | null}
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

    case 'type-line':
      return <TypeLineInput value={(value as string[]) ?? []} onChange={onChange} />

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
        <div className="flex items-center gap-2">
          <Select
            items={COMPARISON_OPERATORS}
            value={numberValue.operator}
            onValueChange={(operator) => onChange({ ...numberValue, operator })}
          >
            <SelectTrigger className="w-56 shrink-0">
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

    case 'legality': {
      const legalityValue = value as LegalityValue
      return (
        <div className="flex items-center gap-2">
          <Select
            items={LEGALITY_STATUSES}
            value={legalityValue.status}
            onValueChange={(status) => onChange({ ...legalityValue, status })}
          >
            <SelectTrigger className="w-36 shrink-0">
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
            <SelectTrigger className="flex-1">
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
