import { PrivateMessageBlock, TagAssignment } from '../../molecules'
import type { ConfessionDetailsInterface } from './ConfessionDetails.interface'

const ConfessionDetails = ({
  text,
  adminMessage,
  assignedTags,
  availableTags,
  onToggleTag,
  testID,
}: ConfessionDetailsInterface) => {
  return (
    <div className="ConfessionDetails" data-testid={testID}>
      <p className="ConfessionDetails__text">{text}</p>
      <PrivateMessageBlock message={adminMessage} />
      <TagAssignment assignedTags={assignedTags} availableTags={availableTags} onToggleTag={onToggleTag} />
    </div>
  )
}

export default ConfessionDetails
