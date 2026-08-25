import type { ButtonInterface } from './Button.interface'

// Renders a real <button>, or a real <a> when `href` is given - stays
// keyboard- and screen-reader-accessible for free, and a download link
// behaves like a real browser download instead of a JS-driven fake one.
const Button = ({
  children,
  onClick,
  type = 'button',
  href,
  download,
  variant = 'primary',
  size = 'm',
  disabled = false,
  title,
  style,
  testID,
}: ButtonInterface) => {
  const className = `Button Button--${variant} Button--${size}`

  if (href && !disabled) {
    return (
      <a href={href} download={download} title={title} style={style} data-testid={testID} className={className}>
        {children}
      </a>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={style}
      data-testid={testID}
      className={className}
    >
      {children}
    </button>
  )
}

export default Button
