import type { PrivateMessageBlockInterface } from './PrivateMessageBlock.interface'

// Geen toegangscontrole hier - deze hele tool is al admin-only (IAP, issue
// #31). Blijft wel visueel apart van de hoofdtekst: het is een ander soort
// veld dat nooit in de gegenereerde afbeelding/caption terechtkomt
// (backend-side afgedwongen) - vandaar apart, niet geheimhouding.
// Kort gehouden op verzoek (issue #103): enkel label + bericht.
const PrivateMessageBlock = ({ message, testID }: PrivateMessageBlockInterface) => {
  if (!message) {
    return null
  }

  return (
    <div className="PrivateMessageBlock" data-testid={testID}>
      <p className="PrivateMessageBlock__label">Bericht aan de admin</p>
      <p className="PrivateMessageBlock__text">{message}</p>
    </div>
  )
}

export default PrivateMessageBlock
