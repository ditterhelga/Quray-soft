// Mock MIDI device database for the semantic CC picker.
// In production this is sourced from midi.guide (see Design Brief §5, §7).
// Replace with the real cached dataset once the dev provides it.

export type MidiParameter = { id: string; name: string; cc: number }
export type MidiDevice = { id: string; name: string; parameters: MidiParameter[] }

export const MIDI_DEVICES: MidiDevice[] = [
  {
    id: 'elektron-analog-rytm',
    name: 'Elektron Analog Rytm',
    parameters: [
      { id: 'cutoff', name: 'Filter Cutoff', cc: 74 },
      { id: 'resonance', name: 'Resonance', cc: 71 },
      { id: 'overdrive', name: 'Overdrive', cc: 75 },
      { id: 'decay', name: 'Amp Decay', cc: 73 },
    ],
  },
  {
    id: 'moog-matriarch',
    name: 'Moog Matriarch',
    parameters: [
      { id: 'cutoff', name: 'Filter Cutoff', cc: 74 },
      { id: 'resonance', name: 'Resonance', cc: 71 },
      { id: 'lfo-rate', name: 'LFO Rate', cc: 3 },
      { id: 'glide', name: 'Glide', cc: 5 },
    ],
  },
  {
    id: 'arturia-microfreak',
    name: 'Arturia MicroFreak',
    parameters: [
      { id: 'cutoff', name: 'Filter Cutoff', cc: 23 },
      { id: 'resonance', name: 'Resonance', cc: 83 },
      { id: 'env-rise', name: 'Cycling Env Rise', cc: 105 },
      { id: 'wave', name: 'Wave', cc: 9 },
    ],
  },
  {
    id: 'korg-minilogue',
    name: 'Korg Minilogue',
    parameters: [
      { id: 'cutoff', name: 'Filter Cutoff', cc: 43 },
      { id: 'resonance', name: 'Resonance', cc: 44 },
      { id: 'attack', name: 'Amp Attack', cc: 16 },
      { id: 'release', name: 'Amp Release', cc: 19 },
    ],
  },
  {
    id: 'novation-bass-station-2',
    name: 'Novation Bass Station II',
    parameters: [
      { id: 'cutoff', name: 'Filter Frequency', cc: 74 },
      { id: 'resonance', name: 'Resonance', cc: 71 },
      { id: 'attack', name: 'Env Attack', cc: 73 },
      { id: 'lfo1-rate', name: 'LFO 1 Rate', cc: 26 },
    ],
  },
  {
    id: 'sequential-prophet-6',
    name: 'Sequential Prophet-6',
    parameters: [
      { id: 'cutoff', name: 'Filter Cutoff', cc: 102 },
      { id: 'resonance', name: 'Resonance', cc: 103 },
      { id: 'attack', name: 'Filter Attack', cc: 79 },
      { id: 'release', name: 'Filter Release', cc: 82 },
    ],
  },
]

export function findMidiDevice(deviceId?: string): MidiDevice | undefined {
  return MIDI_DEVICES.find((device) => device.id === deviceId)
}

export function findMidiParameter(deviceId?: string, paramId?: string): MidiParameter | undefined {
  return findMidiDevice(deviceId)?.parameters.find((param) => param.id === paramId)
}
