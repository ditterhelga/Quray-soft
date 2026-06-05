import type { Set as LibrarySet } from '@/types'

export const SETS: LibrarySet[] = [
  {
    id: 's1',
    name: 'Berlin Session',
    presetIds: ['p1', 'p2', 'p7', 'p9'],
    syncStatus: 'synced',
    lastUpdated: new Date('2026-05-25'),
    notes: 'Live set at Berghain. Running order matters.',
  },
  {
    id: 's2',
    name: 'Ambient Field Work',
    presetIds: ['p4', 'p8', 'p10', 'p12', 'p3'],
    syncStatus: 'modified',
    lastUpdated: new Date('2026-04-18'),
  },
  {
    id: 's3',
    name: 'Percussion Studies',
    presetIds: ['p3', 'p6', 'p11'],
    syncStatus: 'synced',
    lastUpdated: new Date('2026-03-30'),
  },
  {
    id: 's4',
    name: 'Live Drone Set',
    presetIds: ['p2', 'p5', 'p7', 'p8', 'p12', 'p1'],
    syncStatus: 'not-synced',
    lastUpdated: new Date('2026-02-14'),
    notes: 'Order loose — use as inspiration, not setlist.',
  },
]
