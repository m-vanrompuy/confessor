import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import StatsEditor from './StatsEditor'
import { StatsEditorMock } from './StatsEditor.mock'

const testID = 'StatsEditor-' + Math.floor(Math.random() * 90000 + 10000)

describe('StatsEditor', () => {
  it('toont de huidige like- en reactie-aantallen', () => {
    const rendered = renderToStaticMarkup(<StatsEditor testID={testID} {...StatsEditorMock} />)
    expect(rendered).toContain(`data-testid="${testID}"`)
    expect(rendered).toContain('value="12"')
    expect(rendered).toContain('value="3"')
  })

  it('toont een bezig-status en disabled knop tijdens het opslaan', () => {
    const rendered = renderToStaticMarkup(<StatsEditor testID={testID} {...StatsEditorMock} saving />)
    expect(rendered).toContain('Bezig...')
    expect(rendered).toContain('disabled=""')
  })
})
