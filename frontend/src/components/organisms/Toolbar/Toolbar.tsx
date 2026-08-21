import { Button } from '../../atoms'
import SearchBar from '../../molecules/SearchBar'
import FilterBar from '../../molecules/FilterBar'
import type { ToolbarInterface } from './Toolbar.interface'

const Toolbar = ({ searchValue, onSearchChange, filter, onSync, syncing = false, testID }: ToolbarInterface) => {
  return (
    <div className="Toolbar" data-testid={testID}>
      <div className="Toolbar__filters">
        <SearchBar value={searchValue} onChange={onSearchChange} />
        <FilterBar {...filter} />
      </div>
      <Button variant="secondary" size="s" onClick={onSync} disabled={syncing}>
        {syncing ? 'Bezig...' : 'Sync nu'}
      </Button>
    </div>
  )
}

export default Toolbar
