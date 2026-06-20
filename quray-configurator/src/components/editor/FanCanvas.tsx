/**
 * FanCanvas.tsx
 *
 * Interactive HTML-canvas fan renderer for the Quray editor.
 *
 * Features
 * --------
 *  • Draws the fan background: dark sector fill + radial/angular grid
 *  • Renders each EditorZone as a coloured arc sector
 *  • Selected zone: brighter fill (70% opacity) + bright 2px outline
 *  • Unmapped zone (type === null): grey hatch pattern + amber ⚠ dot at zone centre
 *  • DRAG TO DRAW: mousedown on empty fan → dashed arc ghost preview → mouseup commits
 *  • RESIZE: drag any edge of the selected zone
 *  • HIT-TEST: click on zone selects it; click on empty canvas deselects
 *  • DPR-aware: canvas backing store matches device pixel ratio; context pre-scaled
 *  • ResizeObserver: canvas redraws correctly when the container is resized
 *
 * All geometry math is delegated to ../utils/fanGeometry.ts
 */

import { useCallback, useEffect, useRef } from 'react'
import { useEditorZones } from '@/context/EditorZonesContext'
import {
  canvasToLogical,
  clamp,
  logicalToCanvas,
  sectorForCanvas,
  sectorRectPath,
  type SectorGeometry,
} from '@/utils/fanGeometry'
import type { EditorZone, GesturePosition } from '@/types'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface FanCanvasProps {
  zones: EditorZone[]
  selectedZoneId: string | null
  /** When true, mousedown-drag draws a new zone instead of selecting. */
  drawMode: boolean
  onZoneSelect: (id: string | null) => void
  onZoneCreate: (position: GesturePosition) => void
  onZoneUpdate: (id: string, position: GesturePosition) => void
  onZoneContextMenu?: (zoneId: string, clientX: number, clientY: number) => void
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Grid subdivisions (0…N vertical spokes + horizontal arcs). */
const GRID_DIVISIONS = 7

/** Tolerance (in logical units) for edge hit detection. */
const EDGE_TOLERANCE = 0.025

/** Minimum zone size in logical units (prevents zero-area zones). */
const MIN_ZONE_SIZE = 0.01

/** Sector geometry for the editor canvas (uses shared sectorForCanvas centering). */
function editorSectorGeometry(w: number, h: number): SectorGeometry {
  return sectorForCanvas({ width: w, height: h })
}

// ---------------------------------------------------------------------------
// Theme colours resolved once from CSS custom properties
// ---------------------------------------------------------------------------

function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

// ---------------------------------------------------------------------------
// Internal drag-state type
// ---------------------------------------------------------------------------

type DragType =
  | 'create'
  | 'move'
  | 'edge-left'
  | 'edge-right'
  | 'edge-top'
  | 'edge-bottom'
  | null

interface DragState {
  type: DragType
  /** Canvas CSS-pixel coords of the pointer at drag start. */
  startPx: number
  startPy: number
  /** Live pointer position in canvas CSS pixels. */
  curPx: number
  curPy: number
  /** Zone being dragged (for move/resize). */
  zoneId: string | null
  /** Snapshot of zone.position at drag start (for move/resize delta). */
  startPosition: GesturePosition | null
}

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

/** Convert an event to canvas-CSS-pixel coords (accounting for DPR). */
function eventToCanvasPx(
  e: MouseEvent,
  canvas: HTMLCanvasElement,
): { px: number; py: number } {
  const rect = canvas.getBoundingClientRect()
  return {
    px: (e.clientX - rect.left),
    py: (e.clientY - rect.top),
  }
}

/**
 * Hit-test the selected zone for edge resize or interior move.
 * Checks edges in priority order, then interior.
 */
function hitTestSelectedZoneInteraction(
  lx: number,
  ly: number,
  pos: GesturePosition,
): DragType | 'inside' | null {
  const [, xMin, yMin, xMax, yMax] = pos
  const T = EDGE_TOLERANCE

  if (ly >= yMin && ly <= yMax && Math.abs(lx - xMin) < T) return 'edge-left'
  if (ly >= yMin && ly <= yMax && Math.abs(lx - xMax) < T) return 'edge-right'
  if (lx >= xMin && lx <= xMax && Math.abs(ly - yMin) < T) return 'edge-bottom'
  if (lx >= xMin && lx <= xMax && Math.abs(ly - yMax) < T) return 'edge-top'
  if (lx >= xMin && lx <= xMax && ly >= yMin && ly <= yMax) return 'inside'
  return null
}

/**
 * AABB hit-test in logical space. Returns the index of the topmost
 * (last in array) zone under the logical point, or -1.
 */
function hitTestZonesAtPoint(
  lx: number,
  ly: number,
  zones: EditorZone[],
  { includeLocked = false }: { includeLocked?: boolean } = {},
): number {
  for (let i = zones.length - 1; i >= 0; i--) {
    const zone = zones[i]
    if (!includeLocked && zone.locked) continue

    const [, xMin, yMin, xMax, yMax] = zone.position
    if (lx >= xMin && lx <= xMax && ly >= yMin && ly <= yMax) return i
  }
  return -1
}

function hitTestZones(lx: number, ly: number, zones: EditorZone[]): number {
  return hitTestZonesAtPoint(lx, ly, zones)
}

function isZoneLocked(zones: EditorZone[], zoneId: string | null): boolean {
  if (!zoneId) return false
  return zones.find((zone) => zone.id === zoneId)?.locked ?? false
}

/**
 * Apply an edge-drag delta to a position snapshot and return the new position.
 */
function applyEdgeDrag(
  edgeType: DragType,
  startPos: GesturePosition,
  deltaLx: number,
  deltaLy: number,
): GesturePosition {
  const [active, xMin, yMin, xMax, yMax] = startPos

  switch (edgeType) {
    case 'edge-left':
      return [active, clamp(xMin + deltaLx, 0, xMax - MIN_ZONE_SIZE), yMin, xMax, yMax]
    case 'edge-right':
      return [active, xMin, yMin, clamp(xMax + deltaLx, xMin + MIN_ZONE_SIZE, 1), yMax]
    case 'edge-bottom':
      return [active, xMin, clamp(yMin + deltaLy, 0, yMax - MIN_ZONE_SIZE), xMax, yMax]
    case 'edge-top':
      return [active, xMin, yMin, xMax, clamp(yMax + deltaLy, yMin + MIN_ZONE_SIZE, 1)]
    default:
      return startPos
  }
}

/**
 * Apply a move delta, clamped so the zone stays inside 0–1.
 */
function applyMoveDrag(
  startPos: GesturePosition,
  deltaLx: number,
  deltaLy: number,
): GesturePosition {
  const [active, xMin, yMin, xMax, yMax] = startPos
  const w = xMax - xMin
  const h = yMax - yMin
  const nx = clamp(xMin + deltaLx, 0, 1 - w)
  const ny = clamp(yMin + deltaLy, 0, 1 - h)
  return [active, nx, ny, nx + w, ny + h]
}

// ---------------------------------------------------------------------------
// Canvas drawing
// ---------------------------------------------------------------------------

/** Read CSS custom properties once per draw (cheap — cached by the engine). */
function drawSectorBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  S: SectorGeometry,
) {
  const bgBase    = getCssVar('--color-bg-base')       || '#151621'
  const bgSurface = getCssVar('--color-bg-surface')    || '#13131F'

  // Full canvas background
  ctx.fillStyle = bgBase
  ctx.fillRect(0, 0, w, h)

  // Sector fill
  sectorRectPath(ctx, S, 0, 0, 1, 1)
  ctx.fillStyle = bgSurface
  ctx.fill()

  // Clip to sector for grid lines
  ctx.save()
  sectorRectPath(ctx, S, 0, 0, 1, 1)
  ctx.clip()

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)'
  ctx.lineWidth = 0.5

  // Angular spokes (vertical in logical space)
  for (let i = 0; i <= GRID_DIVISIONS; i++) {
    const lx = i / GRID_DIVISIONS
    const p0 = logicalToCanvas(lx, 0, S)
    const p1 = logicalToCanvas(lx, 1, S)
    ctx.beginPath()
    ctx.moveTo(p0.x, p0.y)
    ctx.lineTo(p1.x, p1.y)
    ctx.stroke()
  }

  // Radial arcs (horizontal in logical space)
  for (let i = 0; i <= GRID_DIVISIONS; i++) {
    const ly = i / GRID_DIVISIONS
    const r  = S.innerR + ly * (S.outerR - S.innerR)
    ctx.beginPath()
    ctx.arc(S.cx, S.cy, r, S.startAngle, S.endAngle, false)
    ctx.stroke()
  }

  ctx.restore()

  // Sector border outline
  ctx.save()
  sectorRectPath(ctx, S, 0, 0, 1, 1)
  ctx.strokeStyle = getCssVar('--color-border-panel') || '#282A53'
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.restore()
}

