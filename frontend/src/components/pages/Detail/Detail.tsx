import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Button } from '../../atoms'
import DetailLayout from '../../templates/DetailLayout'
import { useApiRequest } from '../../../hooks'
import {
  getConfession,
  deleteConfession,
  markConfessionAsUsed,
  generateConfessionImages,
  updateConfessionTags,
  updateConfessionStats,
  confessionSlideUrl,
} from '../../../api/confessions'
import type { Confession } from '../../../api/confessions'
import { listTags } from '../../../api/tags'
import type { Tag } from '../../../api/tags'
import type { DetailInterface } from './Detail.interface'

// Haalt de data op en toont laad-/foutstatussen. De echte content staat in
// DetailContent, met key={confession.id} - zo reset het bewerkbare
// statistieken-formulier enkel als de confession écht een andere is, niet
// telkens fetchConfession opnieuw data binnenhaalt na een actie (anders
// verliest de admin wat die net aan het intypen was bij bv. "Markeer als
// gebruikt"). Rechtstreeks setState in een effect om data te synchroniseren
// wordt ook door react-hooks/set-state-in-effect afgeraden - dit is het
// aanbevolen alternatief (zie react.dev/learn/you-might-not-need-an-effect).
const Detail = ({ testID }: DetailInterface) => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: confession, error: confessionError, run: fetchConfession } = useApiRequest(getConfession)
  const { data: tags, run: fetchTags } = useApiRequest(listTags)

  useEffect(() => {
    if (!id) {
      return
    }
    fetchConfession(id).catch(() => {})
  }, [fetchConfession, id])

  useEffect(() => {
    fetchTags().catch(() => {})
  }, [fetchTags])

  if (confessionError) {
    return (
      <div className="Detail" data-testid={testID}>
        <Button variant="secondary" size="s" onClick={() => navigate('/')}>
          ← Terug naar overzicht
        </Button>
        <p className="Detail__error" role="alert">
          Kon confession niet laden: {confessionError.message}
        </p>
      </div>
    )
  }

  if (!confession) {
    return (
      <div className="Detail" data-testid={testID}>
        <p className="Detail__status">Bezig met laden...</p>
      </div>
    )
  }

  return (
    <DetailContent
      key={confession.id}
      testID={testID}
      confession={confession}
      tags={tags ?? []}
      onRefetch={() => fetchConfession(confession.id).catch(() => {})}
      onBack={() => navigate('/')}
    />
  )
}

export default Detail

interface DetailContentProps {
  confession: Confession
  tags: Tag[]
  onRefetch: () => void
  onBack: () => void
  testID?: string
}

const DetailContent = ({ confession, tags, onRefetch, onBack, testID }: DetailContentProps) => {
  const { loading: markingAsUsed, error: markAsUsedError, run: runMarkAsUsed } = useApiRequest(markConfessionAsUsed)
  const { loading: deleting, error: deleteError, run: runDelete } = useApiRequest(deleteConfession)
  const { loading: generating, error: generateError, run: runGenerate } = useApiRequest(generateConfessionImages)
  const { error: tagUpdateError, run: runUpdateTags } = useApiRequest(updateConfessionTags)
  const { loading: savingStats, error: statsError, run: runUpdateStats } = useApiRequest(updateConfessionStats)

  const [likeCount, setLikeCount] = useState(confession.like_count ?? 0)
  const [commentCount, setCommentCount] = useState(confession.comment_count ?? 0)
  const [instagramPostUrl, setInstagramPostUrl] = useState(confession.instagram_post_url ?? '')

  const handleToggleTag = async (tagId: string) => {
    const nextTagIds = confession.tag_ids.includes(tagId)
      ? confession.tag_ids.filter((tagID) => tagID !== tagId)
      : [...confession.tag_ids, tagId]

    try {
      await runUpdateTags(confession.id, nextTagIds)
      onRefetch()
    } catch {
      // fout staat al in tagUpdateError, hieronder getoond.
    }
  }

  const handleMarkAsUsed = async () => {
    try {
      await runMarkAsUsed(confession.id)
      onRefetch()
    } catch {
      // fout staat al in markAsUsedError.
    }
  }

  const handleDelete = async () => {
    try {
      await runDelete(confession.id)
      onBack()
    } catch {
      // fout staat al in deleteError - blijft op de pagina zodat de admin 'm ziet.
    }
  }

  const handleGenerate = async () => {
    try {
      await runGenerate(confession.id)
      onRefetch()
    } catch {
      // fout staat al in generateError.
    }
  }

  const handleSaveStats = async () => {
    try {
      await runUpdateStats(confession.id, {
        like_count: likeCount,
        comment_count: commentCount,
        instagram_post_url: instagramPostUrl || null,
      })
      onRefetch()
    } catch {
      // fout staat al in statsError.
    }
  }

  const availableTags = tags.map((tag) => ({ id: tag.id ?? tag.name, name: tag.name, color: tag.color }))
  const assignedTags = availableTags.filter((tag) => confession.tag_ids.includes(tag.id))
  const actionError = markAsUsedError ?? deleteError ?? generateError ?? tagUpdateError ?? statsError

  return (
    <div className="Detail" data-testid={testID}>
      {actionError && (
        <p className="Detail__error" role="alert">
          Actie mislukt: {actionError.message}
        </p>
      )}
      <DetailLayout
        title={confession.title || '(geen titel)'}
        onBack={onBack}
        details={{
          text: confession.text,
          adminMessage: confession.admin_message,
          assignedTags,
          availableTags,
          onToggleTag: handleToggleTag,
        }}
        actions={{
          status: confession.status,
          onMarkAsUsed: handleMarkAsUsed,
          onDelete: handleDelete,
          onGenerate: handleGenerate,
          markingAsUsed,
          deleting,
          generating,
        }}
        slides={{
          slideUrls: confession.slide_paths.map((_, index) => confessionSlideUrl(confession.id, index + 1)),
          suggestedCaption: confession.suggested_caption,
        }}
        publishedStats={
          confession.status === 'used'
            ? {
                instagramPostUrl,
                onInstagramPostUrlChange: (event: ChangeEvent<HTMLInputElement>) => setInstagramPostUrl(event.target.value),
                likeCount,
                commentCount,
                onLikeCountChange: (event: ChangeEvent<HTMLInputElement>) => setLikeCount(Number(event.target.value)),
                onCommentCountChange: (event: ChangeEvent<HTMLInputElement>) => setCommentCount(Number(event.target.value)),
                onSave: handleSaveStats,
                saving: savingStats,
              }
            : null
        }
      />
    </div>
  )
}
