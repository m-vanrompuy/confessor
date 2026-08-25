import type { PrivateMessageBlockInterface } from './PrivateMessageBlock.interface'

// Geen toegangscontrole hier - deze hele tool is al admin-only (IAP, issue
// #31), dus er is niemand binnen de app voor wie dit "afgesloten" zou zijn.
// Blijft wel visueel apart van de hoofdtekst: het is een ander soort veld
// (notitie van de indiener aan de admin) dat nooit in de gegenereerde
// afbeelding/caption terechtkomt (backend-side afgedwongen) - dat is de
// echte reden om het apart te tonen, niet geheimhouding (issue #101).
const PrivateMessageBlock = ({ message, testID }: PrivateMessageBlockInterface) => {
  if (!message) {
    return null
  }

  return (
    <div className="PrivateMessageBlock" data-testid={testID}>
      <p className="PrivateMessageBlock__label">Bericht van de indiener aan de admin</p>
      <p className="PrivateMessageBlock__text">{message}</p>
      <p className="PrivateMessageBlock__note">Verschijnt nooit in de gegenereerde afbeelding of caption.</p>
    </div>
  )
}

export default PrivateMessageBlock
