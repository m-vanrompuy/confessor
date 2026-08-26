import type { TagAssignmentTag } from '../../molecules/TagAssignment/TagAssignment.interface'

export interface ConfessionDetailsInterface {
  text: string
  adminMessage: string | null
  /** URL's van de originele, door de inzender geüploade meme-bijlage(n) (issue #109) - meestal 0 of 1. */
  memeUrls: string[]
  assignedTags: TagAssignmentTag[]
  availableTags: TagAssignmentTag[]
  onToggleTag: (tagId: string) => void
  testID?: string
}
