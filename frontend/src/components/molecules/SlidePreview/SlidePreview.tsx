import { Button } from '../../atoms'
import type { SlidePreviewInterface } from './SlidePreview.interface'

const SlidePreview = ({ imageUrl, slideNumber, testID }: SlidePreviewInterface) => {
  return (
    <div className="SlidePreview" data-testid={testID}>
      <img src={imageUrl} alt={`Slide ${slideNumber}`} className="SlidePreview__image" />
      <Button href={imageUrl} download={`slide-${slideNumber}.png`} target="_blank" variant="secondary" size="s">
        Download
      </Button>
    </div>
  )
}

export default SlidePreview
