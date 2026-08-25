import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import DetailLayout from '../../templates/DetailLayout'
import type { TagAssignmentTag } from '../../molecules/TagAssignment/TagAssignment.interface'
import type { ConfessionStatus } from '../../../api/confessions'
import type { DetailInterface } from './Detail.interface'

// Tijdelijke mock-data - vervangen door een echte fetch zodra issue #36 dit
// scherm aan de backend koppelt.
const MOCK_TAGS: TagAssignmentTag[] = [
  { id: 'tag-1', name: 'meme', color: '#aa3bff' },
  { id: 'tag-2', name: 'zoekertje', color: '#2f9e44' },
]

const Detail = ({ testID }: DetailInterface) => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [status, setStatus] = useState<ConfessionStatus>('new')
  const [assignedTagIds, setAssignedTagIds] = useState<string[]>(['tag-1'])
  const [slideUrls, setSlideUrls] = useState<string[]>([])
  const [likeCount, setLikeCount] = useState(12)
  const [commentCount, setCommentCount] = useState(3)

  const toggleTag = (tagId: string) => {
    setAssignedTagIds((current) => (current.includes(tagId) ? current.filter((tagID) => tagID !== tagId) : [...current, tagId]))
  }

  return (
    <div className="Detail" data-testid={testID}>
      <DetailLayout
        title={`Confession ${id ?? ''}`}
        onBack={() => navigate('/')}
        details={{
          text: 'Ik ben op zoek naar een meisje dat ik tegen het lijf ben gelopen op de oudejaarsavond...',
          adminMessage: 'Dit bericht is enkel voor de admin bedoeld.',
          assignedTags: MOCK_TAGS.filter((tag) => assignedTagIds.includes(tag.id)),
          availableTags: MOCK_TAGS,
          onToggleTag: toggleTag,
        }}
        actions={{
          status,
          onMarkAsUsed: () => setStatus('used'),
          onDelete: () => setStatus('deleted'),
          onGenerate: () => setSlideUrls([`/confessions/${id}/slides/1`]),
        }}
        slides={{
          slideUrls,
          suggestedCaption: slideUrls.length > 0 ? 'Confession - voorgestelde caption komt hier.' : null,
        }}
        publishedStats={
          status === 'used'
            ? {
                instagramPostUrl: null,
                likeCount,
                commentCount,
                onLikeCountChange: (event: ChangeEvent<HTMLInputElement>) => setLikeCount(Number(event.target.value)),
                onCommentCountChange: (event: ChangeEvent<HTMLInputElement>) => setCommentCount(Number(event.target.value)),
                onSave: () => {},
              }
            : null
        }
      />
    </div>
  )
}

export default Detail
