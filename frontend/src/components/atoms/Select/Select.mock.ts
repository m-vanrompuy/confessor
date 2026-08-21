import type { SelectInterface } from './Select.interface'

export const SelectMock: SelectInterface = {
  value: '',
  onChange: () => {},
  options: [
    { value: 'new', label: 'Nieuw' },
    { value: 'used', label: 'Gebruikt' },
  ],
  placeholder: 'Status',
}
