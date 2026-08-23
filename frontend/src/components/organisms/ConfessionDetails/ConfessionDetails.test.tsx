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
    expect(rendered).toContain('niet openbaar')
    expect(rendered).toContain('meme')
  })

  it('toont geen privébericht-blok wanneer er geen is', () => {
    const rendered = renderToStaticMarkup(<ConfessionDetails testID={testID} {...ConfessionDetailsMock} adminMessage={null} />)
    expect(rendered).not.toContain('niet openbaar')
  })
})
