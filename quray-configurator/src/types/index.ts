export type SyncStatus = 'on-quray' | 'modified' | 'not-synced'

export type OutputType = 'MIDI Note' | 'MIDI CC' | 'CV'

export type PresetZoneOutputType = 'Note' | 'CC' | 'CV'

export interface PresetZone {
  id: string
  name: string
  color: string
  outputType: PresetZoneOutputType
  axis: string
  paramLabel: string
}

export interface Preset {
  id: string
  name: string
  tags?: string[]
  devices: string[]
  /** @deprecated Use devices */
  targetDevices?: string[]
  outputTypes: OutputType[]
  zoneCount: number
  zones: PresetZone[]
  lastUpdated: string        // ISO date string e.g. '2026-05-28'
  syncStatus: SyncStatus
  isFavourite: boolean
  /** @deprecated Derive set membership from sets data at render time */
  setIds?: string[]
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

// ---------------------------------------------------------------------------
// Editor / gesture canvas types
// ---------------------------------------------------------------------------

/**
 * Zone position in logical space: [active, xMin, yMin, xMax, yMax].
 * All coordinates 0–1; x = angular (left→right), y = radial (near→far).
 */
export type GesturePosition = [
  active: boolean,
  xMin: number,
  yMin: number,
  xMax: number,
  yMax: number,
]

/** A single gesture zone shown on the Editor fan canvas. */
export interface EditorZone {
  id: string
  name: string
  /** Hex colour used for fills and outlines on the canvas. */
  color: string
  /** Output type; null = unmapped (rendered with hatching + amber warning). */
  type: 'Note' | 'CC' | 'CV' | null
  position: GesturePosition
}

/** @deprecated Use Set */
export interface PresetSet {
  id: string
  name: string
  presetIds: string[]
  lastUpdated: string
  notes?: string
}
