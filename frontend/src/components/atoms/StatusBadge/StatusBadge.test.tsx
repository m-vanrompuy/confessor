import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import StatusBadge from './StatusBadge'
import { StatusBadgeMock } from './StatusBadge.mock'

const testID = 'StatusBadge-' + Math.floor(Math.random() * 90000 + 10000)

describe('StatusBadge', () => {
  it('renders the Dutch label for each status', () => {
    expect(renderToStaticMarkup(<StatusBadge testID={testID} status="new" />)).toContain('Nieuw')
    expect(renderToStaticMarkup(<StatusBadge testID={testID} status="used" />)).toContain('Gebruikt')
    expect(renderToStaticMarkup(<StatusBadge testID={testID} status="deleted" />)).toContain('Verwijderd')
  })

  it('renders with the given testID', () => {
    const rendered = renderToStaticMarkup(<StatusBadge testID={testID} {...StatusBadgeMock} />)
    expect(rendered).toContain(`data-testid="${testID}"`)
  })
})
