import type { ChangeEventHandler } from 'react'
import type { ConfessionStatus } from '../../../api/confessions'

export interface FilterBarTag {
  id: string
  name: string
  color: string
}

export interface FilterBarInterface {
  /** '' = no status filter. Deleted is never an option here - use showDeleted instead. */
  status: Exclude<ConfessionStatus, 'deleted'> | ''
  onStatusChange: ChangeEventHandler<HTMLSelectElement>
  availableTags: FilterBarTag[]
  selectedTagIds: string[]
  onToggleTag: (tagId: string) => void
  showDeleted: boolean
  onToggleShowDeleted: () => void
  testID?: string
}