/** Build a hatch pattern for unmapped zones (created once, cached in the ref). */
function buildHatchPattern(
  ctx: CanvasRenderingContext2D,
): CanvasPattern | null {
  const size = 8
  const offscreen = document.createElement('canvas')
  offscreen.width  = size
  offscreen.height = size
  const oc = offscreen.getContext('2d')
  if (!oc) return null
  oc.strokeStyle = 'rgba(141, 149, 178, 0.25)'   // --color-text-muted at 25%
  oc.lineWidth   = 1
  oc.beginPath()
  oc.moveTo(0, size)
  oc.lineTo(size, 0)
  oc.stroke()
  return ctx.createPattern(offscreen, 'repeat')
}


function drawZones(
  ctx: CanvasRenderingContext2D,
  S: SectorGeometry,
  zones: EditorZone[],
  selectedZoneId: string | null,
  livePositions: Map<string, GesturePosition>,
  hatchPattern: CanvasPattern | null,
) {
  for (let i = 0; i < zones.length; i++) {
    const zone   = zones[i]
    const pos    = livePositions.get(zone.id) ?? zone.position
    const [, xMin, yMin, xMax, yMax] = pos

    const isSelected = zone.id === selectedZoneId
    const isMapped   = zone.type !== null
    const isInactive = !zone.active

    // --- Fill ---
    sectorRectPath(ctx, S, xMin, yMin, xMax, yMax)

    if (isInactive) {
      ctx.fillStyle = 'rgba(141, 149, 178, 0.18)'
      ctx.fill()
    } else if (!isMapped && hatchPattern) {
      // Hatch pattern first, then translucent grey tint on top
      ctx.fillStyle = hatchPattern
      ctx.fill()
      sectorRectPath(ctx, S, xMin, yMin, xMax, yMax)
      ctx.fillStyle = isSelected
        ? 'rgba(141, 149, 178, 0.35)'
        : 'rgba(141, 149, 178, 0.12)'
      ctx.fill()
    } else {
      ctx.fillStyle = hexToRgba(zone.color, isSelected ? 0.70 : 0.30)
      ctx.fill()
    }

    // --- Stroke ---
    sectorRectPath(ctx, S, xMin, yMin, xMax, yMax)
    if (isInactive) {
      ctx.strokeStyle = 'rgba(141, 149, 178, 0.4)'
    } else {
      ctx.strokeStyle = isSelected
        ? zone.color
        : hexToRgba(zone.color, 0.55)
    }
    ctx.lineWidth = isSelected ? 2 : 1
    ctx.stroke()

    // --- Zone label + icons (all baseline-aligned) ---
    const PX_OFFSET = 24
    const span = S.outerR - S.innerR
    const OFFSET_X = PX_OFFSET / (span * 2)
    const OFFSET_Y = PX_OFFSET / span
    const labelPos = logicalToCanvas(xMin + OFFSET_X, yMax - OFFSET_Y, S)

    // Shared baseline for all icons
    const BASE_Y = labelPos.y
    const ICON_H = 10
    const iconBaseY = BASE_Y

    ctx.save()
    ctx.font = 'normal 14px monospace'
    ctx.fillStyle = 'rgba(238, 239, 252, 0.90)'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(String(i + 1).padStart(2, '0'), labelPos.x, BASE_Y)
    ctx.restore()

    let iconCursorX = labelPos.x + 26

    // Lock icon
    if (zone.locked) {
      const ix = iconCursorX
      const iy = iconBaseY
      const W = 9
      ctx.save()
      ctx.fillStyle = 'rgba(238, 239, 252, 0.7)'
      ctx.strokeStyle = 'rgba(238, 239, 252, 0.7)'
      ctx.beginPath()
      ctx.roundRect(ix, iy + 3, W, 7, 2)
      ctx.fill()
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(ix + W / 2, iy + 3, W / 2 - 1, Math.PI, 0)
      ctx.stroke()
      ctx.restore()
      iconCursorX += 14
    }

    // Mute icon
    if (isInactive) {
      const ix = iconCursorX
      const iy = iconBaseY
      const alpha = 'rgba(238, 239, 252, 0.6)'
      ctx.save()
      ctx.fillStyle = alpha
      ctx.strokeStyle = alpha
      ctx.lineCap = 'round'
      // Speaker body
      ctx.beginPath()
      ctx.roundRect(ix, iy + 2, 5, 7, 1)
      ctx.fill()
      // Speaker cone
      ctx.beginPath()
      ctx.moveTo(ix + 5, iy + 1)
      ctx.lineTo(ix + 10, iy)
      ctx.lineTo(ix + 10, iy + 11)
      ctx.lineTo(ix + 5, iy + 10)
      ctx.closePath()
      ctx.fill()
      // Strike-through
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(ix, iy)
      ctx.lineTo(ix + 11, iy + 11)
      ctx.stroke()
      ctx.restore()
    }

    // --- Unmapped warning dot ---
    if (!isMapped && !isInactive) {
      const midLx   = (xMin + xMax) / 2
      const midLy   = (yMin + yMax) / 2
      const centreP = logicalToCanvas(midLx, midLy, S)
      ctx.beginPath()
      ctx.arc(centreP.x, centreP.y, 7, 0, Math.PI * 2)
      ctx.fillStyle = getCssVar('--color-status-progress') || '#CC9F2C'
      ctx.fill()
      // Exclamation mark
      ctx.fillStyle = '#000'
      ctx.font      = 'bold 9px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('!', centreP.x, centreP.y)
      ctx.textAlign    = 'left'
      ctx.textBaseline = 'alphabetic'
    }

  }
}

