import type { ConfessionDetailsInterface } from '../../organisms/ConfessionDetails/ConfessionDetails.interface'
import type { ConfessionActionsInterface } from '../../organisms/ConfessionActions/ConfessionActions.interface'
import type { GeneratedSlidesGalleryInterface } from '../../organisms/GeneratedSlidesGallery/GeneratedSlidesGallery.interface'
import type { PublishedStatsInterface } from '../../organisms/PublishedStats/PublishedStats.interface'

export interface DetailLayoutInterface {
  title: string
  /** Zoals ingevuld in het Google Form - al een leesbare string, geen ISO-datum om te herformatteren. */
  submittedAt: string
  confessionId: string
  onBack: () => void
  details: ConfessionDetailsInterface
  actions: ConfessionActionsInterface
  slides: GeneratedSlidesGalleryInterface
  /** null wanneer de confession niet gepubliceerd (gebruikt) is - dan is er niets te tonen. */
  publishedStats: PublishedStatsInterface | null
  testID?: string
}
