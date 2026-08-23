export interface TagAssignmentTag {
  id: string
  name: string
  color: string
}

export interface TagAssignmentInterface {
  assignedTags: TagAssignmentTag[]
  availableTags: TagAssignmentTag[]
  onToggleTag: (tagId: string) => void
  testID?: string
}
