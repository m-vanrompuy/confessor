import TagManager from '../../organisms/TagManager'
import type { InstellingenLayoutInterface, InstellingenTab } from './InstellingenLayout.interface'

const TABS: { id: InstellingenTab; label: string }[] = [
  { id: 'tags', label: 'Tags & categorieën' },
  { id: 'template', label: 'Template' },
  { id: 'algemeen', label: 'Algemeen' },
]

// Enkel de Tags & categorieën-tab heeft echte content (issue #37/#38, scherp
// gescoped op tagbeheer) - Template/Algemeen blijven zichtbaar in de
// tab-strip (zodat duidelijk is dat ze gepland zijn) maar tonen een
// placeholder tot ze gebouwd worden.
const InstellingenLayout = ({ activeTab, onTabChange, tagManager, testID }: InstellingenLayoutInterface) => {
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
        {activeTab !== 'tags' && <p className="InstellingenLayout__placeholder">Binnenkort beschikbaar.</p>}
      </div>
    </div>
  )
}

export default InstellingenLayout
