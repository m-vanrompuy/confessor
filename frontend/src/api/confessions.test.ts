import { describe, it, expect, vi, afterEach } from 'vitest'
import { listConfessions } from './confessions'

// Regressietest voor een bug gevonden tijdens #34: een lege tagIds-array
// stuurde `?tags=` (lege string) mee, wat de backend naar [""] splitst en
// dan ALLES wegfiltert - geen enkele confession heeft een tag-ID van "".
describe('listConfessions', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('stuurt geen tags-param bij een lege tagIds-array', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await listConfessions({ tagIds: [] })

    const requestedUrl = fetchMock.mock.calls[0][0] as string
    expect(requestedUrl).not.toContain('tags=')
  })

  it('stuurt wel een tags-param wanneer er tag-IDs meegegeven zijn', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await listConfessions({ tagIds: ['tag-1', 'tag-2'] })

    const requestedUrl = fetchMock.mock.calls[0][0] as string
    expect(requestedUrl).toContain('tags=tag-1%2Ctag-2')
  })
})
