import type { Confession } from '../../api/confessions'

// Google Forms' standaard timestamp-formaat: "D-M-JJJJ U:MM:SS", geen
// nul-opvulling (bv. "1-10-2025 14:36:58"). Niet lexicografisch sorteerbaar -
// "1-1-2026" komt alfabetisch vóór "1-10-2025", meer dan een jaar verkeerd om.
const TIMESTAMP_PATTERN = /^(\d{1,2})-(\d{1,2})-(\d{4}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/

// Geeft 0 terug voor een onverwacht formaat i.p.v. te crashen - zo'n
// confession zakt gewoon naar het einde van "meest recent eerst" i.p.v. de
// hele lijst te breken.
function parseSubmittedAt(timestamp: string): number {
  const match = TIMESTAMP_PATTERN.exec(timestamp)
  if (!match) {
    return 0
  }

  const [day, month, year, hour, minute, second] = match.slice(1).map(Number)
  return new Date(year, month - 1, day, hour, minute, second).getTime()
}

// Geeft een nieuwe, gesorteerde array terug (meest recent eerst) - muteert
// de invoer niet.
export function sortConfessionsByRecency(confessions: Confession[]): Confession[] {
  return [...confessions].sort((a, b) => parseSubmittedAt(b.timestamp) - parseSubmittedAt(a.timestamp))
}

export default sortConfessionsByRecency
