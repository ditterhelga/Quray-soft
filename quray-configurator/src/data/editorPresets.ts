import type { EditorZone } from '@/types'

export type EditorPreset = {
  id: string
  name: string
  zones: EditorZone[]
}

export const EDITOR_PRESETS: EditorPreset[] = [
  {
    id: 'preset-empty',
    name: 'New Preset',
    zones: [],
  },
  {
    id: 'p1',
    name: 'Bassline Filter Sweep',
    zones: [
      {
        id: 'p1-z1',
        name: 'Filter Cutoff',
        color: '#6C5BD9',
        type: 'CC',
        active: true,
        locked: false,
        position: [true, 0.0, 0.1, 0.25, 0.9],
        mappings: [{
          id: 'p1-z1-m1',
          type: 'CC',
          channel: 1,
          axis: 'Y',
          ccInputMode: 'device',
          ccDeviceId: 'elektron-analog-four-mkii',
          ccParamId: 'f1-freq',
          cc: 18,
          singleValue: false,
          bottom: 0,
          top: 127,
        }],
      },
      {
        id: 'p1-z2',
        name: 'C4',
        color: '#913F7E',
        type: 'Note',
        active: true,
        locked: false,
        position: [true, 0.25, 0.15, 0.55, 1.0],
        mappings: [{
          id: 'p1-z2-m1',
          type: 'Note',
          channel: 1,
          axis: 'Y',
          rootNote: 'C',
          octave: 4,
          chordMode: 'single',
          chordType: 'Major',
          split: { enabled: false, mode: 'Linear', xDivisions: 2, yDivisions: 2 },
        }],
      },
      {
        id: 'p1-z3',
        name: 'CV1 Pitch',
        color: '#3E8577',
        type: 'CV',
        active: true,
        locked: false,
        position: [true, 0.55, 0.2, 0.8, 0.85],
        mappings: [{
          id: 'p1-z3-m1',
          type: 'CV',
          channel: 1,
          axis: 'Y',
          port: 1,
          cvMode: 'Pitch',
          vOct: 'eurorack',
          singleValue: false,
          bottom: -10,
          top: 10,
        }],
      },
      {
        id: 'p1-z4',
        name: 'CV1 C4',
        color: '#B45846',
        type: null,
        active: true,
        locked: false,
        position: [true, 0.8, 0.3, 1.0, 0.75],
        mappings: [{
          id: 'p1-z4-m1',
          type: 'CV note',
          channel: 1,
          axis: 'Y',
          rootNote: 'C',
          octave: 4,
          port: 1,
          gateChannel: 2,
        }],
      },
    ],
  },
]

export function findEditorPreset(id: string): EditorPreset | undefined {
  return EDITOR_PRESETS.find((p) => p.id === id)
}
