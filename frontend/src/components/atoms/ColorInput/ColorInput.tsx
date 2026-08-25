import type { ColorInputInterface } from './ColorInput.interface'

const ColorInput = ({ value, onChange, testID }: ColorInputInterface) => {
  return <input type="color" value={value} onChange={onChange} data-testid={testID} className="ColorInput" />
}

export default ColorInput
