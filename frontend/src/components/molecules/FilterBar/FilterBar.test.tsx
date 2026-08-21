import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import FilterBar from './FilterBar'
import { FilterBarMock } from './FilterBar.mock'

const testID = 'FilterBar-' + Math.floor(Math.random() * 90000 + 10000)

describe('FilterBar', () => {
  it('renders the status select, every tag, and the Prullenmand toggle', () => {
    const rendered = renderToStaticMarkup(<FilterBar testID={testID} {...FilterBarMock} />)
    expect(rendered).toContain(`data-testid="${testID}"`)
    expect(rendered).toContain('Prullenmand')
    for (const tag of FilterBarMock.availableTags) {
      expect(rendered).toContain(tag.name)
    }
  })
})
