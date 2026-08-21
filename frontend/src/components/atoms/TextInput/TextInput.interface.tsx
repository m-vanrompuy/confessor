import type { ChangeEventHandler, CSSProperties } from 'react'

export interface TextInputInterface {
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
  placeholder?: string
  type?: 'text' | 'search'
  size?: 's' | 'm' | 'l'
  disabled?: boolean
  style?: CSSProperties
  testID?: string
}
