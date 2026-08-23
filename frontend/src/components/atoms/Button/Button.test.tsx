import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import Button from './Button'
import { ButtonMock } from './Button.mock'

const testID = 'Button-' + Math.floor(Math.random() * 90000 + 10000)

describe('Button', () => {
  it('renders with the given testID and children', () => {
    const rendered = renderToStaticMarkup(<Button testID={testID} {...ButtonMock} />)
    expect(rendered).toContain(`data-testid="${testID}"`)
    expect(rendered).toContain('Click me')
  })

  it('renders as disabled when disabled is passed', () => {
    const rendered = renderToStaticMarkup(<Button testID={testID} {...ButtonMock} disabled />)
    expect(rendered).toContain('disabled=""')
  })

  it('renders as a real <a> when href is given', () => {
    const rendered = renderToStaticMarkup(<Button testID={testID} {...ButtonMock} href="/confessions/1/slides/1" download />)
    expect(rendered).toContain('<a')
    expect(rendered).toContain('href="/confessions/1/slides/1"')
  })

  it('valt terug op <button> wanneer href én disabled samen gezet zijn', () => {
    const rendered = renderToStaticMarkup(<Button testID={testID} {...ButtonMock} href="/x" disabled />)
    expect(rendered).toContain('<button')
    expect(rendered).not.toContain('<a')
  })
})
