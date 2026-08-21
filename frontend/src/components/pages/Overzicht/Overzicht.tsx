import { useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import OverzichtLayout from '../../templates/OverzichtLayout'
import { filterConfessions } from '../../../lib'
import type { ConfessionStatusFilter } from '../../../lib/filterConfessions/filterConfessions'
import type { ConfessionListItem } from '../../organisms/ConfessionList/ConfessionList.interface'
import type { FilterBarTag } from '../../molecules/FilterBar/FilterBar.interface'
import type { OverzichtInterface } from './Overzicht.interface'

// Tijdelijke mock-data - vervangen door een echte fetch via listConfessions()
// zodra issue #34 dit scherm aan de backend koppelt.
const MOCK_TAGS: FilterBarTag[] = [
  { id: 'tag-1', name: 'meme', color: '#aa3bff' },
  { id: 'tag-2', name: 'zoekertje', color: '#2f9e44' },
]

const MOCK_CONFESSIONS: ConfessionListItem[] = [
  {
    id: '1',
    title: 'Op zoek naar het meisje van oudejaarsavond',
    text: 'Ik ben op zoek naar een meisje dat ik tegen het lijf ben gelopen op de oudejaarsavond...',
    tags: [MOCK_TAGS[1]],
    status: 'new',
  },
  {
    id: '2',
    title: 'Confession #2',
    text: 'Een confession die al gebruikt en gepubliceerd is.',
    tags: [],
    status: 'used',
  },
  {
    id: '3',
    title: 'Een grappige meme-confession',
    text: 'Deze confession heeft een meme-tag.',
    tags: [MOCK_TAGS[0]],
    status: 'new',
  },
  {
    id: '4',
    title: 'Verwijderde confession',
    text: 'Deze is verwijderd - enkel zichtbaar via Prullenmand.',
    tags: [],
    status: 'deleted',
  },
]

const Overzicht = ({ testID }: OverzichtInterface) => {
  const [searchValue, setSearchValue] = useState('')
  const [status, setStatus] = useState<ConfessionStatusFilter>('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [showDeleted, setShowDeleted] = useState(false)

  const confessions = useMemo(
    () => filterConfessions(MOCK_CONFESSIONS, { searchValue, status, selectedTagIds, showDeleted }),
    [searchValue, status, selectedTagIds, showDeleted],
  )

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((current) => (current.includes(tagId) ? current.filter((id) => id !== tagId) : [...current, tagId]))
  }

  return (
    <div className="Overzicht" data-testid={testID}>
      <OverzichtLayout
        toolbar={{
          searchValue,
          onSearchChange: (event: ChangeEvent<HTMLInputElement>) => setSearchValue(event.target.value),
          filter: {
            status,
            onStatusChange: (event) => setStatus(event.target.value as ConfessionStatusFilter),
            availableTags: MOCK_TAGS,
            selectedTagIds,
            onToggleTag: toggleTag,
            showDeleted,
            onToggleShowDeleted: () => setShowDeleted((current) => !current),
          },
          onSync: () => {},
        }}
        list={{
          confessions,
          onSelectConfession: () => {},
        }}
      />
    </div>
  )
}

export default Overzicht
