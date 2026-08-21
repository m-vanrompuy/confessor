import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import Toolbar from './Toolbar'
import { ToolbarMock } from './Toolbar.mock'

const testID = 'Toolbar-' + Math.floor(Math.random() * 90000 + 10000)

describe('Toolbar', () => {
  it('renders the search field, filters, and a Sync nu button', () => {
    const rendered = renderToStaticMarkup(<Toolbar testID={testID} {...ToolbarMock} />)
    expect(rendered).toContain(`data-testid="${testID}"`)
    expect(rendered).toContain('Sync nu')
  })

  it('shows a busy label and disables the button while syncing', () => {
    const rendered = renderToStaticMarkup(<Toolbar testID={testID} {...ToolbarMock} syncing />)
    expect(rendered).toContain('Bezig...')
    expect(rendered).toContain('disabled=""')
  })
})
