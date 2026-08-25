import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import ColorInput from './ColorInput'
import { ColorInputMock } from './ColorInput.mock'

const testID = 'ColorInput-' + Math.floor(Math.random() * 90000 + 10000)

describe('ColorInput', () => {
  it('rendert een native kleurkiezer met de gegeven waarde', () => {
    const rendered = renderToStaticMarkup(<ColorInput testID={testID} {...ColorInputMock} />)
    expect(rendered).toContain(`data-testid="${testID}"`)
    expect(rendered).toContain('type="color"')
    expect(rendered).toContain(`value="${ColorInputMock.value}"`)
  })
})
