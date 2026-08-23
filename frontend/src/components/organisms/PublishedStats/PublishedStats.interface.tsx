import type { ChangeEventHandler } from 'react'

export interface PublishedStatsInterface {
  /** Nog geen backend-veld voor - zie de opmerking bij deze component. */
  instagramPostUrl: string | null
  likeCount: number
  commentCount: number
  onLikeCountChange: ChangeEventHandler<HTMLInputElement>
  onCommentCountChange: ChangeEventHandler<HTMLInputElement>
  onSave: () => void
  saving?: boolean
  testID?: string
}
