import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import PrivateMessageBlock from './PrivateMessageBlock'
import { PrivateMessageBlockMock } from './PrivateMessageBlock.mock'

const testID = 'PrivateMessageBlock-' + Math.floor(Math.random() * 90000 + 10000)

describe('PrivateMessageBlock', () => {
  it('toont het bericht apart van de hoofdtekst, zonder toegangscontrole-taal', () => {
    const rendered = renderToStaticMarkup(<PrivateMessageBlock testID={testID} {...PrivateMessageBlockMock} />)
    expect(rendered).toContain(`data-testid="${testID}"`)
    expect(rendered).toContain('Bericht van de indiener aan de admin')
    expect(rendered).toContain('Dit bericht is enkel voor de admin bedoeld.')
    expect(rendered).not.toContain('niet openbaar')
    expect(rendered).not.toContain('🔒')
  })

  it('legt uit waarom het apart staat: verschijnt nooit in het gegenereerde resultaat', () => {
    const rendered = renderToStaticMarkup(<PrivateMessageBlock testID={testID} {...PrivateMessageBlockMock} />)
    expect(rendered).toContain('Verschijnt nooit in de gegenereerde afbeelding of caption.')
  })

  it('rendert niets wanneer er geen bericht is', () => {
    const rendered = renderToStaticMarkup(<PrivateMessageBlock testID={testID} message={null} />)
    expect(rendered).toBe('')
  })
})
