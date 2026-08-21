import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import TagChip from './TagChip'
import { TagChipMock } from './TagChip.mock'

const testID = 'TagChip-' + Math.floor(Math.random() * 90000 + 10000)

describe('TagChip', () => {
  it('renders as a static span when no onClick is given', () => {
    const rendered = renderToStaticMarkup(<TagChip testID={testID} {...TagChipMock} />)
    expect(rendered).toContain(`data-testid="${testID}"`)
    expect(rendered).toContain('<span')
    expect(rendered).toContain(TagChipMock.name)
  })

  it('renders as a button when onClick is given', () => {
    const rendered = renderToStaticMarkup(<TagChip testID={testID} {...TagChipMock} onClick={() => {}} />)
    expect(rendered).toContain('<button')
  })
})
