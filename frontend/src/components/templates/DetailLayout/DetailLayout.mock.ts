import { ConfessionDetailsMock } from '../../organisms/ConfessionDetails/ConfessionDetails.mock'
import { ConfessionActionsMock } from '../../organisms/ConfessionActions/ConfessionActions.mock'
import { GeneratedSlidesGalleryMock } from '../../organisms/GeneratedSlidesGallery/GeneratedSlidesGallery.mock'
import { PublishedStatsMock } from '../../organisms/PublishedStats/PublishedStats.mock'
import type { DetailLayoutInterface } from './DetailLayout.interface'

export const DetailLayoutMock: DetailLayoutInterface = {
  title: 'Confession #2',
  onBack: () => {},
  details: ConfessionDetailsMock,
  actions: ConfessionActionsMock,
  slides: GeneratedSlidesGalleryMock,
  publishedStats: PublishedStatsMock,
}
