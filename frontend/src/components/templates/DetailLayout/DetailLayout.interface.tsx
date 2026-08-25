import type { ConfessionDetailsInterface } from '../../organisms/ConfessionDetails/ConfessionDetails.interface'
import type { ConfessionActionsInterface } from '../../organisms/ConfessionActions/ConfessionActions.interface'
import type { GeneratedSlidesGalleryInterface } from '../../organisms/GeneratedSlidesGallery/GeneratedSlidesGallery.interface'
import type { PublishedStatsInterface } from '../../organisms/PublishedStats/PublishedStats.interface'

export interface DetailLayoutInterface {
  title: string
  onBack: () => void
  details: ConfessionDetailsInterface
  actions: ConfessionActionsInterface
  slides: GeneratedSlidesGalleryInterface
  /** null wanneer de confession niet gepubliceerd (gebruikt) is - dan is er niets te tonen. */
  publishedStats: PublishedStatsInterface | null
  testID?: string
}
