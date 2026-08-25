import { useEffect, useState } from 'react'
import InstellingenLayout from '../../templates/InstellingenLayout'
import type { InstellingenTab } from '../../templates/InstellingenLayout/InstellingenLayout.interface'
import { useApiRequest } from '../../../hooks'
import { listTags, createTag, updateTag, deleteTag } from '../../../api/tags'
import type { InstellingenInterface } from './Instellingen.interface'

const Instellingen = ({ testID }: InstellingenInterface) => {
  const [activeTab, setActiveTab] = useState<InstellingenTab>('tags')

  const { data: tags, error: tagsError, run: fetchTags } = useApiRequest(listTags)
  const { loading: creating, error: createError, run: runCreateTag } = useApiRequest(createTag)
  const { loading: saving, error: updateError, run: runUpdateTag } = useApiRequest(updateTag)
  const { loading: deleting, error: deleteError, run: runDeleteTag } = useApiRequest(deleteTag)

  useEffect(() => {
    fetchTags().catch(() => {})
  }, [fetchTags])

  const handleCreateTag = async (name: string, color: string) => {
    try {
      await runCreateTag({ name, color })
      fetchTags().catch(() => {})
    } catch {
      // fout staat al in createError, hieronder getoond.
    }
  }

  const handleUpdateTag = async (tagId: string, name: string, color: string) => {
    try {
      await runUpdateTag(tagId, { name, color })
      fetchTags().catch(() => {})
    } catch {
      // fout staat al in updateError.
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    try {
      await runDeleteTag(tagId)
      fetchTags().catch(() => {})
    } catch {
      // fout staat al in deleteError.
    }
  }

  // Zelfde fallback als Overzicht/Detail: id is technisch optioneel op Tag,
  // in de praktijk altijd gezet zodra een tag echt in Firestore bestaat.
  const displayTags = (tags ?? []).map((tag) => ({ id: tag.id ?? tag.name, name: tag.name, color: tag.color }))
  const actionError = createError ?? updateError ?? deleteError

  return (
    <div className="Instellingen" data-testid={testID}>
      <h2 className="Instellingen__title">Instellingen</h2>

      {tagsError && (
        <p className="Instellingen__error" role="alert">
          Kon tags niet laden: {tagsError.message}
        </p>
      )}
      {actionError && (
        <p className="Instellingen__error" role="alert">
          Actie mislukt: {actionError.message}
        </p>
      )}

      <InstellingenLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tagManager={{
          tags: displayTags,
          onCreateTag: handleCreateTag,
          onUpdateTag: handleUpdateTag,
          onDeleteTag: handleDeleteTag,
          creating,
          saving,
          deleting,
        }}
      />
    </div>
  )
}

export default Instellingen
