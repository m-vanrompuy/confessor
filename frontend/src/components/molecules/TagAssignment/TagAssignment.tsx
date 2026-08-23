import { TagChip } from '../../atoms'
import type { TagAssignmentInterface } from './TagAssignment.interface'

const TagAssignment = ({ assignedTags, availableTags, onToggleTag, testID }: TagAssignmentInterface) => {
  const assignedIds = new Set(assignedTags.map((tag) => tag.id))
  const unassignedTags = availableTags.filter((tag) => !assignedIds.has(tag.id))

  return (
    <div className="TagAssignment" data-testid={testID}>
      <h3 className="TagAssignment__heading">Tags</h3>

      <div className="TagAssignment__assigned">
        {assignedTags.length === 0 && <p className="TagAssignment__empty">Nog geen tags toegewezen.</p>}
        {assignedTags.map((tag) => (
          <TagChip key={tag.id} name={tag.name} color={tag.color} selected onClick={() => onToggleTag(tag.id)} />
        ))}
      </div>

      {unassignedTags.length > 0 && (
        <div className="TagAssignment__available">
          {unassignedTags.map((tag) => (
            <TagChip key={tag.id} name={tag.name} color={tag.color} onClick={() => onToggleTag(tag.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

export default TagAssignment
