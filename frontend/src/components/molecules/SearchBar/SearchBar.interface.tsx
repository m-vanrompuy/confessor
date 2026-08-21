import type { ChangeEventHandler } from 'react'

export interface SearchBarInterface {
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
  testID?: string
}
