import { Button } from '../../atoms'
import { SlidePreview } from '../../molecules'
import { buildSlideDownloads } from '../../../lib'
import type { GeneratedSlidesGalleryInterface } from './GeneratedSlidesGallery.interface'

// Tijd tussen elke gesimuleerde klik (issue #98) - synchroon N downloads
// achter elkaar afvuren laat browsers de latere downloads soms als pop-up
// blokkeren. Een confession heeft meestal maar 2-4 slides, dus dit voelt
// nog steeds als één vloeiende actie.
const DOWNLOAD_STAGGER_MS = 300

// Simuleert een klik op een echte <a download> i.p.v. enkel de URL te openen -
// zelfde native downloadgedrag als de losse knop per slide (issue #95), maar
// dan programmatisch zodat één knop meerdere downloads na elkaar kan starten.
function triggerDownload(url: string, filename: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const GeneratedSlidesGallery = ({ slideUrls, suggestedCaption, testID }: GeneratedSlidesGalleryInterface) => {
  if (slideUrls.length === 0) {
    return (
      <p className="GeneratedSlidesGallery__empty" data-testid={testID}>
        Nog geen afbeeldingen gegenereerd.
      </p>
    )
  }

  const handleDownloadAll = () => {
    buildSlideDownloads(slideUrls).forEach((download, index) => {
      setTimeout(() => triggerDownload(download.url, download.filename), index * DOWNLOAD_STAGGER_MS)
    })
  }

  return (
    <div className="GeneratedSlidesGallery" data-testid={testID}>
      {slideUrls.length > 1 && (
        <div className="GeneratedSlidesGallery__downloadAll">
          <Button variant="secondary" size="s" onClick={handleDownloadAll}>
            Download alles
          </Button>
        </div>
      )}
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
