import { describe, it, expect } from 'vitest'
import { filterConfessions } from './filterConfessions'
import type { ConfessionListItem } from '../../components/organisms/ConfessionList/ConfessionList.interface'

const confessions: ConfessionListItem[] = [
  { id: '1', title: 'Nieuwe confession', text: 'over katten', tags: [{ id: 'tag-1', name: 'meme', color: '#aa3bff' }], status: 'new' },
  { id: '2', title: 'Gebruikte confession', text: 'over honden', tags: [], status: 'used' },
  { id: '3', title: 'Verwijderde confession', text: 'over vogels', tags: [], status: 'deleted' },
]

const baseOptions = { searchValue: '', status: '' as const, selectedTagIds: [], showDeleted: false }

describe('filterConfessions', () => {
  it('sluit verwijderde confessions standaard uit', () => {
    const result = filterConfessions(confessions, baseOptions)
    expect(result.map((c) => c.id)).toEqual(['1', '2'])
  })

  it('toont enkel verwijderde confessions als showDeleted aanstaat', () => {
    const result = filterConfessions(confessions, { ...baseOptions, showDeleted: true })
    expect(result.map((c) => c.id)).toEqual(['3'])
  })

  it('filtert op status', () => {
    const result = filterConfessions(confessions, { ...baseOptions, status: 'used' })
    expect(result.map((c) => c.id)).toEqual(['2'])
  })

  it('filtert op geselecteerde tags', () => {
    const result = filterConfessions(confessions, { ...baseOptions, selectedTagIds: ['tag-1'] })
    expect(result.map((c) => c.id)).toEqual(['1'])
  })

  it('filtert op zoektekst in titel of tekst', () => {
    const result = filterConfessions(confessions, { ...baseOptions, searchValue: 'honden' })
    expect(result.map((c) => c.id)).toEqual(['2'])
  })
})
