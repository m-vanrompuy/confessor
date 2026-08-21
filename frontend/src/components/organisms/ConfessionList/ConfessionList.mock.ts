import type { ConfessionListInterface } from './ConfessionList.interface'

export const ConfessionListMock: ConfessionListInterface = {
  confessions: [
    {
      id: '1',
      title: 'Op zoek naar het meisje van oudejaarsavond',
      text: 'Ik ben op zoek naar een meisje dat ik tegen het lijf ben gelopen op de oudejaarsavond...',
      tags: [{ id: 'tag-1', name: 'zoekertje', color: '#2f9e44' }],
      status: 'new',
    },
    {
      id: '2',
      title: 'Confession #2',
      text: 'Een andere confession, al eens gebruikt en gepubliceerd.',
      tags: [],
      status: 'used',
    },
  ],
  onSelectConfession: () => {},
}
