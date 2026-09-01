import { describe, it, expect } from 'vitest'
import { buildSlideDownloads } from './buildSlideDownloads'

describe('buildSlideDownloads', () => {
  it('koppelt elke URL aan een 1-based bestandsnaam', () => {
    const urls = ['http://localhost:8080/confessions/1/slides/1', 'http://localhost:8080/confessions/1/slides/2']

    const downloads = buildSlideDownloads(urls)

    expect(downloads).toEqual([
      { url: urls[0], filename: 'slide-1.png' },
      { url: urls[1], filename: 'slide-2.png' },
    ])
  })

  it('geeft een lege lijst terug zonder slides', () => {
    expect(buildSlideDownloads([])).toEqual([])
  })
})
