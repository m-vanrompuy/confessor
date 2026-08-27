import type { ConfessionStatus } from '../../../api/confessions'

export interface ConfessionActionsInterface {
  status: ConfessionStatus
  onMarkAsUsed: () => void
  onDelete: () => void
  onGenerate: () => void
  /** Enkel relevant/zichtbaar wanneer status "deleted" is (issue #100). */
  onRestore: () => void
  /** Enkel relevant/zichtbaar wanneer status "used" is en er nog geen afbeeldingen
   *  gegenereerd zijn (issue #97) - voor per ongeluk "Markeer als gebruikt" klikken. */
  onUnmark: () => void
  /** Bepaalt of "Ongedaan maken" getoond mag worden i.p.v. "Markeer als gebruikt" -
   *  eens er afbeeldingen bestaan tonen die het volgnummer al, dus moet Verwijderen
   *  gebruikt worden in plaats van ongedaan maken. */
  hasGeneratedSlides: boolean
  markingAsUsed?: boolean
  deleting?: boolean
  generating?: boolean
  restoring?: boolean
  unmarking?: boolean
  testID?: string
}
