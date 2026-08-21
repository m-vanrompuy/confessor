// Draait vóór elk testbestand (zie vite.config.ts test.setupFiles). Ruimt na
// elke test alles op wat @testing-library/react gerenderd heeft - zonder dit
// blijft de DOM van een vorige test in hetzelfde bestand staan, wat tot
// "meerdere elementen gevonden"-fouten leidt in tests die ná de eerste in een
// bestand draaien. Een no-op voor bestanden die enkel renderToStaticMarkup of
// pure functies testen.
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})
