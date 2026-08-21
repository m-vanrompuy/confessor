import type { MouseEventHandler } from 'react'

export interface TagChipInterface {
  name: string
  /** Hex color, set by the admin in Instellingen. */
  color: string
  /** When set, the chip is clickable (e.g. as a filter toggle) and shows a pressed state. */
  selected?: boolean
  onClick?: MouseEventHandler<HTMLButtonElement>
  testID?: string
}
