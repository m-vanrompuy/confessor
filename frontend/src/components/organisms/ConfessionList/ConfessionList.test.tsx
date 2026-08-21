import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import ConfessionList from './ConfessionList'
import { ConfessionListMock } from './ConfessionList.mock'

const testID = 'ConfessionList-' + Math.floor(Math.random() * 90000 + 10000)

describe('ConfessionList', () => {
  it('renders one card per confession', () => {
    const rendered = renderToStaticMarkup(<ConfessionList testID={testID} {...ConfessionListMock} />)
    for (const confession of ConfessionListMock.confessions) {
      expect(rendered).toContain(confession.title)
    }
  })

  it('renders an empty state when there are no confessions', () => {
    const rendered = renderToStaticMarkup(
      <ConfessionList testID={testID} confessions={[]} onSelectConfession={() => {}} />,
    )
    expect(rendered).toContain(`data-testid="${testID}"`)
    expect(rendered).toContain('Geen confessions gevonden')
  })
})
