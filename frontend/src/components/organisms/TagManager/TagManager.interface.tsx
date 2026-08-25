import type { DisplayTag } from '../../_types_'

export interface TagManagerInterface {
  tags: DisplayTag[]
  onCreateTag: (name: string, color: string) => void
  onUpdateTag: (tagId: string, name: string, color: string) => void
  onDeleteTag: (tagId: string) => void
  creating?: boolean
  saving?: boolean
  deleting?: boolean
  testID?: string
}
