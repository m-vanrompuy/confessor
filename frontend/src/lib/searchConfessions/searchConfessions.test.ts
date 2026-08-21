import { describe, it, expect } from 'vitest'
import { searchConfessions } from './searchConfessions'
import type { ConfessionListItem } from '../../components/organisms/ConfessionList/ConfessionList.interface'

const confessions: ConfessionListItem[] = [
  { id: '1', title: 'Over katten', text: 'een tekst over honden', tags: [], status: 'new' },
  { id: '2', title: 'Over vogels', text: 'een tekst over vissen', tags: [], status: 'used' },
]

describe('searchConfessions', () => {
  it('geeft alles terug bij een lege zoekterm', () => {
    expect(searchConfessions(confessions, '')).toEqual(confessions)
    expect(searchConfessions(confessions, '   ')).toEqual(confessions)
  })

  it('matcht op titel', () => {
    expect(searchConfessions(confessions, 'katten').map((c) => c.id)).toEqual(['1'])
  })

  it('matcht ook op tekst, niet enkel titel', () => {
    expect(searchConfessions(confessions, 'vissen').map((c) => c.id)).toEqual(['2'])
  })

  it('is niet hoofdlettergevoelig', () => {
    expect(searchConfessions(confessions, 'KATTEN').map((c) => c.id)).toEqual(['1'])
  })
})
