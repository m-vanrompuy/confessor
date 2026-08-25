import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate } from 'react-router'
import OverzichtLayout from '../../templates/OverzichtLayout'
import { useApiRequest } from '../../../hooks'
import { listConfessions, syncConfessions } from '../../../api/confessions'
import { listTags } from '../../../api/tags'
import { toConfessionListItems, searchConfessions } from '../../../lib'
import type { ConfessionStatus } from '../../../api/confessions'
import type { OverzichtInterface } from './Overzicht.interface'

type StatusFilter = Exclude<ConfessionStatus, 'deleted'> | ''

// Hoe lang de "X nieuwe confessions opgehaald"-melding blijft staan vóór ze
// vanzelf verdwijnt.
const SYNC_MESSAGE_DURATION_MS = 4000

const Overzicht = ({ testID }: OverzichtInterface) => {
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')
  const [status, setStatus] = useState<StatusFilter>('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [showDeleted, setShowDeleted] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

  const {
    data: confessions,
    loading: confessionsLoading,
    error: confessionsError,
    run: fetchConfessions,
  } = useApiRequest(listConfessions)
  const { data: tags, run: fetchTags } = useApiRequest(listTags)
  const { loading: syncing, error: syncError, run: runSync } = useApiRequest(syncConfessions)

  const currentFilterParams = useMemo(
    () => ({ status: showDeleted ? ('deleted' as const) : status || undefined, tagIds: selectedTagIds }),
    [status, showDeleted, selectedTagIds],
  )

  // fetchTags/fetchConfessions runnen hier "fire and forget" - de rethrow van
  // useApiRequest hier enkel opvangen zodat er geen unhandled-rejection
  // ontstaat (confessionsError wordt hieronder al getoond; een mislukte
  // tags-fetch toont vandaag nog niets aan de gebruiker - kleine, aparte
  // polish-kans, niet iets voor deze issue).
  useEffect(() => {
    fetchTags().catch(() => {})
  }, [fetchTags])

  useEffect(() => {
    fetchConfessions(currentFilterParams).catch(() => {})
  }, [fetchConfessions, currentFilterParams])

  // De sync-melding verdwijnt vanzelf i.p.v. voor altijd te blijven staan.
  useEffect(() => {
    if (syncMessage === null) {
      return
    }
    const timeoutId = setTimeout(() => setSyncMessage(null), SYNC_MESSAGE_DURATION_MS)
    return () => clearTimeout(timeoutId)
  }, [syncMessage])

  const handleSync = async () => {
    try {
      const result = await runSync()
      setSyncMessage(describeSyncResult(result.new_confessions_count))
      fetchConfessions(currentFilterParams)
    } catch {
      // syncError is al gezet door useApiRequest en wordt hierboven getoond -
      // hier niets meer te doen.
    }
  }

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
      {syncError && (
        <p className="Overzicht__error" role="alert">
          Sync mislukt: {syncError.message}
        </p>
      )}
      {syncMessage && <p className="Overzicht__status">{syncMessage}</p>}
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
            onSync: handleSync,
            syncing,
          }}
          list={{
            confessions: confessionListItems,
            onSelectConfession: (id: string) => navigate(`/confessions/${id}`),
          }}
        />
      )}
    </div>
  )
}

export default Overzicht

function describeSyncResult(newConfessionsCount: number): string {
  if (newConfessionsCount === 0) {
    return 'Geen nieuwe confessions gevonden.'
  }
  const suffix = newConfessionsCount === 1 ? '' : 's'
  return `${newConfessionsCount} nieuwe confession${suffix} opgehaald.`
}
