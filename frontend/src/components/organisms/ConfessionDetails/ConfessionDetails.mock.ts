import type { ConfessionDetailsInterface } from './ConfessionDetails.interface'

export const ConfessionDetailsMock: ConfessionDetailsInterface = {
  text: 'De volledige confession-tekst staat hier.',
  adminMessage: 'Dit bericht is enkel voor de admin bedoeld.',
  memeUrls: ['http://localhost:8080/confessions/1/memes/1'],
  assignedTags: [{ id: 'tag-1', name: 'meme', color: '#aa3bff' }],
  availableTags: [
    { id: 'tag-1', name: 'meme', color: '#aa3bff' },
    { id: 'tag-2', name: 'zoekertje', color: '#2f9e44' },
  ],
  onToggleTag: () => {},
}
