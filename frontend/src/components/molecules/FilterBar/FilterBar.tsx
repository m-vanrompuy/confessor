import { Select, TagChip, Button } from '../../atoms'
import type { FilterBarInterface } from './FilterBar.interface'

const STATUS_OPTIONS = [
  { value: 'new', label: 'Nieuw' },
  { value: 'unused', label: 'Ongebruikt' },
  { value: 'used', label: 'Gebruikt' },
]

const FilterBar = ({
  status,
  onStatusChange,
  availableTags,
  selectedTagIds,
  onToggleTag,
  showDeleted,
  onToggleShowDeleted,
  testID,
}: FilterBarInterface) => {
  return (
    <div className="FilterBar" data-testid={testID}>
      <Select value={status} onChange={onStatusChange} options={STATUS_OPTIONS} placeholder="Alle statussen" />

      <div className="FilterBar__tags">
        {availableTags.map((tag) => (
          <TagChip
            key={tag.id}
            name={tag.name}
            color={tag.color}
            selected={selectedTagIds.includes(tag.id)}
            onClick={() => onToggleTag(tag.id)}
          />
        ))}
      </div>

      <Button variant={showDeleted ? 'primary' : 'secondary'} size="s" onClick={onToggleShowDeleted}>
        Prullenmand
      </Button>
    </div>
  )
}

export default FilterBar
