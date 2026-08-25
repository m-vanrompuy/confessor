import type { TagManagerInterface } from './TagManager.interface'

export const TagManagerMock: TagManagerInterface = {
  tags: [
    { id: 'tag-1', name: 'meme', color: '#aa3bff' },
    { id: 'tag-2', name: 'zoekertje', color: '#2f9e44' },
  ],
  onCreateTag: () => {},
  onUpdateTag: () => {},
  onDeleteTag: () => {},
}