function drawCreatePreview(
  ctx: CanvasRenderingContext2D,
  S: SectorGeometry,
  startPx: number,
  startPy: number,
  curPx: number,
  curPy: number,
) {
  const L1   = canvasToLogical(startPx, startPy, S)
  const L2   = canvasToLogical(curPx,   curPy,   S)
  const xMin = clamp(Math.min(L1.x, L2.x), 0, 1)
  const xMax = clamp(Math.max(L1.x, L2.x), 0, 1)
  const yMin = clamp(Math.min(L1.y, L2.y), 0, 1)
  const yMax = clamp(Math.max(L1.y, L2.y), 0, 1)

  // Ghost fill
  sectorRectPath(ctx, S, xMin, yMin, xMax, yMax)
  const accent = getCssVar('--color-accent') || '#5145F2'
  ctx.fillStyle = accent
  ctx.globalAlpha = 0.25
  ctx.fill()
  ctx.globalAlpha = 1.0

  // Dashed outline
  sectorRectPath(ctx, S, xMin, yMin, xMax, yMax)
  ctx.strokeStyle = accent
  ctx.lineWidth   = 1.5
  ctx.setLineDash([5, 4])
  ctx.stroke()
  ctx.setLineDash([])

  // Dimensions label
  const w = (xMax - xMin).toFixed(2)
  const h = (yMax - yMin).toFixed(2)
  const labelP = logicalToCanvas((xMin + xMax) / 2, yMin, S)
  ctx.fillStyle    = 'rgba(238, 239, 252, 0.9)'
  ctx.font         = '10px var(--font-mono, monospace)'
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillText(`${w} × ${h}`, labelP.x, labelP.y - 4)
  ctx.textAlign    = 'left'
  ctx.textBaseline = 'alphabetic'
}

