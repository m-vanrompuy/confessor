// Fetch-wrappers voor de confession-endpoints op de Rust-backend (issue #32).
// Veldnamen volgen exact de JSON van de backend (snake_case, geen case-conversie-
// laag), zodat een wijziging aan de ene kant makkelijk terug te vinden is aan de andere.

import { API_BASE_URL, apiFetch, buildQueryString } from './client'

export type ConfessionStatus = 'new' | 'used' | 'deleted'

export interface MemeAttachment {
  storage_path: string
  content_type: string
}

export interface Confession {
  id: string
  timestamp: string
  title: string
  text: string
  admin_message: string | null
  image_link: string | null
  status: ConfessionStatus
  tag_ids: string[]
  sequence_number: number | null
  suggested_caption: string | null
  slide_paths: string[]
  used_at: string | null
  like_count: number | null
  comment_count: number | null
  stats_last_updated_at: string | null
  meme_attachments: MemeAttachment[]
}

export interface ConfessionFilters {
  status?: ConfessionStatus
  /** Tag-ID's om op te filteren; wordt als komma-gescheiden lijst naar de backend gestuurd. */
  tagIds?: string[]
}

// GET /confessions?status=...&tags=...
export function listConfessions(filters: ConfessionFilters = {}): Promise<Confession[]> {
  const query = buildQueryString({
    status: filters.status,
    tags: filters.tagIds?.join(','),
  })
  return apiFetch<Confession[]>(`/confessions${query}`)
}

// PUT /confessions/{id}/tags - overschrijft de volledige tag-lijst.
export function updateConfessionTags(confessionId: string, tagIds: string[]): Promise<void> {
  return apiFetch<void>(`/confessions/${confessionId}/tags`, {
    method: 'PUT',
    body: JSON.stringify({ tag_ids: tagIds }),
  })
}

// DELETE /confessions/{id} - past het tombstone-pattern toe.
export function deleteConfession(confessionId: string): Promise<void> {
  return apiFetch<void>(`/confessions/${confessionId}`, { method: 'DELETE' })
}

// PUT /confessions/{id}/use - kent het volgende volgnummer toe en markeert als gebruikt.
export function markConfessionAsUsed(confessionId: string): Promise<void> {
  return apiFetch<void>(`/confessions/${confessionId}/use`, { method: 'PUT' })
}

export interface ConfessionStats {
  like_count: number
  comment_count: number
}

// PUT /confessions/{id}/stats
export function updateConfessionStats(confessionId: string, stats: ConfessionStats): Promise<void> {
  return apiFetch<void>(`/confessions/${confessionId}/stats`, {
    method: 'PUT',
    body: JSON.stringify(stats),
  })
}

export interface GenerateImagesOptions {
  memePosition?: 'before' | 'after'
  memeScale?: number
}

export interface GenerateImagesResponse {
  slide_paths: string[]
  suggested_caption: string
  meme_storage_paths: string[]
}

// POST /confessions/{id}/generate?meme_position=...&meme_scale=...
export function generateConfessionImages(
  confessionId: string,
  options: GenerateImagesOptions = {},
): Promise<GenerateImagesResponse> {
  const query = buildQueryString({
    meme_position: options.memePosition,
    meme_scale: options.memeScale,
  })
  return apiFetch<GenerateImagesResponse>(`/confessions/${confessionId}/generate${query}`, {
    method: 'POST',
  })
}

// GET /confessions/{id}/slides/{index} - wordt niet als JSON opgehaald, maar
// rechtstreeks als <img src> gebruikt. Index is 1-based, zelfde volgorde als
// de slide_paths van de backend.
export function confessionSlideUrl(confessionId: string, slideIndex: number): string {
  return `${API_BASE_URL}/confessions/${confessionId}/slides/${slideIndex}`
}
