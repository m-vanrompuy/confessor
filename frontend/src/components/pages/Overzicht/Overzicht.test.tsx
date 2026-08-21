import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import Overzicht from './Overzicht'
import { OverzichtMock } from './Overzicht.mock'

const testID = 'Overzicht-' + Math.floor(Math.random() * 90000 + 10000)

describe('Overzicht page', () => {
  it('toont bij het openen alle niet-verwijderde confessions, geen verwijderde', () => {
    const rendered = renderToStaticMarkup(<Overzicht testID={testID} {...OverzichtMock} />)
    expect(rendered).toContain(`data-testid="${testID}"`)
    expect(rendered).toContain('Op zoek naar het meisje van oudejaarsavond')
    expect(rendered).not.toContain('Verwijderde confession')
  })
})
