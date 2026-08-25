import type { PublishedStatsInterface } from './PublishedStats.interface'

export const PublishedStatsMock: PublishedStatsInterface = {
  instagramPostUrl: null,
  likeCount: 12,
  commentCount: 3,
  onLikeCountChange: () => {},
  onCommentCountChange: () => {},
  onSave: () => {},
}
