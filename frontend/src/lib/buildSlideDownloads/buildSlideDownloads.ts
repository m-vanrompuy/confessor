export interface SlideDownload {
  url: string
  filename: string
}

// Genereert de downloadbestandsnaam per slide - zelfde patroon als de
// individuele downloadknop van SlidePreview (issue #95), zodat "Download
// alles" (issue #98) en de losse knoppen consistente bestandsnamen geven.
export function buildSlideDownloads(slideUrls: string[]): SlideDownload[] {
  return slideUrls.map((url, index) => ({ url, filename: `slide-${index + 1}.png` }))
}

export default buildSlideDownloads
