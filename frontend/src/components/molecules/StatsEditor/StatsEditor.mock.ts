import type { StatsEditorInterface } from './StatsEditor.interface'

export const StatsEditorMock: StatsEditorInterface = {
  likeCount: 12,
  commentCount: 3,
  onLikeCountChange: () => {},
  onCommentCountChange: () => {},
  onSave: () => {},
}
