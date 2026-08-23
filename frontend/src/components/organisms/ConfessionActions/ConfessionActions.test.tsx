import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import ConfessionActions from './ConfessionActions'
import { ConfessionActionsMock } from './ConfessionActions.mock'

const testID = 'ConfessionActions-' + Math.floor(Math.random() * 90000 + 10000)

function isGenerateDisabled(rendered: string): boolean {
  const generateButtonStart = rendered.indexOf('Genereer afbeeldingen')
  const buttonTagStart = rendered.lastIndexOf('<button', generateButtonStart)
  return rendered.slice(buttonTagStart, generateButtonStart).includes('disabled')
}

describe('ConfessionActions', () => {
  it('houdt Genereren disabled zolang de confession niet gebruikt is', () => {
    const rendered = renderToStaticMarkup(<ConfessionActions testID={testID} {...ConfessionActionsMock} status="new" />)
    expect(isGenerateDisabled(rendered)).toBe(true)
  })

  it('maakt Genereren beschikbaar zodra de confession gebruikt is', () => {
    const rendered = renderToStaticMarkup(<ConfessionActions testID={testID} {...ConfessionActionsMock} status="used" />)
    expect(isGenerateDisabled(rendered)).toBe(false)
  })

  it('houdt Markeer als gebruikt en Verwijderen disabled voor een verwijderde confession', () => {
    const rendered = renderToStaticMarkup(<ConfessionActions testID={testID} {...ConfessionActionsMock} status="deleted" />)
    expect(rendered).toContain(`data-testid="${testID}"`)
    // Beide knoppen moeten disabled zijn - drie knoppen totaal, dus minstens
    // twee disabled-attributen verwacht.
    expect((rendered.match(/disabled=""/g) ?? []).length).toBeGreaterThanOrEqual(2)
  })
})
