import type { CSSProperties, MouseEventHandler, ReactNode } from 'react'

export interface ButtonInterface {
  children: ReactNode
  onClick?: MouseEventHandler<HTMLButtonElement>
  /** Native button type - 'button' unless it submits a form. */
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 's' | 'm' | 'l'
  disabled?: boolean
  style?: CSSProperties
  testID?: string
}
