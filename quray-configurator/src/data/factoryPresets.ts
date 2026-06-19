import type { Preset } from '../types'

export const FACTORY_PRESETS: Preset[] = [
  {
    id: 'factory-1',
    name: 'First Touch',
    devices: [],
    tags: ['Factory', 'Starter'],
    outputTypes: ['MIDI Note'],
    zoneCount: 2,
    zones: [
      { id: 'f1-z1', name: 'Low Zone', color: '#6C5BD9', outputType: 'Note', axis: 'Y axis', paramLabel: 'Pitch' },
      { id: 'f1-z2', name: 'High Zone', color: '#913F7E', outputType: 'Note', axis: 'Y axis', paramLabel: 'Pitch' },
    ],
    lastUpdated: '2026-06-01',
    syncStatus: 'on-quray',
    isFavourite: false,
    notes: 'A simple two-zone preset to get started.',
  },
  {
    id: 'factory-2',
    name: 'Filter Sweep',
    devices: [],
    tags: ['Factory', 'CC'],
    outputTypes: ['MIDI CC'],
    zoneCount: 1,
    zones: [
      { id: 'f2-z1', name: 'Cutoff', color: '#3E8577', outputType: 'CC', axis: 'Y axis', paramLabel: 'Filter Cutoff' },
    ],
    lastUpdated: '2026-06-01',
    syncStatus: 'on-quray',
    isFavourite: false,
    notes: 'Map your hand height to filter cutoff.',
  },
  {
    id: 'factory-3',
    name: 'CV Pitch',
    devices: [],
    tags: ['Factory', 'CV', 'Modular'],
    outputTypes: ['CV'],
    zoneCount: 1,
    zones: [
      { id: 'f3-z1', name: 'Pitch', color: '#B45846', outputType: 'CV', axis: 'Y axis', paramLabel: '1V/Oct' },
    ],
    lastUpdated: '2026-06-01',
    syncStatus: 'on-quray',
    isFavourite: false,
    notes: 'CV pitch control for Eurorack.',
  },
]
