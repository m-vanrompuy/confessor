import type { ChangeEventHandler } from 'react'
import type { FilterBarInterface } from '../../molecules/FilterBar/FilterBar.interface'

export interface ToolbarInterface {
  searchValue: string
  onSearchChange: ChangeEventHandler<HTMLInputElement>
  filter: Omit<FilterBarInterface, 'testID'>
  onSync: () => void
  syncing?: boolean
  testID?: string
}
