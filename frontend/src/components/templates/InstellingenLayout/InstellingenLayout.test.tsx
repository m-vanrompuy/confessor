import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import InstellingenLayout from './InstellingenLayout'
import { InstellingenLayoutMock } from './InstellingenLayout.mock'

const testID = 'InstellingenLayout-' + Math.floor(Math.random() * 90000 + 10000)

describe('InstellingenLayout', () => {
  it('toont de TagManager op de Tags-tab', () => {
    const rendered = renderToStaticMarkup(<InstellingenLayout testID={testID} {...InstellingenLayoutMock} />)
    expect(rendered).toContain(`data-testid="${testID}"`)
    expect(rendered).toContain('meme')
    expect(rendered).not.toContain('Binnenkort beschikbaar')
  })

  it('toont een placeholder op de nog niet gebouwde Template-tab', () => {
    const rendered = renderToStaticMarkup(<InstellingenLayout testID={testID} {...InstellingenLayoutMock} activeTab="template" />)
    expect(rendered).toContain('Binnenkort beschikbaar.')
  })

  it('toont de SequenceNumberSetting op de Algemeen-tab', () => {
    const rendered = renderToStaticMarkup(<InstellingenLayout testID={testID} {...InstellingenLayoutMock} activeTab="algemeen" />)
    expect(rendered).toContain('Eerstvolgend volgnummer')
    expect(rendered).not.toContain('Binnenkort beschikbaar')
  })
})
