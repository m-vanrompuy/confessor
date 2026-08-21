import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import SearchBar from './SearchBar'
import { SearchBarMock } from './SearchBar.mock'

const testID = 'SearchBar-' + Math.floor(Math.random() * 90000 + 10000)

describe('SearchBar', () => {
  it('renders a search input with the given testID', () => {
    const rendered = renderToStaticMarkup(<SearchBar testID={testID} {...SearchBarMock} />)
    expect(rendered).toContain(`data-testid="${testID}"`)
    expect(rendered).toContain('type="search"')
  })
})
