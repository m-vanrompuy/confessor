import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import SlidePreview from './SlidePreview'
import { SlidePreviewMock } from './SlidePreview.mock'

const testID = 'SlidePreview-' + Math.floor(Math.random() * 90000 + 10000)

describe('SlidePreview', () => {
  it('toont de afbeelding en een downloadlink', () => {
    const rendered = renderToStaticMarkup(<SlidePreview testID={testID} {...SlidePreviewMock} />)
    expect(rendered).toContain(`data-testid="${testID}"`)
    expect(rendered).toContain(`src="${SlidePreviewMock.imageUrl}"`)
    expect(rendered).toContain('Download')
    expect(rendered).toContain('<a')
  })
})
