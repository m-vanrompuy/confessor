import type { FilterBarInterface } from './FilterBar.interface'

export const FilterBarMock: FilterBarInterface = {
  status: '',
  onStatusChange: () => {},
  availableTags: [
    { id: 'tag-1', name: 'meme', color: '#aa3bff' },
    { id: 'tag-2', name: 'zoekertje', color: '#2f9e44' },
  ],
  selectedTagIds: [],
  onToggleTag: () => {},
  showDeleted: false,
  onToggleShowDeleted: () => {},
}
