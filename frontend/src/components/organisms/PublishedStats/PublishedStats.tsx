import { StatsEditor } from '../../molecules'
import type { PublishedStatsInterface } from './PublishedStats.interface'

// De backend heeft momenteel geen `instagram_post_url`-veld op Confession
// (enkel like_count/comment_count bestaan echt) - dit rendert al wel de
// volledige README-schermschets, maar `instagramPostUrl` zal nog `null`
// blijven tot dat veld er is (nodig vóór issue #36 dit echt kan koppelen).
const PublishedStats = ({
  instagramPostUrl,
  likeCount,
  commentCount,
  onLikeCountChange,
  onCommentCountChange,
  onSave,
  saving,
  testID,
}: PublishedStatsInterface) => {
  return (
    <div className="PublishedStats" data-testid={testID}>
      <h3 className="PublishedStats__heading">Statistieken</h3>
      {instagramPostUrl ? (
        <a href={instagramPostUrl} target="_blank" rel="noreferrer" className="PublishedStats__link">
          Bekijk op Instagram ↗
        </a>
      ) : (
        <p className="PublishedStats__noLink">Nog geen Instagram-link ingesteld.</p>
      )}
      <StatsEditor
        likeCount={likeCount}
        commentCount={commentCount}
        onLikeCountChange={onLikeCountChange}
        onCommentCountChange={onCommentCountChange}
        onSave={onSave}
        saving={saving}
      />
    </div>
  )
}

export default PublishedStats
