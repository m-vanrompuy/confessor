import type { ConfessionStatus } from '../../../api/confessions'

export interface ConfessionActionsInterface {
  status: ConfessionStatus
  onMarkAsUsed: () => void
  onDelete: () => void
  onGenerate: () => void
  /** Enkel relevant/zichtbaar wanneer status "deleted" is (issue #100). */
  onRestore: () => void
  markingAsUsed?: boolean
  deleting?: boolean
  generating?: boolean
  restoring?: boolean
  testID?: string
}