// ---------------------------------------------------------------------------
// Colour helper
// ---------------------------------------------------------------------------

/** Convert a hex colour to rgba(...) with the given alpha. */
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FanCanvas({
  zones,
  selectedZoneId,
  drawMode,
  onZoneSelect,
  onZoneCreate,
  onZoneUpdate,
  onZoneContextMenu,
}: FanCanvasProps) {
  const { presetScale, presetRoot, presetOctave } = useEditorZones()
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)

  // Mirror props into refs so the RAF loop always reads current values
  // without needing to be re-created.
  const zonesRef       = useRef<EditorZone[]>(zones)
  const selectedIdRef  = useRef<string | null>(selectedZoneId)
  const drawModeRef    = useRef<boolean>(drawMode)
  const presetScaleRef = useRef(presetScale)
  const presetRootRef  = useRef(presetRoot)
  const presetOctaveRef = useRef(presetOctave)

  const onZoneCreateRef = useRef(onZoneCreate)
  const onZoneUpdateRef = useRef(onZoneUpdate)

  useEffect(() => { zonesRef.current      = zones },          [zones])
  useEffect(() => { selectedIdRef.current = selectedZoneId }, [selectedZoneId])
  useEffect(() => { drawModeRef.current   = drawMode },       [drawMode])
  useEffect(() => { presetScaleRef.current = presetScale }, [presetScale])
  useEffect(() => { presetRootRef.current = presetRoot }, [presetRoot])
  useEffect(() => { presetOctaveRef.current = presetOctave }, [presetOctave])
  useEffect(() => { onZoneCreateRef.current = onZoneCreate }, [onZoneCreate])
  useEffect(() => { onZoneUpdateRef.current = onZoneUpdate }, [onZoneUpdate])

  // Drag state — all in a ref so mutations never trigger re-renders.
  const drag = useRef<DragState>({
    type:          null,
    startPx:       0,
    startPy:       0,
    curPx:         0,
    curPy:         0,
    zoneId:        null,
    startPosition: null,
  })

  // Live positions during a drag — overrides zone.position for the dragged zone.
  const livePositions = useRef<Map<string, GesturePosition>>(new Map())

  // Hatch pattern (built once, reused).
  const hatchPatternRef = useRef<CanvasPattern | null>(null)

  // Logical canvas dimensions (CSS pixels) — set by ResizeObserver.
  const sizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 })

  // ---------------------------------------------------------------------------
  // Resize handling
  // ---------------------------------------------------------------------------

  const resizeCanvas = useCallback(() => {
    const container = containerRef.current
    const canvas    = canvasRef.current
    if (!container || !canvas) return

    const w   = container.clientWidth
    const h   = container.clientHeight
    const dpr = window.devicePixelRatio || 1

    // Set physical backing store
    canvas.width  = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)

    // CSS size stays as the container size
    canvas.style.width  = `${w}px`
    canvas.style.height = `${h}px`

    sizeRef.current = { w, h }

    // Re-create hatch pattern against the new context
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(dpr, dpr)
      hatchPatternRef.current = buildHatchPattern(ctx)
      // Reset scale (will be re-applied each frame via resetTransform)
      ctx.resetTransform()
    }
  }, [])

  useEffect(() => {
    resizeCanvas()
    const observer = new ResizeObserver(resizeCanvas)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [resizeCanvas])

  // ---------------------------------------------------------------------------
  // RAF render loop
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let rafId = 0

    function paint() {
      const canvas = canvasRef.current
      if (!canvas) { rafId = requestAnimationFrame(paint); return }

      const ctx = canvas.getContext('2d')
      if (!ctx) { rafId = requestAnimationFrame(paint); return }

      const { w, h } = sizeRef.current
      if (w === 0 || h === 0) { rafId = requestAnimationFrame(paint); return }

      const dpr = window.devicePixelRatio || 1

      // Reset to identity, then apply DPR scale once per frame.
      ctx.resetTransform()
      ctx.scale(dpr, dpr)

      const S = editorSectorGeometry(w, h)

      drawSectorBackground(ctx, w, h, S)
      drawZones(
        ctx, S,
        zonesRef.current,
        selectedIdRef.current,
        livePositions.current,
        hatchPatternRef.current,
      )

      // Draw in-progress ghost if creating a zone
      const d = drag.current
      if (d.type === 'create') {
        drawCreatePreview(ctx, S, d.startPx, d.startPy, d.curPx, d.curPy)
      }

      rafId = requestAnimationFrame(paint)
    }

    rafId = requestAnimationFrame(paint)
    return () => cancelAnimationFrame(rafId)
  }, [])

  // ---------------------------------------------------------------------------
  // Cursor
  // ---------------------------------------------------------------------------

  function updateCursor(px: number, py: number) {
    const canvas = canvasRef.current
    if (!canvas) return
    const { w, h } = sizeRef.current
    const S = editorSectorGeometry(w, h)
    const L = canvasToLogical(px, py, S)

    if (drawModeRef.current) {
      canvas.style.cursor = 'crosshair'
      return
    }

    const selId = selectedIdRef.current
    const selZone = selId ? zonesRef.current.find(z => z.id === selId) : null
    if (selZone && !selZone.locked) {
      const pos = livePositions.current.get(selZone.id) ?? selZone.position
      const interaction = hitTestSelectedZoneInteraction(L.x, L.y, pos)
      if (interaction === 'edge-left' || interaction === 'edge-right') {
        canvas.style.cursor = 'ew-resize'
        return
      }
      if (interaction === 'edge-bottom' || interaction === 'edge-top') {
        canvas.style.cursor = 'ns-resize'
        return
      }
      if (interaction === 'inside') {
        canvas.style.cursor = 'move'
        return
      }
    }

    const idx = hitTestZones(L.x, L.y, zonesRef.current)
    if (idx !== -1) {
      canvas.style.cursor = 'pointer'
    } else {
      canvas.style.cursor = 'default'
    }
  }

  // ---------------------------------------------------------------------------
  // Mouse handlers
  // ---------------------------------------------------------------------------

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    e.preventDefault()

    const { px, py } = eventToCanvasPx(e.nativeEvent, canvas)
    const { w, h }   = sizeRef.current
    const S          = editorSectorGeometry(w, h)
    const L          = canvasToLogical(px, py, S)

    drag.current.startPx = px
    drag.current.startPy = py
    drag.current.curPx   = px
    drag.current.curPy   = py

    // ---- Draw mode: start zone creation ----
    if (drawModeRef.current) {
      drag.current.type          = 'create'
      drag.current.zoneId        = null
      drag.current.startPosition = null
      return
    }

    const selId   = selectedIdRef.current
    const selZone = selId ? zonesRef.current.find(z => z.id === selId) : null
    if (selZone && !selZone.locked) {
      const pos = livePositions.current.get(selZone.id) ?? selZone.position
      const interaction = hitTestSelectedZoneInteraction(L.x, L.y, pos)
      if (
        interaction === 'edge-left' ||
        interaction === 'edge-right' ||
        interaction === 'edge-top' ||
        interaction === 'edge-bottom'
      ) {
        drag.current.type          = interaction
        drag.current.zoneId        = selZone.id
        drag.current.startPosition = [...pos] as GesturePosition
        return
      }
    }

    // ---- Hit-test zones ----
    const idx = hitTestZones(L.x, L.y, zonesRef.current)
    if (idx === -1) {
      // Click on empty canvas — deselect
      onZoneSelect(null)
      return
    }

    const zone = zonesRef.current[idx]
    onZoneSelect(zone.id)

    // If clicking the already-selected zone, start move
    if (zone.id === selId && !zone.locked) {
      const pos = livePositions.current.get(zone.id) ?? zone.position
      drag.current.type          = 'move'
      drag.current.zoneId        = zone.id
      drag.current.startPosition = [...pos] as GesturePosition
    }
  }, [onZoneSelect])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const { px, py } = eventToCanvasPx(e, canvas)
      drag.current.curPx = px
      drag.current.curPy = py

      const d = drag.current
      if (!d.type) {
        updateCursor(px, py)
        return
      }

      if (d.type === 'create') return

      if (!d.zoneId || !d.startPosition) return
      if (isZoneLocked(zonesRef.current, d.zoneId)) return

      const { w, h } = sizeRef.current
      const S        = editorSectorGeometry(w, h)
      const Lstart   = canvasToLogical(d.startPx, d.startPy, S)
      const Lcur     = canvasToLogical(px, py, S)
      const dLx      = Lcur.x - Lstart.x
      const dLy      = Lcur.y - Lstart.y

      let newPos: GesturePosition
      if (d.type === 'move') {
        newPos = applyMoveDrag(d.startPosition, dLx, dLy)
      } else {
        newPos = applyEdgeDrag(d.type, d.startPosition, dLx, dLy)
      }

      livePositions.current.set(d.zoneId, newPos)
    }

    const onUp = (e: MouseEvent) => {
      const canvas = canvasRef.current
      const d      = drag.current
      if (!canvas || !d.type) return

      const { px, py } = eventToCanvasPx(e, canvas)

      if (d.type === 'create') {
        const { w, h } = sizeRef.current
        const S        = editorSectorGeometry(w, h)
        const L1       = canvasToLogical(d.startPx, d.startPy, S)
        const L2       = canvasToLogical(px, py, S)
        const xMin     = clamp(Math.min(L1.x, L2.x), 0, 1)
        const xMax     = clamp(Math.max(L1.x, L2.x), 0, 1)
        const yMin     = clamp(Math.min(L1.y, L2.y), 0, 1)
        const yMax     = clamp(Math.max(L1.y, L2.y), 0, 1)

        if (xMax - xMin >= MIN_ZONE_SIZE && yMax - yMin >= MIN_ZONE_SIZE) {
          onZoneCreateRef.current([true, xMin, yMin, xMax, yMax])
        }
      } else if (d.zoneId) {
        if (isZoneLocked(zonesRef.current, d.zoneId)) {
          livePositions.current.delete(d.zoneId)
        } else {
          const livePos = livePositions.current.get(d.zoneId)
          if (livePos) {
            onZoneUpdateRef.current(d.zoneId, livePos)
            livePositions.current.delete(d.zoneId)
          }
        }
      }

      drag.current.type          = null
      drag.current.zoneId        = null
      drag.current.startPosition = null
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [])

  const onContextMenu = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onZoneContextMenu) return

    e.preventDefault()

    const canvas = canvasRef.current
    if (!canvas) return

    const { px, py } = eventToCanvasPx(e.nativeEvent, canvas)
    const { w, h } = sizeRef.current
    const S = editorSectorGeometry(w, h)
    const L = canvasToLogical(px, py, S)

    const idx = hitTestZonesAtPoint(L.x, L.y, zonesRef.current, { includeLocked: true })
    if (idx === -1) return

    const zone = zonesRef.current[idx]
    onZoneSelect(zone.id)
    onZoneContextMenu(zone.id, e.clientX, e.clientY)
  }, [onZoneContextMenu, onZoneSelect])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ background: 'var(--color-bg-base)' }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={onMouseDown}
        onContextMenu={onContextMenu}
        style={{ display: 'block' }}
      />

    </div>
  )
}
