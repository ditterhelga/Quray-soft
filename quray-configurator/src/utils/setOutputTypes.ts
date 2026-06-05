import type { OutputType, Preset, Set as LibrarySet } from '@/types'

const OUTPUT_ORDER: OutputType[] = ['MIDI Note', 'MIDI CC', 'CV']

export function getSetOutputTypes(
  set: LibrarySet,
  presetsById: Map<string, Preset>,
): OutputType[] {
  const union = new Set<OutputType>()

  for (const presetId of set.members.map((member) => member.presetId)) {
    const preset = presetsById.get(presetId)
    preset?.outputTypes.forEach((type) => union.add(type))
  }

  return OUTPUT_ORDER.filter((type) => union.has(type))
}
