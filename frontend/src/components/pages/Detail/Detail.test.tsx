// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router'
import Detail from './Detail'
import {
  getConfession,
  deleteConfession,
  markConfessionAsUsed,
  generateConfessionImages,
  updateConfessionTags,
  updateConfessionStats,
} from '../../../api/confessions'
import { listTags } from '../../../api/tags'
import type { Confession } from '../../../api/confessions'
import type { Tag } from '../../../api/tags'

vi.mock('../../../api/confessions', async () => {
  const actual = await vi.importActual<typeof import('../../../api/confessions')>('../../../api/confessions')
  return {
    ...actual,
    getConfession: vi.fn(),
    deleteConfession: vi.fn(),
    markConfessionAsUsed: vi.fn(),
    generateConfessionImages: vi.fn(),
    updateConfessionTags: vi.fn(),
    updateConfessionStats: vi.fn(),
  }
})
vi.mock('../../../api/tags', () => ({
  listTags: vi.fn(),
}))

const mockedGetConfession = vi.mocked(getConfession)
const mockedDeleteConfession = vi.mocked(deleteConfession)
const mockedMarkConfessionAsUsed = vi.mocked(markConfessionAsUsed)
const mockedGenerateConfessionImages = vi.mocked(generateConfessionImages)
const mockedUpdateConfessionTags = vi.mocked(updateConfessionTags)
const mockedUpdateConfessionStats = vi.mocked(updateConfessionStats)
const mockedListTags = vi.mocked(listTags)

const tags: Tag[] = [
  { id: 'tag-1', name: 'meme', color: '#aa3bff' },
  { id: 'tag-2', name: 'zoekertje', color: '#2f9e44' },
]

function makeConfession(overrides: Partial<Confession> = {}): Confession {
  return {
    id: '1',
    timestamp: '2026-01-01',
    title: 'Een titel',
    text: 'De volledige tekst.',
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
    ...overrides,
  }
}

