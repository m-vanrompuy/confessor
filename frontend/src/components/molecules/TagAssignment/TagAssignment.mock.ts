import type { TagAssignmentInterface } from './TagAssignment.interface'

export const TagAssignmentMock: TagAssignmentInterface = {
  assignedTags: [{ id: 'tag-1', name: 'meme', color: '#aa3bff' }],
  availableTags: [
    { id: 'tag-1', name: 'meme', color: '#aa3bff' },
    { id: 'tag-2', name: 'zoekertje', color: '#2f9e44' },
  ],
  onToggleTag: () => {},
}
