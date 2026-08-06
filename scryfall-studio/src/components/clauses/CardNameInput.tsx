import type { CardNameValue } from '@/clauses/plugins/card-name'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'

interface CardNameInputProps {
  value: CardNameValue
  onChange: (value: CardNameValue) => void
  placeholder?: string
}

export function CardNameInput({ value, onChange, placeholder }: CardNameInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <Input
        value={value.name}
        placeholder={placeholder}
        onChange={(event) => onChange({ ...value, name: event.target.value })}
      />
      <label
        className="flex w-fit items-center gap-2 text-sm text-foreground"
        title="Excludes Arena/Alchemy cards with no paper printing"
      >
        <Checkbox
          checked={value.printedOnly}
          onCheckedChange={(next) => onChange({ ...value, printedOnly: next === true })}
        />
        Printed only
      </label>
    </div>
  )
}
