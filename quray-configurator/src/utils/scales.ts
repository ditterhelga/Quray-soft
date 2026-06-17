export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export const SCALES: Record<string, number[]> = {
  'Chromatic':     [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  'Natural Minor': [0, 2, 3, 5, 7, 8, 10],
  'Dorian':        [0, 2, 3, 5, 7, 9, 10],
  'Lydian':        [0, 2, 4, 6, 7, 9, 11],
  'Pentatonic':    [0, 2, 4, 7, 9],
  'Locrian':       [0, 1, 3, 5, 6, 8, 10],
}

export const SCALE_NAMES = Object.keys(SCALES)

/**
 * Build the in-scale note list across octaves, starting at root + startOctave.
 * Returns `count` note name strings, e.g. ["C4", "D4", "E4", ...].
 */
export function buildScaleNotes(
  scale: string,
  root: string,
  startOctave: number,
  count: number,
): string[] {
  const rootIdx = NOTE_NAMES.indexOf(root)
  const intervals = SCALES[scale] ?? SCALES['Chromatic']
  const result: string[] = []
  let degree = 0

  while (result.length < count) {
    const octaveSpan = Math.floor(degree / intervals.length)
    const semitone = intervals[degree % intervals.length] + rootIdx
    const noteIdx = semitone % 12
    const octave = startOctave + octaveSpan + Math.floor(semitone / 12)
    result.push(`${NOTE_NAMES[noteIdx]}${octave}`)
    degree++
  }

  return result
}

/**
 * Apply a distribution mode to an in-scale note array.
 * Returns exactly `steps` notes (may repeat for Jump/Random modes).
 */
export function distributeNotes(
  scaleNotes: string[],
  mode: string,
  steps: number,
): string[] {
  if (scaleNotes.length === 0) return []

  if (mode === 'Linear') {
    return scaleNotes.slice(0, steps)
  }

  if (mode === 'Jump 2') {
    const out: string[] = []
    for (let i = 0; out.length < steps; i += 2) {
      out.push(scaleNotes[i % scaleNotes.length])
    }
    return out
  }

  if (mode === 'Jump 3') {
    const out: string[] = []
    for (let i = 0; out.length < steps; i += 3) {
      out.push(scaleNotes[i % scaleNotes.length])
    }
    return out
  }

  if (mode === 'Random') {
    const out: string[] = []
    for (let i = 0; i < steps; i++) {
      out.push(scaleNotes[Math.floor(Math.random() * scaleNotes.length)])
    }
    return out
  }

  return scaleNotes.slice(0, steps)
}
