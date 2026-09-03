import type { ConfessionActionsInterface } from './ConfessionActions.interface'

export const ConfessionActionsMock: ConfessionActionsInterface = {
  status: 'new',
  onMarkAsUsed: () => {},
  onDelete: () => {},
  onGenerate: () => {},
  onRestore: () => {},
  onUnmark: () => {},
}
