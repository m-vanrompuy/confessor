import { Button } from '../../atoms'
import ConfessionDetails from '../../organisms/ConfessionDetails'
import ConfessionActions from '../../organisms/ConfessionActions'
import GeneratedSlidesGallery from '../../organisms/GeneratedSlidesGallery'
import PublishedStats from '../../organisms/PublishedStats'
import type { DetailLayoutInterface } from './DetailLayout.interface'

// Layout only - geen router-kennis hier (vandaar onBack als callback i.p.v.
// een <Link>), zelfde patroon als ConfessionList's onSelectConfession. De
// pagina (Detail) beslist wat "terug" betekent.
const DetailLayout = ({ title, onBack, details, actions, slides, publishedStats, testID }: DetailLayoutInterface) => {
  return (
    <div className="DetailLayout" data-testid={testID}>
      <Button variant="secondary" size="s" onClick={onBack}>
        ← Terug naar overzicht
      </Button>

      <h2 className="DetailLayout__title">{title}</h2>

      <ConfessionDetails {...details} />
      <ConfessionActions {...actions} />
      <GeneratedSlidesGallery {...slides} />
      {publishedStats && <PublishedStats {...publishedStats} />}
    </div>
  )
}

export default DetailLayout
