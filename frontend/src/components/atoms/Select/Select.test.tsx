import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import Select from './Select'
import { SelectMock } from './Select.mock'

const testID = 'Select-' + Math.floor(Math.random() * 90000 + 10000)

describe('Select', () => {
  it('renders an option for the placeholder and each option', () => {
    const rendered = renderToStaticMarkup(<Select testID={testID} {...SelectMock} />)
    expect(rendered).toContain(`data-testid="${testID}"`)
    expect(rendered).toContain(SelectMock.placeholder)
    for (const option of SelectMock.options) {
      expect(rendered).toContain(option.label)
    }
  })
})
