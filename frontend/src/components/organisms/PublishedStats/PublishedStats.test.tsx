import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import PublishedStats from './PublishedStats'
import { PublishedStatsMock } from './PublishedStats.mock'

const testID = 'PublishedStats-' + Math.floor(Math.random() * 90000 + 10000)

describe('PublishedStats', () => {
  it('toont een placeholder wanneer er nog geen Instagram-link is', () => {
    const rendered = renderToStaticMarkup(<PublishedStats testID={testID} {...PublishedStatsMock} />)
    expect(rendered).toContain(`data-testid="${testID}"`)
    expect(rendered).toContain('Nog geen Instagram-link ingesteld.')
  })

  it('toont een link wanneer er wel een Instagram-URL is', () => {
    const rendered = renderToStaticMarkup(
      <PublishedStats testID={testID} {...PublishedStatsMock} instagramPostUrl="https://instagram.com/p/x" />,
    )
    expect(rendered).toContain('href="https://instagram.com/p/x"')
  })
})
