import { findMidiParameter } from '@/components/editor/midiDevices'

export const ROOT_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const

export type ZoneMappingType = 'Note' | 'CC' | 'CV' | 'CV note'
export type ZoneAxis = 'Y' | 'X' | 'Entry' | 'Exit'
export type SplitMode = 'Linear' | 'Jump 2' | 'Jump 3' | 'Random'
export type CvMode = 'Pitch' | 'Continuous' | 'Gate' | 'Trigger'

export const CHORD_TYPES = ['Major', 'Minor', 'Sus2', 'Sus4', 'Power', 'Oct'] as const
export type ChordType = typeof CHORD_TYPES[number]

export type ZoneMapping = {
  id: string
  type: ZoneMappingType
  channel: number
  axis: ZoneAxis
  rootNote?: string
  octave?: number
  chordMode?: 'single' | 'chord'
  chordType?: 'Major' | 'Minor' | 'Sus2' | 'Sus4' | 'Power' | 'Oct'
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
        chordMode: 'single',
        chordType: 'Major',
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
        axis: 'Y',
        port: 1,
        cvMode: 'Pitch',
        vOct: 'eurorack' as const,
        singleValue: false,
        bottom: -10,
        top: 10,
      }
    case 'CV note':
      return {
        ...base,
        axis: 'Y',
        rootNote: 'C',
        octave: 4,
        port: 1,
        gateChannel: 2,
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
  if (nextType === 'CV') {
    return ensureMappingFields({
      ...mapping,
      type: nextType,
      channel: mapping.channel,
      axis: mapping.axis ?? 'Y',
      port: mapping.port,
      cvMode: mapping.cvMode,
      vOct: mapping.vOct,
      singleValue: false,
      bottom: -10,
      top: 10,
    })
  }

  if (nextType === 'CC') {
    return ensureMappingFields({
      ...mapping,
      type: nextType,
      channel: mapping.channel,
      axis: mapping.axis,
      cc: mapping.cc ?? 74,
      singleValue: false,
      bottom: 0,
      top: 127,
    })
  }

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
      if (mapping.chordMode === 'chord') {
        return `${mapping.chordType ?? 'Major'} · ${mapping.rootNote ?? 'C'}${mapping.octave ?? 4}`
      }
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
