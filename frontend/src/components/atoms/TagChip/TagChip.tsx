import type { TagChipInterface } from './TagChip.interface'

const TagChip = ({ name, color, selected = false, onClick, testID }: TagChipInterface) => {
  const style = { backgroundColor: color, color: contrastingTextColor(color) }
  const className = `TagChip${onClick ? ' TagChip--clickable' : ''}${selected ? ' TagChip--selected' : ''}`

  if (!onClick) {
    return (
      <span data-testid={testID} className={className} style={style}>
        {name}
      </span>
    )
  }

  return (
    <button
      type="button"
      data-testid={testID}
      className={className}
      style={style}
      onClick={onClick}
      aria-pressed={selected}
    >
      {name}
    </button>
  )
}

export default TagChip

// Simple relative-luminance check - light tag colors get dark text, dark
// colors get light text. Assumes a 6-digit hex string (what <input type="color">
// produces, the expected source once Instellingen's tag editor exists);
// anything else falls back to dark text rather than guessing.
function contrastingTextColor(backgroundColor: string): string {
  const hex = backgroundColor.replace('#', '')
  if (hex.length !== 6) {
    return '#08060d'
  }

  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance > 0.6 ? '#08060d' : '#ffffff'
}
