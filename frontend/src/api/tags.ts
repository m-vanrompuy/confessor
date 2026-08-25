// Fetch-wrappers voor tags. create/update/delete toegevoegd voor het
// Instellingen-scherm (issues #37/#38) - listTags bestond al (issue #34).

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

export interface TagInput {
  name: string
  color: string
}

// POST /tags
export function createTag(tag: TagInput): Promise<Tag> {
  return apiFetch<Tag>('/tags', {
    method: 'POST',
    body: JSON.stringify(tag),
  })
}

// PUT /tags/{id} - werkt naam én kleur in één keer bij.
export function updateTag(tagId: string, tag: TagInput): Promise<void> {
  return apiFetch<void>(`/tags/${tagId}`, {
    method: 'PUT',
    body: JSON.stringify(tag),
  })
}

// DELETE /tags/{id}
export function deleteTag(tagId: string): Promise<void> {
  return apiFetch<void>(`/tags/${tagId}`, { method: 'DELETE' })
}
