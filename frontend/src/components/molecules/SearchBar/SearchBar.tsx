import { TextInput } from '../../atoms'
import type { SearchBarInterface } from './SearchBar.interface'

const SearchBar = ({ value, onChange, testID }: SearchBarInterface) => {
  return (
    <div role="search" className="SearchBar">
      <TextInput
        type="search"
        value={value}
        onChange={onChange}
        placeholder="Zoek in confessions..."
        testID={testID}
      />
    </div>
  )
}

export default SearchBar
