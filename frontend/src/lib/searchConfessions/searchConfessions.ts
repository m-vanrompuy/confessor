import type { ConfessionListItem } from '../../components/organisms/ConfessionList/ConfessionList.interface'

// De backend heeft geen tekst-zoek-endpoint (GET /confessions filtert enkel
// op status/tags), dus dit blijft client-side, toegepast op wat de backend
// al teruggaf.
export function searchConfessions(confessions: ConfessionListItem[], searchValue: string): ConfessionListItem[] {
  const query = searchValue.trim().toLowerCase()
  if (query === '') {
    return confessions
  }

  return confessions.filter(
    (confession) => confession.title.toLowerCase().includes(query) || confession.text.toLowerCase().includes(query),
  )
}

export default searchConfessions
