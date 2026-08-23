import type { TextInputInterface } from './TextInput.interface'

const TextInput = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  min,
  size = 'm',
  disabled = false,
  style,
  testID,
}: TextInputInterface) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      disabled={disabled}
      style={style}
      data-testid={testID}
      className={`TextInput TextInput--${size}`}
    />
  )
}

export default TextInput
