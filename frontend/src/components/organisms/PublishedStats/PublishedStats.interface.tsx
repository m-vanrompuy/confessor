import type { ChangeEventHandler } from 'react'

export interface PublishedStatsInterface {
  /** Leeg totdat de admin 'm invult - er is geen automatische koppeling (issue #90). */
  instagramPostUrl: string
  onInstagramPostUrlChange: ChangeEventHandler<HTMLInputElement>
  likeCount: number
  commentCount: number
  onLikeCountChange: ChangeEventHandler<HTMLInputElement>
  onCommentCountChange: ChangeEventHandler<HTMLInputElement>
  onSave: () => void
  saving?: boolean
  testID?: string
}
