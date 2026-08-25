import type { ChangeEventHandler } from 'react'

export interface StatsEditorInterface {
  likeCount: number
  commentCount: number
  onLikeCountChange: ChangeEventHandler<HTMLInputElement>
  onCommentCountChange: ChangeEventHandler<HTMLInputElement>
  onSave: () => void
  saving?: boolean
  testID?: string
}
