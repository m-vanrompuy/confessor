import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import OverzichtLayout from '../../templates/OverzichtLayout'
import { useApiRequest } from '../../../hooks'
import { listConfessions } from '../../../api/confessions'
import { listTags } from '../../../api/tags'
import { toConfessionListItems, searchConfessions } from '../../../lib'
import type { ConfessionStatus } from '../../../api/confessions'
import type { OverzichtInterface } from './Overzicht.interface'

type StatusFilter = Exclude<ConfessionStatus, 'deleted'> | ''

const Overzicht = ({ testID }: OverzichtInterface) => {
  const [searchValue, setSearchValue] = useState('')
  const [status, setStatus] = useState<StatusFilter>('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [showDeleted, setShowDeleted] = useState(false)

  const {
    data: confessions,
    loading: confessionsLoading,
    error: confessionsError,
    run: fetchConfessions,
  } = useApiRequest(listConfessions)
  const { data: tags, run: fetchTags } = useApiRequest(listTags)

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  useEffect(() => {
    fetchConfessions({
      status: showDeleted ? 'deleted' : status || undefined,
      tagIds: selectedTagIds,
    })
  }, [fetchConfessions, status, selectedTagIds, showDeleted])

  const confessionListItems = useMemo(() => {
    const items = toConfessionListItems(confessions ?? [], tags ?? [])
    // De backend kent geen "niet verwijderd"-filter (enkel een exacte status
    // of geen filter) - zonder gekozen status krijgen we dus ook verwijderde
    // confessions terug. Die moeten hier hoe dan ook weg, tenzij Prullenmand
    // net aanstaat (dan bestaat de lijst sowieso enkel uit verwijderde).
    const visible = showDeleted ? items : items.filter((item) => item.status !== 'deleted')
    return searchConfessions(visible, searchValue)
  }, [confessions, tags, searchValue, showDeleted])

  const availableTags = useMemo(
    () => (tags ?? []).map((tag) => ({ id: tag.id ?? tag.name, name: tag.name, color: tag.color })),
    [tags],
  )

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((current) => (current.includes(tagId) ? current.filter((id) => id !== tagId) : [...current, tagId]))
  }

  // Pas de "geen confessions gevonden"-leegtestaat tonen ná de eerste
  // succesvolle fetch - anders knippert die eventjes vóór de echte data er is.
  const hasLoadedConfessions = confessions !== null

  return (
    <div className="Overzicht" data-testid={testID}>
      {confessionsError && (
        <p className="Overzicht__error" role="alert">
          Kon confessions niet laden: {confessionsError.message}
        </p>
      )}
      {!hasLoadedConfessions && confessionsLoading && <p className="Overzicht__status">Bezig met laden...</p>}
      {hasLoadedConfessions && (
        <OverzichtLayout
          toolbar={{
            searchValue,
            onSearchChange: (event: ChangeEvent<HTMLInputElement>) => setSearchValue(event.target.value),
            filter: {
              status,
              onStatusChange: (event) => setStatus(event.target.value as StatusFilter),
              availableTags,
              selectedTagIds,
              onToggleTag: toggleTag,
              showDeleted,
              onToggleShowDeleted: () => setShowDeleted((current) => !current),
            },
            onSync: () => {},
          }}
          list={{
            confessions: confessionListItems,
            // Navigatie naar /confessions/:id volgt zodra de Detail-pagina
            // bestaat (issue #35/#36) - zie ook issue #82.
            onSelectConfession: () => {},
          }}
        />
      )}
    </div>
  )
}

export default Overzicht
