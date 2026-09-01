// Fetch-wrappers voor de confession-endpoints op de Rust-backend (issue #32).
// Veldnamen volgen exact de JSON van de backend (snake_case, geen case-conversie-
// laag), zodat een wijziging aan de ene kant makkelijk terug te vinden is aan de andere.

import { apiUrl, apiFetch, buildQueryString } from './client'

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
  /** Manueel ingevuld door de admin - geen automatische koppeling (issue #90). */
  instagram_post_url: string | null
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
  // Een lege array mag geen `tags=` (lege string) op de URL zetten: de backend
  // splitst dat naar [""] i.p.v. een lege lijst, en filtert dan alles weg (geen
  // enkele confession heeft een tag-ID van "") - bug gevonden tijdens #34.
  const tagIds = filters.tagIds ?? []
  const query = buildQueryString({
    status: filters.status,
    tags: tagIds.length > 0 ? tagIds.join(',') : undefined,
  })
  return apiFetch<Confession[]>(`/confessions${query}`)
}

// GET /confessions/{id} - voor de Detail-pagina (issue #36/#92).
export function getConfession(confessionId: string): Promise<Confession> {
  return apiFetch<Confession>(`/confessions/${confessionId}`)
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

// PUT /confessions/{id}/restore - haalt de originele tekst terug uit de Sheet en
// zet de confession terug op "new" (issue #100).
export function restoreConfession(confessionId: string): Promise<void> {
  return apiFetch<void>(`/confessions/${confessionId}/restore`, { method: 'PUT' })
}

// PUT /confessions/{id}/unmark - geeft het volgnummer vrij en zet de confession
// terug op "new" (issue #97), voor per ongeluk "Markeer als gebruikt" klikken.
export function unmarkConfessionAsUsed(confessionId: string): Promise<void> {
  return apiFetch<void>(`/confessions/${confessionId}/unmark`, { method: 'PUT' })
}

export interface ConfessionStats {
  like_count: number
  comment_count: number
  instagram_post_url?: string | null
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
  return apiUrl(`/confessions/${confessionId}/slides/${slideIndex}`)
}

// GET /confessions/{id}/memes/{index} - de originele, door de inzender
// geüploade meme-bijlage (issue #109), niet als JSON maar rechtstreeks als
// <img src> gebruikt. Index is 1-based, zelfde volgorde als meme_attachments.
export function confessionMemeUrl(confessionId: string, memeIndex: number): string {
  return apiUrl(`/confessions/${confessionId}/memes/${memeIndex}`)
}

export interface SyncResult {
  new_confessions_count: number
}

// POST /sync - haalt nieuwe confessions op uit de Sheet (dedupe + titel-
// generatie gebeurt backend-side).
export function syncConfessions(): Promise<SyncResult> {
  return apiFetch<SyncResult>('/sync', { method: 'POST' })
}
