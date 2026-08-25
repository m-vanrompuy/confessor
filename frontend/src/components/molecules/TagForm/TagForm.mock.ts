import type { TagFormInterface } from './TagForm.interface'

export const TagFormMock: TagFormInterface = {
  name: 'meme',
  color: '#aa3bff',
  onNameChange: () => {},
  onColorChange: () => {},
  onSubmit: () => {},
  submitLabel: 'Aanmaken',
}
