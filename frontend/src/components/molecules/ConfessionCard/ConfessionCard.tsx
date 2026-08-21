import { StatusBadge, TagChip } from '../../atoms'
import type { ConfessionCardInterface } from './ConfessionCard.interface'

const ConfessionCard = ({ title, text, tags, status, onClick, testID }: ConfessionCardInterface) => {
  return (
    <button type="button" className="ConfessionCard" onClick={onClick} data-testid={testID}>
      <div className="ConfessionCard__header">
        <h3 className="ConfessionCard__title">{title || '(geen titel)'}</h3>
        <StatusBadge status={status} />
      </div>
      <p className="ConfessionCard__preview">{text}</p>
      {tags.length > 0 && (
        <div className="ConfessionCard__tags">
          {tags.map((tag) => (
            <TagChip key={tag.id} name={tag.name} color={tag.color} />
          ))}
        </div>
      )}
    </button>
  )
}

export default ConfessionCard
