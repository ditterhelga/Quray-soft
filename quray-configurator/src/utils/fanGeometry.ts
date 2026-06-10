/**
 * fanGeometry.ts
 *
 * Pure geometry utilities for the Quray fan-sector canvas.
 * Ported verbatim from base_fw-master/data/view/gesture-canvas.js — no DOM,
 * no Alpine, no side-effects.  Every function is a pure transformation.
 *
 * COORDINATE SYSTEM
 * -----------------
 *  Logical space  x: 0.0–1.0  (angular, left → right across the 96° fan)
 *                 y: 0.0–1.0  (radial,  near → far, 0 = inner arc, 1 = outer arc)
 *
 *  Canvas space   px/py in CSS pixels (caller supplies logical W×H; DPR is
 *                 handled outside by scaling the 2d context).
 *
 * The fan spans 96° total (±48° from 12 o'clock).
 * The mathematical centre point sits BELOW the visible canvas bottom edge.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SectorGeometry {
  /** X coordinate of the fan centre in canvas (CSS) pixels. */
  cx: number
  /** Y coordinate of the fan centre in canvas pixels — usually below the canvas. */
  cy: number
  /** Radius of the inner (nearest) arc in canvas pixels. */
  innerR: number
  /** Radius of the outer (farthest) arc in canvas pixels. */
  outerR: number
  /** Start angle in radians (left edge of fan, measured from east/3 o'clock). */
  startAngle: number
  /** End angle in radians (right edge of fan). */
  endAngle: number
  /** Half of the total fan opening angle in radians (48°). */
  halfAngle: number
}

export interface LogicalPoint {
  x: number   // 0–1
  y: number   // 0–1
}

export interface CanvasPoint {
  x: number   // CSS pixels
  y: number   // CSS pixels
}

// ---------------------------------------------------------------------------
// Core geometry
// ---------------------------------------------------------------------------

/**
 * Compute the sector geometry for a canvas of the given logical CSS dimensions.
 * Pass `{ width, height }` — the CSS size, NOT the physical pixel dimensions
 * (i.e. before DPR scaling).
 */
export function sectorForCanvas(canvas: { width: number; height: number }): SectorGeometry {
  const W = canvas.width
  const H = canvas.height
  const halfAngle = (Math.PI * (96 / 2)) / 180          // 48° → radians
  const vertSpan  = H * 0.88                             // usable radial span in px
  const outerR    = (0.95 * W) / (2 * Math.sin(halfAngle))
  const innerR    = Math.max(outerR * 0.15, outerR - vertSpan)
  const cx        = W / 2
  const cy        = H * 0.92 + innerR                    // centre is below canvas bottom
  return {
    cx,
    cy,
    innerR,
    outerR,
    startAngle: -Math.PI / 2 - halfAngle,
    endAngle:   -Math.PI / 2 + halfAngle,
    halfAngle,
  }
}

/**
 * Convert a logical point (x, y both 0–1) to canvas CSS pixel coordinates.
 */
export function logicalToCanvas(lx: number, ly: number, S: SectorGeometry): CanvasPoint {
  const angle  = S.startAngle + lx * (S.endAngle - S.startAngle)
  const radius = S.innerR     + ly * (S.outerR   - S.innerR)
  return {
    x: S.cx + radius * Math.cos(angle),
    y: S.cy + radius * Math.sin(angle),
  }
}

/**
 * Convert canvas CSS pixel coordinates back to logical space (inverse of logicalToCanvas).
 * Result x/y may be outside 0–1 if the point is outside the fan.
 */
export function canvasToLogical(px: number, py: number, S: SectorGeometry): LogicalPoint {
  const dx     = px - S.cx
  const dy     = py - S.cy
  const radius = Math.sqrt(dx * dx + dy * dy)
  const angle  = Math.atan2(dy, dx)
  return {
    x: (angle  - S.startAngle) / (S.endAngle - S.startAngle),
    y: (radius - S.innerR)     / (S.outerR   - S.innerR),
  }
}

/**
 * Trace a canvas path for an arc sector defined by a logical bounding rectangle.
 * The path is NOT stroked/filled — caller decides style.
 *
 * @param ctx    2D canvas context (DPR scale already applied)
 * @param S      Sector geometry from sectorForCanvas()
 * @param xMin   Left edge in logical space  (0–1)
 * @param yMin   Near edge in logical space  (0–1)
 * @param xMax   Right edge in logical space (0–1)
 * @param yMax   Far edge in logical space   (0–1)
 */
export function sectorRectPath(
  ctx: CanvasRenderingContext2D,
  S: SectorGeometry,
  xMin: number,
  yMin: number,
  xMax: number,
  yMax: number,
): void {
  const rInner = S.innerR + yMin * (S.outerR - S.innerR)
  const rOuter = S.innerR + yMax * (S.outerR - S.innerR)
  const aStart = S.startAngle + xMin * (S.endAngle - S.startAngle)
  const aEnd   = S.startAngle + xMax * (S.endAngle - S.startAngle)

  ctx.beginPath()
  ctx.arc(S.cx, S.cy, rInner, aStart, aEnd,   false)  // inner arc, clockwise
  ctx.arc(S.cx, S.cy, rOuter, aEnd,   aStart, true)   // outer arc, counter-clockwise
  ctx.closePath()
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Clamp a value to [min, max].
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Return true if the logical point (lx, ly) lies inside the fan sector
 * (both x and y in 0–1).
 */
export function isInsideFan(lx: number, ly: number): boolean {
  return lx >= 0 && lx <= 1 && ly >= 0 && ly <= 1
}
