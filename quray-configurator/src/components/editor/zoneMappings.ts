import { findMidiParameter } from '@/components/editor/midiDevices'

export const ROOT_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const

export type ZoneMappingType = 'Note' | 'CC' | 'CV' | 'CV note'
export type ZoneAxis = 'Y' | 'X' | 'Entry' | 'Exit'
export type SplitMode = 'Linear' | 'Jump 2' | 'Jump 3' | 'Random'
export type CvMode = 'Pitch' | 'Continuous' | 'Gate' | 'Trigger'

export type ZoneMapping = {
  id: string
  type: ZoneMappingType
  channel: number
  axis: ZoneAxis
  rootNote?: string
  octave?: number
  split?: {
    enabled: boolean
    mode: SplitMode
    xDivisions: number
    yDivisions: number
  }
  cc?: number
  ccInputMode?: 'device' | 'manual'
  ccDeviceId?: string
  ccParamId?: string
  port?: number
  cvMode?: CvMode
  vOct?: 'eurorack' | 'buchla'
  gateChannel?: number
  singleValue?: boolean
  bottom?: number
  top?: number
}

export const CV_MODE_OPTIONS = [
  { value: 'Pitch' as const, label: 'Pitch (1V/oct)' },
  { value: 'Continuous' as const, label: 'Continuous' },
  { value: 'Gate' as const, label: 'Gate' },
  { value: 'Trigger' as const, label: 'Trigger' },
]

export const MAPPING_TYPE_OPTIONS: ZoneMappingType[] = ['Note', 'CC', 'CV', 'CV note']

export function createMappingId() {
  return `map-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function createDefaultMapping(type: ZoneMappingType = 'Note'): ZoneMapping {
  const base: ZoneMapping = {
    id: createMappingId(),
    type,
    channel: 1,
    axis: 'Y',
  }

  switch (type) {
    case 'Note':
      return {
        ...base,
        rootNote: 'C',
        octave: 4,
        split: { enabled: false, mode: 'Linear', steps: 6, xDivisions: 2, yDivisions: 2 },
      }
    case 'CC':
      return {
        ...base,
        cc: 74,
        ccInputMode: 'device',
        singleValue: false,
        bottom: 0,
        top: 127,
      }
    case 'CV':
      return {
        ...base,
        port: 1,
        cvMode: 'Pitch',
        vOct: 'eurorack',
        singleValue: false,
        bottom: -5,
        top: 5,
      }
    case 'CV note':
      return {
        ...base,
        rootNote: 'C',
        octave: 4,
        port: 1,
        gateChannel: 1,
      }
  }
}

export function ensureMappingFields(mapping: ZoneMapping): ZoneMapping {
  const defaults = createDefaultMapping(mapping.type)
  return { ...defaults, ...mapping, id: mapping.id }
}

export function applyMappingTypeChange(
  mapping: ZoneMapping,
  nextType: ZoneMappingType,
): ZoneMapping {
  return ensureMappingFields({
    ...mapping,
    type: nextType,
    channel: mapping.channel,
    axis: mapping.axis,
    rootNote: mapping.rootNote,
    octave: mapping.octave,
    port: mapping.port,
    gateChannel: mapping.gateChannel,
    cc: mapping.cc,
    cvMode: mapping.cvMode,
    singleValue: mapping.singleValue,
    bottom: mapping.bottom,
    top: mapping.top,
    split: mapping.split,
  })
}

export function cloneMappings(mappings: ZoneMapping[]): ZoneMapping[] {
  return structuredClone(mappings)
}

export function axisSummaryLabel(axis: ZoneAxis): string {
  if (axis === 'Y' || axis === 'X') {
    return `${axis} axis`
  }
  return axis
}

export function mappingSummary(mapping: ZoneMapping): string {
  switch (mapping.type) {
    case 'Note':
      return `Note · ${mapping.rootNote ?? 'C'}${mapping.octave ?? 4}`
    case 'CC': {
      if (mapping.ccInputMode === 'device') {
        const param = findMidiParameter(mapping.ccDeviceId, mapping.ccParamId)
        if (param) return `${param.name} · ${axisSummaryLabel(mapping.axis)}`
      }
      return `CC ${mapping.cc ?? 0} · ${axisSummaryLabel(mapping.axis)}`
    }
    case 'CV':
      return `CV${mapping.port ?? 1} · ${mapping.cvMode ?? 'Pitch'} · ${axisSummaryLabel(mapping.axis)}`
    case 'CV note':
      return `CV note · ${mapping.rootNote ?? 'C'}${mapping.octave ?? 4} · CV${mapping.port ?? 1}`
  }
}

export function deriveZoneTypeFromMappings(
  mappings: ZoneMapping[],
): 'Note' | 'CC' | 'CV' | null {
  if (mappings.length === 0) {
    return null
  }

  const primary = mappings[0].type
  if (primary === 'CV note') {
    return 'Note'
  }
  return primary
}
