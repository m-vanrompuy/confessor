// Fetch-wrappers voor de generieke key/value-instellingen op de backend
// (issue #116) - zelfde route als bv. image_retention_days gebruikt.

import { ApiError, apiFetch } from './client'

interface SettingResponse {
  value: string
}

// GET /settings/{key} - geeft null terug i.p.v. te gooien wanneer de instelling
// nog nooit gezet is (404 vanuit de backend is hier een normale toestand, geen
// fout: de admin heeft 'm gewoon nog niet ingesteld).
export async function getSetting(key: string): Promise<string | null> {
  try {
    const response = await apiFetch<SettingResponse>(`/settings/${key}`)
    return response.value
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }
    throw error
  }
}

// PUT /settings/{key}
export function updateSetting(key: string, value: string): Promise<void> {
  return apiFetch<void>(`/settings/${key}`, {
    method: 'PUT',
    body: JSON.stringify({ value }),
  })
}
