import type { MouseEventHandler } from 'react'
import type { ConfessionStatus } from '../../../api/confessions'

export interface ConfessionCardTag {
  id: string
  name: string
  color: string
}

export interface ConfessionCardInterface {
  title: string
  text: string
  tags: ConfessionCardTag[]
  status: ConfessionStatus
  onClick?: MouseEventHandler<HTMLButtonElement>
  testID?: string
}
