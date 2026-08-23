import { SlidePreview } from '../../molecules'
import type { GeneratedSlidesGalleryInterface } from './GeneratedSlidesGallery.interface'

const GeneratedSlidesGallery = ({ slideUrls, suggestedCaption, testID }: GeneratedSlidesGalleryInterface) => {
  if (slideUrls.length === 0) {
    return (
      <p className="GeneratedSlidesGallery__empty" data-testid={testID}>
        Nog geen afbeeldingen gegenereerd.
      </p>
    )
  }

  return (
    <div className="GeneratedSlidesGallery" data-testid={testID}>
      <div className="GeneratedSlidesGallery__slides">
        {slideUrls.map((url, index) => (
          <SlidePreview key={url} imageUrl={url} slideNumber={index + 1} />
        ))}
      </div>
      {suggestedCaption && (
        <div className="GeneratedSlidesGallery__caption">
          <h4 className="GeneratedSlidesGallery__captionLabel">Voorgestelde caption</h4>
          <p className="GeneratedSlidesGallery__captionText">{suggestedCaption}</p>
        </div>
      )}
    </div>
  )
}

export default GeneratedSlidesGallery
