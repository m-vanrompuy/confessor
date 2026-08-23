import type { PrivateMessageBlockInterface } from './PrivateMessageBlock.interface'

// Mag NOOIT lijken alsof dit publiek/gedeeld is - vandaar het expliciete
// label, en bewust NIET dezelfde stijl als de gewone confession-tekst.
const PrivateMessageBlock = ({ message, testID }: PrivateMessageBlockInterface) => {
  if (!message) {
    return null
  }

  return (
    <div className="PrivateMessageBlock" data-testid={testID}>
      <p className="PrivateMessageBlock__label">🔒 Privébericht - niet openbaar</p>
      <p className="PrivateMessageBlock__text">{message}</p>
    </div>
  )
}

export default PrivateMessageBlock
