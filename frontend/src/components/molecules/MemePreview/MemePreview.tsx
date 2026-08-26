import { Button } from '../../atoms'
import type { MemePreviewInterface } from './MemePreview.interface'

const MemePreview = ({ imageUrl, memeNumber, testID }: MemePreviewInterface) => {
  return (
    <div className="MemePreview" data-testid={testID}>
      <img src={imageUrl} alt={`Meme ${memeNumber}`} className="MemePreview__image" />
      <Button href={imageUrl} download={`meme-${memeNumber}`} target="_blank" variant="secondary" size="s">
        Download
      </Button>
    </div>
  )
}

export default MemePreview
