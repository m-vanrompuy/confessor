import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import GeneratedSlidesGallery from './GeneratedSlidesGallery'
import { GeneratedSlidesGalleryMock } from './GeneratedSlidesGallery.mock'

const testID = 'GeneratedSlidesGallery-' + Math.floor(Math.random() * 90000 + 10000)

describe('GeneratedSlidesGallery', () => {
  it('toont een preview per slide en de voorgestelde caption', () => {
    const rendered = renderToStaticMarkup(<GeneratedSlidesGallery testID={testID} {...GeneratedSlidesGalleryMock} />)
    expect(rendered).toContain(`data-testid="${testID}"`)
    expect(rendered).toContain('Voorgestelde caption')
    expect((rendered.match(/SlidePreview/g) ?? []).length).toBeGreaterThan(0)
  })

  it('toont een leeg-bericht wanneer er nog niets gegenereerd is', () => {
    const rendered = renderToStaticMarkup(
      <GeneratedSlidesGallery testID={testID} slideUrls={[]} suggestedCaption={null} />,
    )
    expect(rendered).toContain('Nog geen afbeeldingen gegenereerd.')
  })

  it('toont "Download alles" zodra er meerdere slides zijn', () => {
    const rendered = renderToStaticMarkup(<GeneratedSlidesGallery testID={testID} {...GeneratedSlidesGalleryMock} />)
    expect(rendered).toContain('Download alles')
  })

  it('toont geen "Download alles" bij precies 1 slide - de losse knop volstaat dan al', () => {
    const rendered = renderToStaticMarkup(
      <GeneratedSlidesGallery testID={testID} {...GeneratedSlidesGalleryMock} slideUrls={[GeneratedSlidesGalleryMock.slideUrls[0]]} />,
    )
    expect(rendered).not.toContain('Download alles')
  })
})
