import type { PresetZone } from '@/types'

type FanVisualizationProps = {
  zones: PresetZone[]
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

export function FanVisualization({ zones }: FanVisualizationProps) {
  const zoneCount = zones.length
  const sectorSpan = zoneCount > 0 ? FAN_SPAN / zoneCount : 0

  return (
    <div className="w-full shrink-0 px-4 pt-10">
      <svg
        viewBox="0 0 360 220"
        width="100%"
        height="220"
        role="img"
        aria-label={`Quray sensor field with ${zoneCount} zones`}
        className="block"
      >
        <path
          d={describeArcSector(CX, CY, INNER_R, OUTER_R, START_ANGLE, END_ANGLE)}
          fill="var(--color-bg-elevated)"
          stroke="var(--color-border)"
          strokeWidth="1"
        />

        {zones.map((zone, index) => {
          const startAngle = START_ANGLE + index * sectorSpan
          const endAngle = startAngle + sectorSpan

          return (
            <path
              key={zone.id}
              d={describeArcSector(CX, CY, INNER_R, OUTER_R, startAngle, endAngle)}
              fill={zone.color}
              fillOpacity={0.8}
            />
          )
        })}

        {zones.length > 1 &&
          zones.slice(1).map((zone, index) => {
            const boundaryAngle = START_ANGLE + (index + 1) * sectorSpan
            const innerPoint = polarToCartesian(CX, CY, INNER_R, boundaryAngle)
            const outerPoint = polarToCartesian(CX, CY, OUTER_R, boundaryAngle)

            return (
              <line
                key={`separator-${zone.id}`}
                x1={innerPoint.x}
                y1={innerPoint.y}
                x2={outerPoint.x}
                y2={outerPoint.y}
                stroke="var(--color-bg-base)"
                strokeWidth="1"
              />
            )
          })}
      </svg>
    </div>
  )
}
