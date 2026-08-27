import { Button } from '../../atoms'
import type { ConfessionActionsInterface } from './ConfessionActions.interface'

const ConfessionActions = ({
  status,
  onMarkAsUsed,
  onDelete,
  onGenerate,
  onRestore,
  markingAsUsed = false,
  deleting = false,
  generating = false,
  restoring = false,
  testID,
}: ConfessionActionsInterface) => {
  const isDeleted = status === 'deleted'
  const isUsed = status === 'used'

  return (
    <div className="ConfessionActions" data-testid={testID}>
      <Button variant="secondary" onClick={onMarkAsUsed} disabled={isDeleted || isUsed || markingAsUsed}>
        {markingAsUsed ? 'Bezig...' : 'Markeer als gebruikt'}
      </Button>
      <Button
        variant="primary"
        onClick={onGenerate}
        // Kan pas nadat de confession een volgnummer heeft (Markeer als
        // gebruikt) - de backend geeft anders een 400 terug. Hier al disabled
        // tonen i.p.v. enkel op die 400 te vertrouwen (zie issue #36).
        disabled={!isUsed || generating}
        title={!isUsed ? 'Markeer eerst als gebruikt' : undefined}
      >
        {generating ? 'Bezig...' : 'Genereer afbeeldingen'}
      </Button>
      {isDeleted ? (
        <Button variant="secondary" onClick={onRestore} disabled={restoring}>
          {restoring ? 'Bezig...' : 'Herstel'}
        </Button>
      ) : (
        <Button variant="danger" onClick={onDelete} disabled={deleting}>
          {deleting ? 'Bezig...' : 'Verwijderen'}
        </Button>
      )}
    </div>
  )
}

export default ConfessionActions
