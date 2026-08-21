// Fetch-wrapper voor tags. Enkel listTags voor nu (nodig voor de Overzicht-
// filters en confession-kaartjes, issue #34) - create/update/delete volgen
// zodra het Instellingen-scherm ze nodig heeft (issues #37/#38).

import { apiFetch } from './client'

export interface Tag {
  id: string | null
  name: string
  color: string
}

// GET /tags
export function listTags(): Promise<Tag[]> {
  return apiFetch<Tag[]>('/tags')
}
