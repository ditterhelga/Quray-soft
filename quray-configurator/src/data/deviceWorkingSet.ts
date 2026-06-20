export type DeviceSyncStatus = 'current' | 'needs-sync'

export type DeviceSlot =
  | { type: 'set'; setId: string }
  | { type: 'preset'; presetId: string; syncStatus: DeviceSyncStatus }

/** On-device sync per preset (set members + standalone slots). */
export const DEVICE_PRESET_SYNC: Record<string, DeviceSyncStatus> = {
  p1: 'current',
  p2: 'current',
  p3: 'current',
  p4: 'current',
  p6: 'current',
  p7: 'current',
  p8: 'needs-sync',
  p9: 'current',
  p10: 'current',
  p11: 'current',
  p12: 'current',
  p5: 'needs-sync',
}

/** Ordered on-device slots — sets and standalone presets interleaved. */
export const DEVICE_WORKING_SET: DeviceSlot[] = [
  { type: 'set', setId: 's1' },
  { type: 'preset', presetId: 'p5', syncStatus: 'needs-sync' },
  { type: 'set', setId: 's3' },
  { type: 'set', setId: 's2' },
  { type: 'preset', presetId: 'p12', syncStatus: 'current' },
]

export const FRESH_DEVICE_PRESET_SYNC: Record<string, DeviceSyncStatus> = {
  'factory-1': 'current',
  'factory-2': 'current',
  'factory-3': 'current',
  'factory-4': 'current',
  'factory-5': 'current',
}

export const FRESH_DEVICE_WORKING_SET: DeviceSlot[] = [
  { type: 'preset', presetId: 'factory-1', syncStatus: 'current' },
  { type: 'preset', presetId: 'factory-2', syncStatus: 'current' },
  { type: 'preset', presetId: 'factory-3', syncStatus: 'current' },
  { type: 'preset', presetId: 'factory-4', syncStatus: 'current' },
  { type: 'preset', presetId: 'factory-5', syncStatus: 'current' },
]
