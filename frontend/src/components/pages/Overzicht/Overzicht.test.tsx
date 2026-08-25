// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router'
import Overzicht from './Overzicht'
import { OverzichtMock } from './Overzicht.mock'
import { listConfessions, syncConfessions } from '../../../api/confessions'
import { listTags } from '../../../api/tags'
import type { Confession } from '../../../api/confessions'

vi.mock('../../../api/confessions', () => ({
  listConfessions: vi.fn(),
  syncConfessions: vi.fn(),
}))
vi.mock('../../../api/tags', () => ({
  listTags: vi.fn(),
}))

const mockedListConfessions = vi.mocked(listConfessions)
const mockedListTags = vi.mocked(listTags)
const mockedSyncConfessions = vi.mocked(syncConfessions)

const sampleConfession: Confession = {
  id: '1',
  timestamp: '2026-01-01',
  title: 'Een titel',
  text: 'Een tekst',
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

// Overzicht navigeert nu (useNavigate), dus heeft een Router-context nodig -
// ook een tweede route om te controleren dat de navigatie effectief aankomt.
function renderOverzicht() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Overzicht {...OverzichtMock} />} />
        <Route path="/confessions/:id" element={<p>Detail-pagina</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  mockedListConfessions.mockReset()
  mockedListTags.mockReset()
  mockedSyncConfessions.mockReset()
  mockedListTags.mockResolvedValue([])
})

describe('Overzicht page', () => {
  it('toont een laadstatus, dan de confessions van de backend', async () => {
    mockedListConfessions.mockResolvedValue([sampleConfession])

    renderOverzicht()

    expect(screen.getByText('Bezig met laden...')).toBeTruthy()

    await waitFor(() => expect(screen.getByText('Een titel')).toBeTruthy())
  })

  it('toont de confessions met de meest recente eerst', async () => {
    mockedListConfessions.mockResolvedValue([
      { ...sampleConfession, id: '1', title: 'Oktober 2025', timestamp: '1-10-2025 14:36:58' },
      { ...sampleConfession, id: '2', title: 'Januari 2026', timestamp: '1-1-2026 10:19:28' },
      { ...sampleConfession, id: '3', title: 'November 2025', timestamp: '15-11-2025 09:00:00' },
    ])

    renderOverzicht()

    await waitFor(() => expect(screen.getByText('Oktober 2025')).toBeTruthy())
    const titles = screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)
    expect(titles).toEqual(['Januari 2026', 'November 2025', 'Oktober 2025'])
  })

  it('navigeert naar /confessions/:id bij het klikken op een confession', async () => {
    mockedListConfessions.mockResolvedValue([sampleConfession])

    renderOverzicht()
    await waitFor(() => expect(screen.getByText('Een titel')).toBeTruthy())

    fireEvent.click(screen.getByText('Een titel'))

    await waitFor(() => expect(screen.getByText('Detail-pagina')).toBeTruthy())
  })

  it('vraagt standaard geen verwijderde confessions op', async () => {
    mockedListConfessions.mockResolvedValue([])

    renderOverzicht()

    await waitFor(() => expect(mockedListConfessions).toHaveBeenCalledWith({ status: undefined, tagIds: [] }))
  })

  it('verbergt verwijderde confessions zelfs als de backend ze meestuurt (geen status gekozen = de backend kan geen "niet verwijderd" filteren)', async () => {
    mockedListConfessions.mockResolvedValue([
      sampleConfession,
      { ...sampleConfession, id: '2', title: 'Verwijderde confession', status: 'deleted' },
    ])

    renderOverzicht()

    await waitFor(() => expect(screen.getByText('Een titel')).toBeTruthy())
    expect(screen.queryByText('Verwijderde confession')).toBeNull()
  })

  it('vraagt status=deleted op wanneer Prullenmand aanstaat', async () => {
    mockedListConfessions.mockResolvedValue([])

    renderOverzicht()
    await waitFor(() => expect(mockedListConfessions).toHaveBeenCalled())

    fireEvent.click(screen.getByText('Prullenmand'))

    await waitFor(() => expect(mockedListConfessions).toHaveBeenLastCalledWith({ status: 'deleted', tagIds: [] }))
  })

  it('toont een foutmelding als het ophalen mislukt', async () => {
    mockedListConfessions.mockRejectedValue(new Error('kapot'))

    renderOverzicht()

    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('kapot'))
  })

  it('toont het aantal nieuwe confessions na sync, en haalt de lijst opnieuw op', async () => {
    mockedListConfessions.mockResolvedValue([])
    mockedSyncConfessions.mockResolvedValue({ new_confessions_count: 3 })

    renderOverzicht()
    await waitFor(() => expect(mockedListConfessions).toHaveBeenCalledTimes(1))

    fireEvent.click(screen.getByText('Sync nu'))

    await waitFor(() => expect(screen.getByText('3 nieuwe confessions opgehaald.')).toBeTruthy())
    expect(mockedListConfessions).toHaveBeenCalledTimes(2)
  })

  it('gebruikt enkelvoud voor precies 1 nieuwe confession', async () => {
    mockedListConfessions.mockResolvedValue([])
    mockedSyncConfessions.mockResolvedValue({ new_confessions_count: 1 })

    renderOverzicht()
    await waitFor(() => expect(mockedListConfessions).toHaveBeenCalled())

    fireEvent.click(screen.getByText('Sync nu'))

    await waitFor(() => expect(screen.getByText('1 nieuwe confession opgehaald.')).toBeTruthy())
  })

  it('meldt het duidelijk als er niets nieuws was', async () => {
    mockedListConfessions.mockResolvedValue([])
    mockedSyncConfessions.mockResolvedValue({ new_confessions_count: 0 })

    renderOverzicht()
    await waitFor(() => expect(mockedListConfessions).toHaveBeenCalled())

    fireEvent.click(screen.getByText('Sync nu'))

    await waitFor(() => expect(screen.getByText('Geen nieuwe confessions gevonden.')).toBeTruthy())
  })

  it('toont een foutmelding als sync mislukt', async () => {
    mockedListConfessions.mockResolvedValue([])
    mockedSyncConfessions.mockRejectedValue(new Error('sync kapot'))

    renderOverzicht()
    await waitFor(() => expect(mockedListConfessions).toHaveBeenCalled())

    fireEvent.click(screen.getByText('Sync nu'))

    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('sync kapot'))
  })
})
