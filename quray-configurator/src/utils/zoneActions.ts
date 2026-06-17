import { clamp } from '@/utils/fanGeometry'
import type { EditorZone, GesturePosition } from '@/types'

export function offsetGesturePosition(
  position: GesturePosition,
  deltaX: number,
  deltaY = 0,
): GesturePosition {
  const [active, xMin, yMin, xMax, yMax] = position
  const width = xMax - xMin
  const height = yMax - yMin
  const nxMin = clamp(xMin + deltaX, 0, 1 - width)
  const nyMin = clamp(yMin + deltaY, 0, 1 - height)
  return [active, nxMin, nyMin, nxMin + width, nyMin + height]
}

export function duplicateZoneRecord(source: EditorZone, newId: string): EditorZone {
  return {
    ...source,
    id: newId,
    name: `${source.name} copy`,
    position: offsetGesturePosition(source.position, 0.03),
  }
}
