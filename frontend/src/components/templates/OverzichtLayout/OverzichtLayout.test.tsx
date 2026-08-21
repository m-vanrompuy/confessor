import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import OverzichtLayout from './OverzichtLayout'
import { OverzichtLayoutMock } from './OverzichtLayout.mock'

const testID = 'OverzichtLayout-' + Math.floor(Math.random() * 90000 + 10000)

describe('OverzichtLayout', () => {
  it('renders the toolbar and the confession list together', () => {
    const rendered = renderToStaticMarkup(<OverzichtLayout testID={testID} {...OverzichtLayoutMock} />)
    expect(rendered).toContain(`data-testid="${testID}"`)
    expect(rendered).toContain('Sync nu')
    expect(rendered).toContain(OverzichtLayoutMock.list.confessions[0].title)
  })
})
