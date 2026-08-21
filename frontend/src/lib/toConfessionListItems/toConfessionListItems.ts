import type { Confession } from '../../api/confessions'
import type { Tag } from '../../api/tags'
import type { ConfessionListItem } from '../../components/organisms/ConfessionList/ConfessionList.interface'
import type { ConfessionCardTag } from '../../components/molecules/ConfessionCard/ConfessionCard.interface'

// Vertaalt de ruwe backend-shape (tag_ids: string[]) naar wat ConfessionList
// nodig heeft (tags mét naam/kleur). Onbekende tag-ID's (bv. een intussen
// verwijderde tag) worden gewoon overgeslagen i.p.v. te crashen.
export function toConfessionListItems(confessions: Confession[], tags: Tag[]): ConfessionListItem[] {
  const tagsById = new Map(tags.map((tag) => [tag.id, tag]))

  return confessions.map((confession) => ({
    id: confession.id,
    title: confession.title,
    text: confession.text,
    status: confession.status,
    tags: resolveTags(confession.tag_ids, tagsById),
  }))
}

function resolveTags(tagIds: string[], tagsById: Map<string | null, Tag>): ConfessionCardTag[] {
  return tagIds
    .map((tagId) => tagsById.get(tagId))
    .filter((tag) => tag !== undefined)
    .map((tag) => ({ id: tag.id ?? tag.name, name: tag.name, color: tag.color }))
}

export default toConfessionListItems
