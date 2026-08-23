import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import TagAssignment from './TagAssignment'
import { TagAssignmentMock } from './TagAssignment.mock'

const testID = 'TagAssignment-' + Math.floor(Math.random() * 90000 + 10000)

describe('TagAssignment', () => {
  it('toont toegewezen tags en de nog beschikbare tags apart', () => {
    const rendered = renderToStaticMarkup(<TagAssignment testID={testID} {...TagAssignmentMock} />)
    expect(rendered).toContain(`data-testid="${testID}"`)
    expect(rendered).toContain('meme')
    expect(rendered).toContain('zoekertje')
  })

  it('toont een leeg-bericht als er nog geen tags toegewezen zijn', () => {
    const rendered = renderToStaticMarkup(
      <TagAssignment testID={testID} {...TagAssignmentMock} assignedTags={[]} />,
    )
    expect(rendered).toContain('Nog geen tags toegewezen.')
  })
})
