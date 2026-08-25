import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import TagForm from './TagForm'
import { TagFormMock } from './TagForm.mock'

const testID = 'TagForm-' + Math.floor(Math.random() * 90000 + 10000)

describe('TagForm', () => {
  it('rendert naam, kleur en de gegeven submit-label', () => {
    const rendered = renderToStaticMarkup(<TagForm testID={testID} {...TagFormMock} />)
    expect(rendered).toContain(`data-testid="${testID}"`)
    expect(rendered).toContain('Aanmaken')
    expect(rendered).toContain(`value="${TagFormMock.name}"`)
  })

  it('houdt de submit-knop disabled bij een lege naam', () => {
    const rendered = renderToStaticMarkup(<TagForm testID={testID} {...TagFormMock} name="" />)
    expect(rendered).toContain('disabled=""')
  })

  it('toont een bezig-status tijdens het opslaan', () => {
    const rendered = renderToStaticMarkup(<TagForm testID={testID} {...TagFormMock} saving />)
    expect(rendered).toContain('Bezig...')
  })
})
