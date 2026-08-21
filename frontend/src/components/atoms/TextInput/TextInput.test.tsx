import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import TextInput from './TextInput'
import { TextInputMock } from './TextInput.mock'

const testID = 'TextInput-' + Math.floor(Math.random() * 90000 + 10000)

describe('TextInput', () => {
  it('renders with the given testID and placeholder', () => {
    const rendered = renderToStaticMarkup(<TextInput testID={testID} {...TextInputMock} />)
    expect(rendered).toContain(`data-testid="${testID}"`)
    expect(rendered).toContain(TextInputMock.placeholder)
  })

  it('renders as disabled when disabled is passed', () => {
    const rendered = renderToStaticMarkup(<TextInput testID={testID} {...TextInputMock} disabled />)
    expect(rendered).toContain('disabled=""')
  })
})
