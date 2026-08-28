import TagManager from '../../organisms/TagManager'
import { SequenceNumberSetting } from '../../molecules'
import type { InstellingenLayoutInterface, InstellingenTab } from './InstellingenLayout.interface'

const TABS: { id: InstellingenTab; label: string }[] = [
  { id: 'tags', label: 'Tags & categorieën' },
  { id: 'template', label: 'Template' },
  { id: 'algemeen', label: 'Algemeen' },
]

// Tags & categorieën (issue #37/#38) en Algemeen (issue #116, het instelbare
// volgnummer) hebben echte content - Template blijft zichtbaar in de tab-strip
// (zodat duidelijk is dat 'ie gepland is) maar toont een placeholder tot 'ie
// gebouwd wordt.
const InstellingenLayout = ({ activeTab, onTabChange, tagManager, sequenceNumberSetting, testID }: InstellingenLayoutInterface) => {
  return (
    <div className="InstellingenLayout" data-testid={testID}>
      <div className="InstellingenLayout__tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`InstellingenLayout__tab${activeTab === tab.id ? ' InstellingenLayout__tab--active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="InstellingenLayout__content">
        {activeTab === 'tags' && <TagManager {...tagManager} />}
        {activeTab === 'algemeen' && <SequenceNumberSetting {...sequenceNumberSetting} />}
        {activeTab === 'template' && <p className="InstellingenLayout__placeholder">Binnenkort beschikbaar.</p>}
      </div>
    </div>
  )
}

export default InstellingenLayout
