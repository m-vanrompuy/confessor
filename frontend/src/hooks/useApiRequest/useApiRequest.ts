import { useCallback, useRef, useState } from 'react'

export interface UseApiRequestResult<TArgs extends unknown[], TResult> {
  data: TResult | null
  error: Error | null
  loading: boolean
  /** Roept de gegeven functie aan en beheert loading/error/data eromheen. */
  run: (...args: TArgs) => Promise<TResult | undefined>
}

// Standaardiseert loading/error/data-state rond één van de api/confessions.ts-
// wrappers, zodat de schermen die de backend aanspreken (issues #34/#36/#38)
// niet elk hun eigen ad-hoc "bezig..."/foutmelding-patroon uitvinden.
//
// `request` moet een stabiele functiereferentie zijn (bv. rechtstreeks een
// geïmporteerde api-wrapper) - een inline pijl-functie die bij elke render
// opnieuw aangemaakt wordt, laat `run` ook bij elke render van identiteit
// veranderen.
export function useApiRequest<TArgs extends unknown[], TResult>(
  request: (...args: TArgs) => Promise<TResult>,
): UseApiRequestResult<TArgs, TResult> {
  const [data, setData] = useState<TResult | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)
  // Bewaakt tegen een out-of-order antwoord: als `run` twee keer snel na
  // elkaar aangeroepen wordt (bv. een filter dat meteen weer verandert) is er
  // geen garantie dat de EERSTE call ook het EERST antwoordt - een trage,
  // verouderde call mag een nieuwer resultaat nooit overschrijven. Gevonden
  // tijdens #34: een grote ongefilterde fetch overschreef een kleinere, later
  // gestarte gefilterde fetch omdat die trager binnenkwam.
  const latestRequestId = useRef(0)

  const run = useCallback(
    async (...args: TArgs) => {
      const requestId = ++latestRequestId.current
      setLoading(true)
      setError(null)

      try {
        const result = await request(...args)
        if (requestId === latestRequestId.current) {
          setData(result)
        }
        return result
      } catch (caughtError) {
        if (requestId === latestRequestId.current) {
          setError(toError(caughtError))
        }
        return undefined
      } finally {
        if (requestId === latestRequestId.current) {
          setLoading(false)
        }
      }
    },
    [request],
  )

  return { data, error, loading, run }
}

function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value))
}

export default useApiRequest
