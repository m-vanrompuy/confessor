import type { SelectInterface } from './Select.interface'

const Select = ({ value, onChange, options, placeholder, testID }: SelectInterface) => {
  return (
    <select value={value} onChange={onChange} data-testid={testID} className="Select">
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

export default Select
