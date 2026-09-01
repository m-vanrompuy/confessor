import type { ChangeEventHandler } from 'react'

export interface SequenceNumberSettingInterface {
  /** Als string omdat het invoerveld tijdens het typen leeg/onvolledig kan zijn. */
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
  onSave: () => void
  saving?: boolean
  testID?: string
}
