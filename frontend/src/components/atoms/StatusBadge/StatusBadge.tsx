import type { ConfessionStatus } from '../../../api/confessions'
import type { StatusBadgeInterface } from './StatusBadge.interface'

const STATUS_LABELS: Record<ConfessionStatus, string> = {
  new: 'Nieuw',
  used: 'Gebruikt',
  deleted: 'Verwijderd',
}

const StatusBadge = ({ status, testID }: StatusBadgeInterface) => {
  return (
    <span data-testid={testID} className={`StatusBadge StatusBadge--${status}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

export default StatusBadge
