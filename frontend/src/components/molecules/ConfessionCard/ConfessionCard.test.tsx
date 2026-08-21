import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import ConfessionCard from './ConfessionCard'
import { ConfessionCardMock } from './ConfessionCard.mock'

const testID = 'ConfessionCard-' + Math.floor(Math.random() * 90000 + 10000)

describe('ConfessionCard', () => {
  it('renders the title, text, status and tags', () => {
    const rendered = renderToStaticMarkup(<ConfessionCard testID={testID} {...ConfessionCardMock} />)
    expect(rendered).toContain(`data-testid="${testID}"`)
    expect(rendered).toContain(ConfessionCardMock.title)
    expect(rendered).toContain('Nieuw')
    expect(rendered).toContain('zoekertje')
  })

  it('falls back to a placeholder when the title is empty', () => {
    const rendered = renderToStaticMarkup(<ConfessionCard testID={testID} {...ConfessionCardMock} title="" />)
    expect(rendered).toContain('(geen titel)')
  })
})
