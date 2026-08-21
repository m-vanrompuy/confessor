import { FilterBarMock } from '../../molecules/FilterBar/FilterBar.mock'
import type { ToolbarInterface } from './Toolbar.interface'

export const ToolbarMock: ToolbarInterface = {
  searchValue: '',
  onSearchChange: () => {},
  filter: FilterBarMock,
  onSync: () => {},
}
