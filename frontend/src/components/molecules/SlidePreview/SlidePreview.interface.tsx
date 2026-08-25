export interface SlidePreviewInterface {
  imageUrl: string
  /** 1-based, matcht de backend's slide-nummering. */
  slideNumber: number
  testID?: string
}
