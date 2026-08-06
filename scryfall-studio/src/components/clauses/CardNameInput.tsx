import type { CardNameValue } from '@/clauses/plugins/card-name'
import { Input } from '@/components/ui/input'

interface CardNameInputProps {
  value: CardNameValue
  onChange: (value: CardNameValue) => void
  placeholder?: string
}

export function CardNameInput({ value, onChange, placeholder }: CardNameInputProps) {
  return (
    <Input
      value={value.name}
      placeholder={placeholder}
      onChange={(event) => onChange({ ...value, name: event.target.value })}
    />
  )
}
