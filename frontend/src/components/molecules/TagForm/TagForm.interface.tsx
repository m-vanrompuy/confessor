import type { ChangeEventHandler } from 'react'

export interface TagFormInterface {
  name: string
  color: string
  onNameChange: ChangeEventHandler<HTMLInputElement>
  onColorChange: ChangeEventHandler<HTMLInputElement>
  onSubmit: () => void
  /** "Aanmaken" bij een nieuwe tag, "Opslaan" bij het bewerken van een bestaande. */
  submitLabel: string
  saving?: boolean
  testID?: string
}
