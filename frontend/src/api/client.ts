// Kleine gedeelde fetch-helper voor communicatie met de Rust-backend. Bestanden
// per resource (confessions.ts, en later tags.ts/settings.ts) bouwen hierop
// voort in plaats van elk zelf `fetch` aan te roepen.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Roept de backend aan en parset een JSON-antwoord. De toegang zelf wordt
// bewaakt door Identity-Aware Proxy vóór de backend (zie ISSUES.md) - de
// IAP-sessiecookie van de browser reist automatisch mee via
// `credentials: 'include'`, dus hier is geen wachtwoord of token nodig.
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const message = await response.text()
    throw new ApiError(response.status, message || response.statusText)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

// Bouwt een query-string op uit optionele params, slaat alles wat niet gezet is
// over. `undefined`/`null`-waarden worden weggelaten i.p.v. als de string
// "undefined" meegestuurd.
export function buildQueryString(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined)
  if (entries.length === 0) {
    return ''
  }

  const searchParams = new URLSearchParams()
  for (const [key, value] of entries) {
    searchParams.set(key, String(value))
  }
  return `?${searchParams.toString()}`
}
