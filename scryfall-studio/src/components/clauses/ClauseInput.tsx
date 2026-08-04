import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { OracleTagInput } from '@/components/oracle-tags/OracleTagInput'
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
        <Select value={value as string} onValueChange={onChange}>
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

    case 'color-multiselect': {
      const selected = (value as string[]) ?? []
      return (
        <div className="flex flex-wrap gap-2">
          {clause.options?.map((option) => {
            const isSelected = selected.includes(option.value)
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() =>
                  onChange(
                    isSelected
                      ? selected.filter((code) => code !== option.value)
                      : [...selected, option.value],
                  )
                }
                className={cn(
                  'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-transparent text-foreground hover:bg-accent',
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      )
    }

    default:
      return null
  }
}
