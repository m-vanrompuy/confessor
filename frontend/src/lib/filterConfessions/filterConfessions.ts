import type { ConfessionListItem } from '../../components/organisms/ConfessionList/ConfessionList.interface'
import type { ConfessionStatus } from '../../api/confessions'

export type ConfessionStatusFilter = Exclude<ConfessionStatus, 'deleted'> | ''

export interface FilterConfessionsOptions {
  searchValue: string
  status: ConfessionStatusFilter
  selectedTagIds: string[]
  showDeleted: boolean
}

// Puur en los van React testbaar - en exact de logica die issue #34 straks
// vervangt door een echte backend-filter (GET /confessions?status=&tags=).
export function filterConfessions(
  confessions: ConfessionListItem[],
  options: FilterConfessionsOptions,
): ConfessionListItem[] {
  return confessions.filter((confession) => matchesFilters(confession, options))
}

function matchesFilters(confession: ConfessionListItem, options: FilterConfessionsOptions): boolean {
  if (options.showDeleted) {
    return confession.status === 'deleted'
  }

  return (
    confession.status !== 'deleted' &&
    matchesStatus(confession, options.status) &&
    matchesTags(confession, options.selectedTagIds) &&
    matchesSearch(confession, options.searchValue)
  )
}

function matchesStatus(confession: ConfessionListItem, status: ConfessionStatusFilter): boolean {
  return status === '' || confession.status === status
}

function matchesTags(confession: ConfessionListItem, selectedTagIds: string[]): boolean {
  if (selectedTagIds.length === 0) {
    return true
  }
  return confession.tags.some((tag) => selectedTagIds.includes(tag.id))
}

function matchesSearch(confession: ConfessionListItem, searchValue: string): boolean {
  const query = searchValue.trim().toLowerCase()
  if (query === '') {
    return true
  }
  return confession.title.toLowerCase().includes(query) || confession.text.toLowerCase().includes(query)
}

export default filterConfessions
