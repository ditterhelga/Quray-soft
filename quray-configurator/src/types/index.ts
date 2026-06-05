export type SyncStatus = 'on-quray' | 'modified' | 'not-synced'

export type OutputType = 'MIDI Note' | 'MIDI CC' | 'CV'

export interface Preset {
  id: string
  name: string
  tags?: string[]
  targetDevices: string[]
  outputTypes: OutputType[]
  zoneCount: number
  lastUpdated: string        // ISO date string e.g. '2026-05-28'
  syncStatus: SyncStatus
  isFavourite: boolean
  setIds: string[]           // IDs of PresetSets this preset belongs to
  notes?: string
}

export type SetSyncStatus = 'synced' | 'modified' | 'not-synced'

export interface SetMember {
  presetId: string
  syncStatus: SetSyncStatus
}

export interface Set {
  id: string
  name: string
  members: SetMember[]       // ordered — order matters for live performance
  lastUpdated: Date
  notes?: string
}

/** @deprecated Use Set */
export interface PresetSet {
  id: string
  name: string
  presetIds: string[]
  lastUpdated: string
  notes?: string
}
