import type { TagAssignmentTag } from '../../molecules/TagAssignment/TagAssignment.interface'

export interface ConfessionDetailsInterface {
  text: string
  adminMessage: string | null
  assignedTags: TagAssignmentTag[]
  availableTags: TagAssignmentTag[]
  onToggleTag: (tagId: string) => void
  testID?: string
}
