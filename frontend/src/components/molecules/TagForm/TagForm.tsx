import { TextInput, ColorInput, Button } from '../../atoms'
import type { TagFormInterface } from './TagForm.interface'

const TagForm = ({ name, color, onNameChange, onColorChange, onSubmit, submitLabel, saving = false, testID }: TagFormInterface) => {
  const isNameEmpty = name.trim() === ''

  return (
    <div className="TagForm" data-testid={testID}>
      <ColorInput value={color} onChange={onColorChange} />
      <TextInput value={name} onChange={onNameChange} placeholder="Naam" size="s" />
      <Button variant="secondary" size="s" onClick={onSubmit} disabled={isNameEmpty || saving}>
        {saving ? 'Bezig...' : submitLabel}
      </Button>
    </div>
  )
}

export default TagForm
