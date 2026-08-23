import type { ConfessionStatus } from '../../../api/confessions'

export interface ConfessionActionsInterface {
  status: ConfessionStatus
  onMarkAsUsed: () => void
  onDelete: () => void
  onGenerate: () => void
  markingAsUsed?: boolean
  deleting?: boolean
  generating?: boolean
  testID?: string
}
