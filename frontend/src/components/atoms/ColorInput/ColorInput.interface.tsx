import type { ChangeEventHandler } from 'react'

export interface ColorInputInterface {
  /** Hex-kleur, bv. "#aa3bff" - wat <input type="color"> zelf al afdwingt. */
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
  testID?: string
}
