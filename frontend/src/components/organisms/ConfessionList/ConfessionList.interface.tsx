import type { ConfessionStatus } from '../../../api/confessions'
import type { ConfessionCardTag } from '../../molecules/ConfessionCard/ConfessionCard.interface'

export interface ConfessionListItem {
  id: string
  title: string
  text: string
  tags: ConfessionCardTag[]
  status: ConfessionStatus
}

export interface ConfessionListInterface {
  confessions: ConfessionListItem[]
  onSelectConfession: (id: string) => void
  testID?: string
}
