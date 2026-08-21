// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
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
  like_count: null,
  comment_count: null,
  stats_last_updated_at: null,
  meme_attachments: [],
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

    render(<Overzicht {...OverzichtMock} />)

    expect(screen.getByText('Bezig met laden...')).toBeTruthy()

    await waitFor(() => expect(screen.getByText('Een titel')).toBeTruthy())
  })

  it('vraagt standaard geen verwijderde confessions op', async () => {
    mockedListConfessions.mockResolvedValue([])

    render(<Overzicht {...OverzichtMock} />)

    await waitFor(() => expect(mockedListConfessions).toHaveBeenCalledWith({ status: undefined, tagIds: [] }))
  })

  it('verbergt verwijderde confessions zelfs als de backend ze meestuurt (geen status gekozen = de backend kan geen "niet verwijderd" filteren)', async () => {
    mockedListConfessions.mockResolvedValue([
      sampleConfession,
      { ...sampleConfession, id: '2', title: 'Verwijderde confession', status: 'deleted' },
    ])

    render(<Overzicht {...OverzichtMock} />)

    await waitFor(() => expect(screen.getByText('Een titel')).toBeTruthy())
    expect(screen.queryByText('Verwijderde confession')).toBeNull()
  })

  it('vraagt status=deleted op wanneer Prullenmand aanstaat', async () => {
    mockedListConfessions.mockResolvedValue([])

    render(<Overzicht {...OverzichtMock} />)
    await waitFor(() => expect(mockedListConfessions).toHaveBeenCalled())

    fireEvent.click(screen.getByText('Prullenmand'))

    await waitFor(() => expect(mockedListConfessions).toHaveBeenLastCalledWith({ status: 'deleted', tagIds: [] }))
  })

  it('toont een foutmelding als het ophalen mislukt', async () => {
    mockedListConfessions.mockRejectedValue(new Error('kapot'))

    render(<Overzicht {...OverzichtMock} />)

    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('kapot'))
  })

  it('toont het aantal nieuwe confessions na sync, en haalt de lijst opnieuw op', async () => {
    mockedListConfessions.mockResolvedValue([])
    mockedSyncConfessions.mockResolvedValue({ new_confessions_count: 3 })

    render(<Overzicht {...OverzichtMock} />)
    await waitFor(() => expect(mockedListConfessions).toHaveBeenCalledTimes(1))

    fireEvent.click(screen.getByText('Sync nu'))

    await waitFor(() => expect(screen.getByText('3 nieuwe confessions opgehaald.')).toBeTruthy())
    expect(mockedListConfessions).toHaveBeenCalledTimes(2)
  })

  it('gebruikt enkelvoud voor precies 1 nieuwe confession', async () => {
    mockedListConfessions.mockResolvedValue([])
    mockedSyncConfessions.mockResolvedValue({ new_confessions_count: 1 })

    render(<Overzicht {...OverzichtMock} />)
    await waitFor(() => expect(mockedListConfessions).toHaveBeenCalled())

    fireEvent.click(screen.getByText('Sync nu'))

    await waitFor(() => expect(screen.getByText('1 nieuwe confession opgehaald.')).toBeTruthy())
  })

  it('meldt het duidelijk als er niets nieuws was', async () => {
    mockedListConfessions.mockResolvedValue([])
    mockedSyncConfessions.mockResolvedValue({ new_confessions_count: 0 })

    render(<Overzicht {...OverzichtMock} />)
    await waitFor(() => expect(mockedListConfessions).toHaveBeenCalled())

    fireEvent.click(screen.getByText('Sync nu'))

    await waitFor(() => expect(screen.getByText('Geen nieuwe confessions gevonden.')).toBeTruthy())
  })

  it('toont een foutmelding als sync mislukt', async () => {
    mockedListConfessions.mockResolvedValue([])
    mockedSyncConfessions.mockRejectedValue(new Error('sync kapot'))

    render(<Overzicht {...OverzichtMock} />)
    await waitFor(() => expect(mockedListConfessions).toHaveBeenCalled())

    fireEvent.click(screen.getByText('Sync nu'))

    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('sync kapot'))
  })
})
