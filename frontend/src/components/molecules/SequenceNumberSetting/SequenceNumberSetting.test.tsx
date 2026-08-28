import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import SequenceNumberSetting from './SequenceNumberSetting'
import { SequenceNumberSettingMock } from './SequenceNumberSetting.mock'

const testID = 'SequenceNumberSetting-' + Math.floor(Math.random() * 90000 + 10000)

describe('SequenceNumberSetting', () => {
  it('toont de huidige waarde en een opslaanknop', () => {
    const rendered = renderToStaticMarkup(<SequenceNumberSetting testID={testID} {...SequenceNumberSettingMock} />)
    expect(rendered).toContain(`data-testid="${testID}"`)
    expect(rendered).toContain(`value="${SequenceNumberSettingMock.value}"`)
    expect(rendered).toContain('Opslaan')
  })

  it('toont "Bezig..." en disabled de knop tijdens het opslaan', () => {
    const rendered = renderToStaticMarkup(<SequenceNumberSetting testID={testID} {...SequenceNumberSettingMock} saving />)
    expect(rendered).toContain('Bezig...')
    expect(rendered).toContain('disabled=""')
  })
})
