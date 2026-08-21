import { describe, it, expect } from 'vitest'
import { toConfessionListItems } from './toConfessionListItems'
import type { Confession } from '../../api/confessions'
import type { Tag } from '../../api/tags'

const tags: Tag[] = [
  { id: 'tag-1', name: 'meme', color: '#aa3bff' },
  { id: 'tag-2', name: 'zoekertje', color: '#2f9e44' },
]

function makeConfession(overrides: Partial<Confession> = {}): Confession {
  return {
    id: '1',
    timestamp: '2026-01-01',
    title: 'Titel',
    text: 'Tekst',
    admin_message: null,
    image_link: null,
    status: 'new',
    tag_ids: [],
    sequence_number: null,
    suggested_caption: null,
    slide_paths: [],
    used_at: null,
    like_count: null,
    comment_count: null,
    stats_last_updated_at: null,
    meme_attachments: [],
    ...overrides,
  }
}

describe('toConfessionListItems', () => {
  it('zet id/title/text/status rechtstreeks over', () => {
    const [item] = toConfessionListItems([makeConfession({ id: '42', title: 'X', text: 'Y', status: 'used' })], tags)
    expect(item).toMatchObject({ id: '42', title: 'X', text: 'Y', status: 'used' })
  })

  it('lost tag_ids op naar volledige tag-objecten', () => {
    const [item] = toConfessionListItems([makeConfession({ tag_ids: ['tag-2'] })], tags)
    expect(item.tags).toEqual([{ id: 'tag-2', name: 'zoekertje', color: '#2f9e44' }])
  })

  it('slaat onbekende tag-ID\'s over i.p.v. te crashen', () => {
    const [item] = toConfessionListItems([makeConfession({ tag_ids: ['tag-2', 'niet-bestaand'] })], tags)
    expect(item.tags).toEqual([{ id: 'tag-2', name: 'zoekertje', color: '#2f9e44' }])
  })
})
