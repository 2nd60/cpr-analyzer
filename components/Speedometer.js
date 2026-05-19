'use client'

import { useEffect, useState } from 'react'
import { getNeedleColor } from '@/lib/benchmarks'

// SVG half-circle gauge: left=min, right=max, sweeps via top
// cx=110, cy=115, r=90, strokeWidth=24

const CX = 110
const CY = 115
const R = 90
const SW = 24

function polarToCartesian(cx, cy, r, normalizedV) {
  const angle = Math.PI * (1 - normalizedV)
  return {
    x: cx + r * Math.cos(angle),
    y: cy - r * Math.sin(angle),
  }
}

function arcPath(cx, cy, r, v1, v2) {
  if (Math.abs(v2 - v1) < 0.0001) return ''
  const p1 = polarToCartesian(cx, cy, r, v1)
  const p2 = polarToCartesian(cx, cy, r, v2)
  const largeArc = Math.abs(v2 - v1) > 0.5 ? 1 : 0
  return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v))
}

export default function Speedometer({ value, goal, pmaAvg, pmaTop10, gaugeMax, label, format }) {
  // Leave 15% headroom above the highest benchmark; never shrink below gaugeMax
  const safeMax = Math.max(gaugeMax, pmaTop10 * 1.15)
  const norm = (v) => clamp((v ?? 0) / safeMax, 0, 1)

  const vGoal = norm(goal)
  const vAvg = norm(pmaAvg)
  const vTop = norm(pmaTop10)
  const vVal = norm(value ?? 0)

  const [animV, setAnimV] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setAnimV(vVal), 200)
    return () => clearTimeout(t)
  }, [vVal])

  // Color zone boundaries
  const vRed = 0
  const vOrange = norm(goal * 0.70)
  const vAmber = norm(goal * 0.85)
  const vGreen = vGoal

  const needleColor = getNeedleColor(value, goal)

  // Needle rotation: 0 normalized → -180deg from right, 1 → 0deg
  const needleRotateDeg = -(1 - animV) * 180

  const tipPt = polarToCartesian(CX, CY, R - 2, animV)

  const formatVal = format ? format(value ?? 0) : String(Math.round(value ?? 0))

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 text-center">
        {label}
      </p>

      <svg viewBox="0 0 220 130" className="w-full max-w-[220px]">
        {/* Background arc */}
        <path
          d={arcPath(CX, CY, R, 0, 1)}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={SW}
          strokeLinecap="butt"
        />

        {/* Red zone */}
        {vOrange > vRed && (
          <path d={arcPath(CX, CY, R, vRed, vOrange)} fill="none" stroke="#fca5a5" strokeWidth={SW} strokeLinecap="butt" />
        )}
        {/* Orange zone */}
        {vAmber > vOrange && (
          <path d={arcPath(CX, CY, R, vOrange, vAmber)} fill="none" stroke="#fdba74" strokeWidth={SW} strokeLinecap="butt" />
        )}
        {/* Amber zone */}
        {vGreen > vAmber && (
          <path d={arcPath(CX, CY, R, vAmber, vGreen)} fill="none" stroke="#fcd34d" strokeWidth={SW} strokeLinecap="butt" />
        )}
        {/* Green zone (goal to max) */}
        {1 > vGreen && (
          <path d={arcPath(CX, CY, R, vGreen, 1)} fill="none" stroke="#86efac" strokeWidth={SW} strokeLinecap="butt" />
        )}

        {/* Benchmark tick lines */}
        <BenchmarkTick cx={CX} cy={CY} v={vGoal} color="#1e293b" r={R} sw={SW} />
        <BenchmarkTick cx={CX} cy={CY} v={vAvg} color="#f59e0b" r={R} sw={SW} />
        <BenchmarkTick cx={CX} cy={CY} v={vTop} color="#06b6d4" r={R} sw={SW} />

        {/* Needle */}
        <g
          style={{
            transform: `rotate(${needleRotateDeg}deg)`,
            transformOrigin: `${CX}px ${CY}px`,
            transition: 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <line
            x1={CX}
            y1={CY}
            x2={CX + R - 8}
            y2={CY}
            stroke={needleColor}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </g>

        {/* Hub */}
        <circle cx={CX} cy={CY} r={5} fill={needleColor} />
        <circle cx={CX} cy={CY} r={2.5} fill="white" />

        {/* Value text */}
        <text
          x={CX}
          y={CY + 18}
          textAnchor="middle"
          className="font-bold"
          style={{ fontFamily: 'var(--font-geist-sans, sans-serif)', fontWeight: 700, fontSize: 18, fill: needleColor }}
        >
          {value != null ? formatVal : '—'}
        </text>
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-1 flex-wrap">
        <LegendDot color="#1e293b" label={`Goal: ${format ? format(goal) : goal}`} />
        <LegendDot color="#f59e0b" label={`Avg: ${format ? format(pmaAvg) : pmaAvg}`} />
        <LegendDot color="#06b6d4" label={`Top: ${format ? format(pmaTop10) : pmaTop10}`} />
      </div>
    </div>
  )
}

function BenchmarkTick({ cx, cy, v, color, r, sw }) {
  const inner = r - sw / 2 - 2
  const outer = r + sw / 2 + 6
  const p1 = polarToCartesian(cx, cy, inner, v)
  const p2 = polarToCartesian(cx, cy, outer, v)
  return (
    <line
      x1={p1.x.toFixed(2)} y1={p1.y.toFixed(2)}
      x2={p2.x.toFixed(2)} y2={p2.y.toFixed(2)}
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
    />
  )
}

function LegendDot({ color, label }) {
  return (
    <span className="flex items-center gap-1 text-xs text-gray-500">
      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
      {label}
    </span>
  )
}
