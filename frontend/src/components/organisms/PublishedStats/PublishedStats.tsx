import { TextInput } from '../../atoms'
import { StatsEditor } from '../../molecules'
import type { PublishedStatsInterface } from './PublishedStats.interface'

// Nu echt bewerkbaar (issue #36) - de admin plakt de link handmatig in nadat
// de confession op Instagram gepost is, geen automatische koppeling.
const PublishedStats = ({
  instagramPostUrl,
  onInstagramPostUrlChange,
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

      {instagramPostUrl && (
        <a href={instagramPostUrl} target="_blank" rel="noreferrer" className="PublishedStats__link">
          Bekijk op Instagram ↗
        </a>
      )}

      <label className="PublishedStats__field">
        Instagram-link
        <TextInput
          type="text"
          value={instagramPostUrl}
          onChange={onInstagramPostUrlChange}
          placeholder="https://instagram.com/p/..."
          size="s"
        />
      </label>

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