function renderDetailAt(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/confessions/${id}`]}>
      <Routes>
        <Route path="/" element={<p>Overzicht-pagina</p>} />
        <Route path="/confessions/:id" element={<Detail />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  mockedGetConfession.mockReset()
  mockedDeleteConfession.mockReset()
  mockedMarkConfessionAsUsed.mockReset()
  mockedGenerateConfessionImages.mockReset()
  mockedUpdateConfessionTags.mockReset()
  mockedUpdateConfessionStats.mockReset()
  mockedListTags.mockReset()
  mockedListTags.mockResolvedValue(tags)
})

describe('Detail page', () => {
  it('toont een laadstatus, dan de echte confession met tekst en privébericht', async () => {
    mockedGetConfession.mockResolvedValue(makeConfession({ admin_message: 'Enkel voor de admin.' }))

    renderDetailAt('1')

    expect(screen.getByText('Bezig met laden...')).toBeTruthy()

    await waitFor(() => expect(screen.getByText('Een titel')).toBeTruthy())
    expect(screen.getByText('De volledige tekst.')).toBeTruthy()
    expect(screen.getByText('Enkel voor de admin.')).toBeTruthy()
    expect(mockedGetConfession).toHaveBeenCalledWith('1')
  })

  it('lost tag_ids op naar naam/kleur via de opgehaalde tags-lijst', async () => {
    mockedGetConfession.mockResolvedValue(makeConfession({ tag_ids: ['tag-1'] }))

    renderDetailAt('1')

    await waitFor(() => expect(screen.getByText('meme')).toBeTruthy())
    expect(screen.getByText('zoekertje')).toBeTruthy()
  })

  it('toont een foutmelding met terugknop als de confession niet gevonden wordt', async () => {
    mockedGetConfession.mockRejectedValue(new Error('niet gevonden'))

    renderDetailAt('onbestaand')

    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('niet gevonden'))
    expect(screen.getByText('← Terug naar overzicht')).toBeTruthy()
  })

  it('markeert als gebruikt en haalt de confession daarna opnieuw op', async () => {
    mockedGetConfession
      .mockResolvedValueOnce(makeConfession({ status: 'new' }))
      .mockResolvedValueOnce(makeConfession({ status: 'used', sequence_number: 3 }))
    mockedMarkConfessionAsUsed.mockResolvedValue(undefined)

    renderDetailAt('1')
    await waitFor(() => expect(screen.getByText('Een titel')).toBeTruthy())

    fireEvent.click(screen.getByText('Markeer als gebruikt'))

    await waitFor(() => expect(mockedGetConfession).toHaveBeenCalledTimes(2))
    expect(mockedMarkConfessionAsUsed).toHaveBeenCalledWith('1')
  })

  it('genereert afbeeldingen en haalt de confession daarna opnieuw op', async () => {
    mockedGetConfession.mockResolvedValue(makeConfession({ status: 'used', sequence_number: 1 }))
    mockedGenerateConfessionImages.mockResolvedValue({
      slide_paths: ['a.png'],
      suggested_caption: 'Confession #1',
      meme_storage_paths: [],
    })

    renderDetailAt('1')
    await waitFor(() => expect(screen.getByText('Een titel')).toBeTruthy())

    fireEvent.click(screen.getByText('Genereer afbeeldingen'))

    await waitFor(() => expect(mockedGenerateConfessionImages).toHaveBeenCalledWith('1'))
    await waitFor(() => expect(mockedGetConfession).toHaveBeenCalledTimes(2))
  })

  it('verwijdert en navigeert terug naar het overzicht', async () => {
    mockedGetConfession.mockResolvedValue(makeConfession())
    mockedDeleteConfession.mockResolvedValue(undefined)

    renderDetailAt('1')
    await waitFor(() => expect(screen.getByText('Een titel')).toBeTruthy())

    fireEvent.click(screen.getByText('Verwijderen'))

    await waitFor(() => expect(screen.getByText('Overzicht-pagina')).toBeTruthy())
    expect(mockedDeleteConfession).toHaveBeenCalledWith('1')
  })

  it('wijst een tag toe en haalt de confession daarna opnieuw op', async () => {
    mockedGetConfession
      .mockResolvedValueOnce(makeConfession({ tag_ids: [] }))
      .mockResolvedValueOnce(makeConfession({ tag_ids: ['tag-1'] }))
    mockedUpdateConfessionTags.mockResolvedValue(undefined)

    renderDetailAt('1')
    await waitFor(() => expect(screen.getByText('meme')).toBeTruthy())

    fireEvent.click(screen.getByText('meme'))

    await waitFor(() => expect(mockedUpdateConfessionTags).toHaveBeenCalledWith('1', ['tag-1']))
    await waitFor(() => expect(mockedGetConfession).toHaveBeenCalledTimes(2))
  })

  it('toont het statistieken-blok enkel voor gebruikte confessions, en slaat op wat ingevuld is', async () => {
    mockedGetConfession.mockResolvedValue(
      makeConfession({ status: 'used', sequence_number: 1, like_count: 5, comment_count: 2 }),
    )
    mockedUpdateConfessionStats.mockResolvedValue(undefined)

    renderDetailAt('1')
    await waitFor(() => expect(screen.getByText('Statistieken')).toBeTruthy())

    fireEvent.click(screen.getByText('Opslaan'))

    await waitFor(() =>
      expect(mockedUpdateConfessionStats).toHaveBeenCalledWith('1', {
        like_count: 5,
        comment_count: 2,
        instagram_post_url: null,
      }),
    )
  })

  it('verbergt het statistieken-blok voor een nieuwe confession', async () => {
    mockedGetConfession.mockResolvedValue(makeConfession({ status: 'new' }))

    renderDetailAt('1')
    await waitFor(() => expect(screen.getByText('Een titel')).toBeTruthy())

    expect(screen.queryByText('Statistieken')).toBeNull()
  })

  it('toont een foutmelding wanneer een actie mislukt', async () => {
    mockedGetConfession.mockResolvedValue(makeConfession())
    mockedDeleteConfession.mockRejectedValue(new Error('verwijderen mislukt'))

    renderDetailAt('1')
    await waitFor(() => expect(screen.getByText('Een titel')).toBeTruthy())

    fireEvent.click(screen.getByText('Verwijderen'))

    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('verwijderen mislukt'))
  })
})
