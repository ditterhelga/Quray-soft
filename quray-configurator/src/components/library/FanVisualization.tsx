import { findEditorPreset } from '@/data/editorPresets'
import type { PresetZone } from '@/types'

type FanVisualizationProps = {
  zones: PresetZone[]
  presetId?: string
}

const CX = 180
const CY = 220
const OUTER_R = 190
const INNER_R = 80
const START_ANGLE = 200
const END_ANGLE = 340
const FAN_SPAN = END_ANGLE - START_ANGLE

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const angleRad = (angleDeg * Math.PI) / 180

  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  }
}

function describeArcSector(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
) {
  const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle)
  const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle)
  const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle)
  const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle)
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ')
}

export function FanVisualization({ zones, presetId }: FanVisualizationProps) {
  const editorPreset = presetId ? findEditorPreset(presetId) : undefined
  const hasEditorZones = editorPreset && editorPreset.zones.length > 0

  return (
    <div className="w-full shrink-0 px-4 pt-10">
      <svg
        viewBox="0 0 360 220"
        width="100%"
        height="220"
        role="img"
        aria-label={`Quray sensor field with ${hasEditorZones ? editorPreset.zones.length : zones.length} zones`}
        className="block"
      >
        <path
          d={describeArcSector(CX, CY, INNER_R, OUTER_R, START_ANGLE, END_ANGLE)}
          fill="var(--color-bg-elevated)"
          stroke="var(--color-border)"
          strokeWidth="1"
        />

        {hasEditorZones
          ? editorPreset.zones.map((zone) => {
              const [, xMin, yMin, xMax, yMax] = zone.position
              const sa = START_ANGLE + xMin * FAN_SPAN
              const ea = START_ANGLE + xMax * FAN_SPAN
              const ir = INNER_R + yMin * (OUTER_R - INNER_R)
              const or_ = INNER_R + yMax * (OUTER_R - INNER_R)
              return (
                <path
                  key={zone.id}
                  d={describeArcSector(CX, CY, ir, or_, sa, ea)}
                  fill={zone.color}
                  fillOpacity={0.8}
                />
              )
            })
          : zones.map((zone, index) => {
              const count = zones.length
              const span = count > 0 ? FAN_SPAN / count : 0
              const sa = START_ANGLE + index * span
              const ea = sa + span
              return (
                <path
                  key={zone.id}
                  d={describeArcSector(CX, CY, INNER_R, OUTER_R, sa, ea)}
                  fill={zone.color}
                  fillOpacity={0.8}
                />
              )
            })}

        {!hasEditorZones && zones.length > 1 &&
          zones.slice(1).map((zone, index) => {
            const count = zones.length
            const span = FAN_SPAN / count
            const boundaryAngle = START_ANGLE + (index + 1) * span
            const innerPoint = polarToCartesian(CX, CY, INNER_R, boundaryAngle)
            const outerPoint = polarToCartesian(CX, CY, OUTER_R, boundaryAngle)
            return (
              <line
                key={`separator-${zone.id}`}
                x1={innerPoint.x} y1={innerPoint.y}
                x2={outerPoint.x} y2={outerPoint.y}
                stroke="var(--color-bg-base)"
                strokeWidth="1"
              />
            )
          })}
      </svg>
    </div>
  )
}
