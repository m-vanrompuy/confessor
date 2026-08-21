import type { ButtonInterface } from './Button.interface'

// Renders a real <button>, not a styled <div> - stays keyboard- and
// screen-reader-accessible for free.
const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'm',
  disabled = false,
  style,
  testID,
}: ButtonInterface) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={style}
      data-testid={testID}
      className={`Button Button--${variant} Button--${size}`}
    >
      {children}
    </button>
  )
}

export default Button
