import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import ConfessionDetails from './ConfessionDetails'
import { ConfessionDetailsMock } from './ConfessionDetails.mock'

const testID = 'ConfessionDetails-' + Math.floor(Math.random() * 90000 + 10000)

describe('ConfessionDetails', () => {
  it('toont de volledige tekst, het privébericht apart, en de tags', () => {
    const rendered = renderToStaticMarkup(<ConfessionDetails testID={testID} {...ConfessionDetailsMock} />)
    expect(rendered).toContain(`data-testid="${testID}"`)
    expect(rendered).toContain(ConfessionDetailsMock.text)
    expect(rendered).toContain('Bericht aan de admin')
    expect(rendered).toContain('meme')
  })

  it('toont geen privébericht-blok wanneer er geen is', () => {
    const rendered = renderToStaticMarkup(<ConfessionDetails testID={testID} {...ConfessionDetailsMock} adminMessage={null} />)
    expect(rendered).not.toContain('Bericht aan de admin')
  })

  it('toont de originele meme-bijlage wanneer die er is', () => {
    const rendered = renderToStaticMarkup(<ConfessionDetails testID={testID} {...ConfessionDetailsMock} />)
    expect(rendered).toContain(`src="${ConfessionDetailsMock.memeUrls[0]}"`)
  })

  it('toont geen meme-sectie wanneer er geen bijlage is', () => {
    const rendered = renderToStaticMarkup(<ConfessionDetails testID={testID} {...ConfessionDetailsMock} memeUrls={[]} />)
    expect(rendered).not.toContain('ConfessionDetails__memes')
  })
})
