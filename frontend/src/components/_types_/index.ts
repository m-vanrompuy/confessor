// Gedeelde types tussen meerdere componenten - bedoeld voor exact dit soort
// herhaling: FilterBar, TagAssignment en TagManager hadden elk hun eigen
// {id, name, color}-interface voor "een tag zoals getoond in de UI".
// Nieuwe componenten gebruiken DisplayTag; de bestaande drie blijven
// voorlopig hun eigen (identieke) interface gebruiken om niet onnodig te
// raken aan al geteste, werkende code.
export interface DisplayTag {
  id: string
  name: string
  color: string
}
