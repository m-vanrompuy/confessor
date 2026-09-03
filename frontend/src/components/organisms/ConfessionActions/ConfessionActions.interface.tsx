import type { ConfessionStatus } from '../../../api/confessions'

export interface ConfessionActionsInterface {
  status: ConfessionStatus
  onMarkAsUsed: () => void
  onDelete: () => void
  onGenerate: () => void
  /** Enkel relevant/zichtbaar wanneer status "deleted" is (issue #100). */
  onRestore: () => void
  /** Enkel relevant/zichtbaar wanneer status "used" is (issue #97, ook ná het
   *  genereren van afbeeldingen toegestaan sinds #120 - unmark ruimt die dan
   *  zelf op) - voor per ongeluk "Markeer als gebruikt" klikken. */
  onUnmark: () => void
  markingAsUsed?: boolean
  deleting?: boolean
  generating?: boolean
  restoring?: boolean
  unmarking?: boolean
  testID?: string
}
