import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import MemePreview from './MemePreview'
import { MemePreviewMock } from './MemePreview.mock'

const testID = 'MemePreview-' + Math.floor(Math.random() * 90000 + 10000)

describe('MemePreview', () => {
  it('toont de afbeelding en een downloadlink', () => {
    const rendered = renderToStaticMarkup(<MemePreview testID={testID} {...MemePreviewMock} />)
    expect(rendered).toContain(`data-testid="${testID}"`)
    expect(rendered).toContain(`src="${MemePreviewMock.imageUrl}"`)
    expect(rendered).toContain('Download')
    expect(rendered).toContain('<a')
  })
})
