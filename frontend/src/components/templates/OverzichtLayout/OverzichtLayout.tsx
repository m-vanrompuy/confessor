import Toolbar from '../../organisms/Toolbar'
import ConfessionList from '../../organisms/ConfessionList'
import type { OverzichtLayoutInterface } from './OverzichtLayout.interface'

// Layout only - no data-fetching or filtering logic here, that lives in the
// Overzicht page (mock data for now, real data once issue #34 lands).
const OverzichtLayout = ({ toolbar, list, testID }: OverzichtLayoutInterface) => {
  return (
    <div className="OverzichtLayout" data-testid={testID}>
      <Toolbar {...toolbar} />
      <ConfessionList {...list} />
    </div>
  )
}

export default OverzichtLayout
