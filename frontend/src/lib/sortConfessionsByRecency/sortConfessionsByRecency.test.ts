import { describe, it, expect } from 'vitest'
import { sortConfessionsByRecency } from './sortConfessionsByRecency'
import type { Confession } from '../../api/confessions'

function makeConfession(id: string, timestamp: string): Confession {
  return {
    id,
    timestamp,
    title: '',
    text: '',
    admin_message: null,
    image_link: null,
    status: 'new',
    tag_ids: [],
    sequence_number: null,
    suggested_caption: null,
    slide_paths: [],
    used_at: null,
    instagram_post_url: null,
    like_count: null,
    comment_count: null,
    stats_last_updated_at: null,
    meme_attachments: [],
  }
}

describe('sortConfessionsByRecency', () => {
  it('sorteert meest recent eerst, ook over jaargrenzen heen', () => {
    // Bewust een geval waar lexicografisch sorteren fout zou gaan:
    // "1-1-2026" komt alfabetisch vóór "1-10-2025", maar is er meer dan een
    // jaar later.
    const oct2025 = makeConfession('oct-2025', '1-10-2025 14:36:58')
    const jan2026 = makeConfession('jan-2026', '1-1-2026 10:19:28')
    const nov2025 = makeConfession('nov-2025', '15-11-2025 09:00:00')

    const sorted = sortConfessionsByRecency([oct2025, jan2026, nov2025])

    expect(sorted.map((c) => c.id)).toEqual(['jan-2026', 'nov-2025', 'oct-2025'])
  })

  it('sorteert binnen dezelfde dag op tijdstip', () => {
    const morning = makeConfession('morning', '5-3-2026 8:00:00')
    const evening = makeConfession('evening', '5-3-2026 20:15:30')

    const sorted = sortConfessionsByRecency([morning, evening])

    expect(sorted.map((c) => c.id)).toEqual(['evening', 'morning'])
  })

  it('muteert de invoerarray niet', () => {
    const original = [makeConfession('a', '1-1-2025 00:00:00'), makeConfession('b', '2-1-2025 00:00:00')]
    const originalOrder = original.map((c) => c.id)

    sortConfessionsByRecency(original)

    expect(original.map((c) => c.id)).toEqual(originalOrder)
  })

  it('valt terug op het einde bij een onverwacht timestamp-formaat, zonder te crashen', () => {
    const valid = makeConfession('valid', '1-1-2026 00:00:00')
    const malformed = makeConfession('malformed', 'niet-een-datum')

    const sorted = sortConfessionsByRecency([malformed, valid])

    expect(sorted.map((c) => c.id)).toEqual(['valid', 'malformed'])
  })
})
