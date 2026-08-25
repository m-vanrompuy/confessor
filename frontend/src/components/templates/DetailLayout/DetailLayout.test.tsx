import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import DetailLayout from './DetailLayout'
import { DetailLayoutMock } from './DetailLayout.mock'

const testID = 'DetailLayout-' + Math.floor(Math.random() * 90000 + 10000)

describe('DetailLayout', () => {
  it('rendert titel, terugknop en alle onderdelen samen', () => {
    const rendered = renderToStaticMarkup(<DetailLayout testID={testID} {...DetailLayoutMock} />)
    expect(rendered).toContain(`data-testid="${testID}"`)
    expect(rendered).toContain(DetailLayoutMock.title)
    expect(rendered).toContain('Terug naar overzicht')
  })

  it('toont geen statistieken-blok wanneer publishedStats null is', () => {
    const rendered = renderToStaticMarkup(<DetailLayout testID={testID} {...DetailLayoutMock} publishedStats={null} />)
    expect(rendered).not.toContain('Statistieken')
  })
})
