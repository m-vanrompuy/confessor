// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import Instellingen from './Instellingen'
import { InstellingenMock } from './Instellingen.mock'
import { listTags, createTag, updateTag, deleteTag } from '../../../api/tags'
import type { Tag } from '../../../api/tags'
import { getSetting, updateSetting } from '../../../api/settings'

vi.mock('../../../api/tags', () => ({
  listTags: vi.fn(),
  createTag: vi.fn(),
  updateTag: vi.fn(),
  deleteTag: vi.fn(),
}))

// Instellingen haalt bij het monten ook de volgnummer-instelling op (issue
// #116) - zonder deze mock doet dat een echte (falende) fetch, wat een
// onverwachte tweede foutmelding oplevert en deze tests laat flaken.
vi.mock('../../../api/settings', () => ({
  getSetting: vi.fn(),
  updateSetting: vi.fn(),
}))

const mockedListTags = vi.mocked(listTags)
const mockedCreateTag = vi.mocked(createTag)
const mockedUpdateTag = vi.mocked(updateTag)
const mockedDeleteTag = vi.mocked(deleteTag)
const mockedGetSetting = vi.mocked(getSetting)
const mockedUpdateSetting = vi.mocked(updateSetting)

const sampleTag: Tag = { id: 'tag-1', name: 'meme', color: '#aa3bff' }

beforeEach(() => {
  mockedListTags.mockReset()
  mockedCreateTag.mockReset()
  mockedUpdateTag.mockReset()
  mockedDeleteTag.mockReset()
  mockedGetSetting.mockReset().mockResolvedValue('1')
  mockedUpdateSetting.mockReset()
})

describe('Instellingen page', () => {
  it('toont de tags van de backend op de Tags-tab', async () => {
    mockedListTags.mockResolvedValue([sampleTag])

    render(<Instellingen {...InstellingenMock} />)

    await waitFor(() => expect(screen.getByText('meme')).toBeTruthy())
    expect(mockedListTags).toHaveBeenCalled()
  })

  it('maakt een nieuwe tag aan en haalt de lijst daarna opnieuw op', async () => {
    mockedListTags.mockResolvedValue([])
    mockedCreateTag.mockResolvedValue({ id: 'tag-2', name: 'nieuwe tag', color: '#aa3bff' })

    render(<Instellingen {...InstellingenMock} />)
    await waitFor(() => expect(mockedListTags).toHaveBeenCalledTimes(1))

    fireEvent.change(screen.getByPlaceholderText('Naam'), { target: { value: 'nieuwe tag' } })
    fireEvent.click(screen.getByText('Aanmaken'))

    await waitFor(() => expect(mockedCreateTag).toHaveBeenCalledWith({ name: 'nieuwe tag', color: '#aa3bff' }))
    await waitFor(() => expect(mockedListTags).toHaveBeenCalledTimes(2))
  })

  it('verwijdert een tag en haalt de lijst daarna opnieuw op', async () => {
    mockedListTags.mockResolvedValue([sampleTag])
    mockedDeleteTag.mockResolvedValue(undefined)

    render(<Instellingen {...InstellingenMock} />)
    await waitFor(() => expect(screen.getByText('meme')).toBeTruthy())

    fireEvent.click(screen.getByText('Verwijderen'))

    await waitFor(() => expect(mockedDeleteTag).toHaveBeenCalledWith('tag-1'))
    await waitFor(() => expect(mockedListTags).toHaveBeenCalledTimes(2))
  })

  it('toont een foutmelding als het aanmaken mislukt', async () => {
    mockedListTags.mockResolvedValue([])
    mockedCreateTag.mockRejectedValue(new Error('aanmaken mislukt'))

    render(<Instellingen {...InstellingenMock} />)
    await waitFor(() => expect(mockedListTags).toHaveBeenCalledTimes(1))

    fireEvent.change(screen.getByPlaceholderText('Naam'), { target: { value: 'x' } })
    fireEvent.click(screen.getByText('Aanmaken'))

    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('aanmaken mislukt'))
  })
})
