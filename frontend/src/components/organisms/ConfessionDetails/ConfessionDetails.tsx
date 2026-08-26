import { MemePreview, PrivateMessageBlock, TagAssignment } from '../../molecules'
import type { ConfessionDetailsInterface } from './ConfessionDetails.interface'

const ConfessionDetails = ({
  text,
  adminMessage,
  memeUrls,
  assignedTags,
  availableTags,
  onToggleTag,
  testID,
}: ConfessionDetailsInterface) => {
  return (
    <div className="ConfessionDetails" data-testid={testID}>
      <p className="ConfessionDetails__text">{text}</p>
      {memeUrls.length > 0 && (
        <div className="ConfessionDetails__memes">
          {memeUrls.map((url, index) => (
            <MemePreview key={url} imageUrl={url} memeNumber={index + 1} />
          ))}
        </div>
      )}
      <PrivateMessageBlock message={adminMessage} />
      <TagAssignment assignedTags={assignedTags} availableTags={availableTags} onToggleTag={onToggleTag} />
    </div>
  )
}

export default ConfessionDetails
