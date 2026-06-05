import type { Set as LibrarySet } from '@/types'

export const SETS: LibrarySet[] = [
  {
    id: 's1',
    name: 'Berlin Session',
    members: [
      { presetId: 'p1', syncStatus: 'synced' },
      { presetId: 'p2', syncStatus: 'synced' },
      { presetId: 'p7', syncStatus: 'synced' },
      { presetId: 'p9', syncStatus: 'synced' },
    ],
    lastUpdated: new Date('2026-05-25'),
    notes: 'Live set at Berghain. Running order matters.',
  },
  {
    id: 's2',
    name: 'Ambient Field Work',
    members: [
      { presetId: 'p4', syncStatus: 'synced' },
      { presetId: 'p8', syncStatus: 'modified' },
      { presetId: 'p10', syncStatus: 'synced' },
      { presetId: 'p12', syncStatus: 'synced' },
      { presetId: 'p3', syncStatus: 'synced' },
    ],
    lastUpdated: new Date('2026-04-18'),
  },
  {
    id: 's3',
    name: 'Percussion Studies',
    members: [
      { presetId: 'p3', syncStatus: 'synced' },
      { presetId: 'p6', syncStatus: 'synced' },
      { presetId: 'p11', syncStatus: 'synced' },
    ],
    lastUpdated: new Date('2026-03-30'),
  },
  {
    id: 's4',
    name: 'Live Drone Set',
    members: [
      { presetId: 'p2', syncStatus: 'not-synced' },
      { presetId: 'p5', syncStatus: 'not-synced' },
      { presetId: 'p7', syncStatus: 'modified' },
      { presetId: 'p8', syncStatus: 'not-synced' },
      { presetId: 'p12', syncStatus: 'not-synced' },
      { presetId: 'p1', syncStatus: 'not-synced' },
    ],
    lastUpdated: new Date('2026-02-14'),
    notes: 'Order loose — use as inspiration, not setlist.',
  },
]
