import type { ChangeEventHandler } from 'react'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectInterface {
  value: string
  onChange: ChangeEventHandler<HTMLSelectElement>
  options: SelectOption[]
  placeholder?: string
  testID?: string
}
