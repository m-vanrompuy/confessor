import { TextInput, Button } from '../../atoms'
import type { StatsEditorInterface } from './StatsEditor.interface'

const StatsEditor = ({
  likeCount,
  commentCount,
  onLikeCountChange,
  onCommentCountChange,
  onSave,
  saving = false,
  testID,
}: StatsEditorInterface) => {
  return (
    <div className="StatsEditor" data-testid={testID}>
      <label className="StatsEditor__field">
        Likes
        <TextInput type="number" min={0} value={String(likeCount)} onChange={onLikeCountChange} size="s" />
      </label>
      <label className="StatsEditor__field">
        Reacties
        <TextInput type="number" min={0} value={String(commentCount)} onChange={onCommentCountChange} size="s" />
      </label>
      <Button variant="secondary" size="s" onClick={onSave} disabled={saving}>
        {saving ? 'Bezig...' : 'Opslaan'}
      </Button>
    </div>
  )
}

export default StatsEditor
