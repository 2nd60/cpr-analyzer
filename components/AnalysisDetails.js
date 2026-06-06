'use client'

import { BENCHMARKS } from '@/lib/benchmarks'

// ─── Score helpers ────────────────────────────────────────────────────────────

const SCORE_METRICS = [
  { key: 'gross_profit_margin', label: 'GP Margin',    maxPts: 25 },
  { key: 'close_ratio',         label: 'Close Ratio',  maxPts: 20 },
  { key: 'effective_labor_rate',label: 'ELR',          maxPts: 20 },
  { key: 'labor_profit_pct',    label: 'Labor Profit', maxPts: 20 },
  { key: 'parts_profit_pct',    label: 'Parts Profit', maxPts: 15 },
]

function calcScore(a, goals) {
  let earned = 0
  let possible = 0
  const rows = SCORE_METRICS.map(({ key, label, maxPts }) => {
    const goal  = goals[key] ?? BENCHMARKS[key].goal
    const value = a[key]
    if (value == null) {
      return { label, maxPts, value, goal, earned: null, skipped: true }
    }
    const pts = Math.min(1, value / goal) * maxPts
    earned += pts
    possible += maxPts
    return { label, maxPts, value, goal, earned: pts, skipped: false }
  })
  // Pro-rate to 100 based only on available metrics
  const score = possible > 0 ? Math.round((earned / possible) * 100) : 0
  return { score, rows }
}

function letterGrade(score) {
  if (score >= 97) return 'A+'
  if (score >= 93) return 'A'
  if (score >= 90) return 'A-'
  if (score >= 87) return 'B+'
  if (score >= 83) return 'B'
  if (score >= 80) return 'B-'
  if (score >= 77) return 'C+'
  if (score >= 73) return 'C'
  if (score >= 70) return 'C-'
  if (score >= 67) return 'D+'
  return 'D'
}

function gradeColor(grade) {
  if (grade.startsWith('A')) return { text: 'text-green-600',  ring: 'ring-green-200',  bg: 'bg-green-50'  }
  if (grade.startsWith('B')) return { text: 'text-blue-600',   ring: 'ring-blue-200',   bg: 'bg-blue-50'   }
  if (grade.startsWith('C')) return { text: 'text-amber-500',  ring: 'ring-amber-200',  bg: 'bg-amber-50'  }
  return                             { text: 'text-red-500',    ring: 'ring-red-200',    bg: 'bg-red-50'    }
}

function industryBadge(gpMargin) {
  if (gpMargin == null) return null
  const { pmaAvg, pmaTop10 } = BENCHMARKS.gross_profit_margin
  if (gpMargin >= pmaTop10) return { label: 'Top 10% Industry',   cls: 'bg-cyan-50 text-cyan-700 border-cyan-200'  }
  if (gpMargin >= pmaAvg)   return { label: 'Above Industry Avg', cls: 'bg-green-50 text-green-700 border-green-200' }
  return                           { label: 'Below Industry Avg', cls: 'bg-amber-50 text-amber-700 border-amber-200' }
}

// ─── Flag helpers ─────────────────────────────────────────────────────────────

function getFlags(a) {
  const flags = []

  if (a.gross_profit_margin != null && a.gross_profit_margin < 50)
    flags.push({ level: 'critical', msg: `GP Margin at ${a.gross_profit_margin.toFixed(1)}% — below 50% threshold` })
  if (a.close_ratio != null && a.close_ratio < 40)
    flags.push({ level: 'critical', msg: `Close Ratio at ${a.close_ratio.toFixed(1)}% — below 40% threshold` })
  if (a.effective_labor_rate != null && a.effective_labor_rate < 120)
    flags.push({ level: 'warning', msg: `ELR at $${Math.round(a.effective_labor_rate)} — below $120 target` })
  if (a.labor_profit_pct != null && a.labor_profit_pct < 55)
    flags.push({ level: 'warning', msg: `Labor Profit at ${a.labor_profit_pct.toFixed(1)}% — below 55%` })
  if (a.parts_profit_pct != null && a.parts_profit_pct < 40)
    flags.push({ level: 'warning', msg: `Parts Profit at ${a.parts_profit_pct.toFixed(1)}% — below 40%` })
  if (a.total_discounts != null && a.gross_sales > 0) {
    const discPct = (a.total_discounts / a.gross_sales) * 100
    if (discPct > 4)
      flags.push({ level: 'warning', msg: `Discounts at ${discPct.toFixed(1)}% of gross sales — above 4% threshold` })
  }
  return flags
}

// ─── Shared card shell ────────────────────────────────────────────────────────

function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${className}`}>
      {title && (
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">{title}</h3>
      )}
      {children}
    </div>
  )
}

// ─── 1. Performance Score ─────────────────────────────────────────────────────

function PerformanceScore({ analysis, goals }) {
  const { score, rows } = calcScore(analysis, goals)
  const grade = letterGrade(score)
  const colors = gradeColor(grade)
  const badge = industryBadge(analysis.gross_profit_margin)

  return (
    <Card title="Performance Score">
      <div className="flex items-center gap-4 mb-5">
        <div className={`w-20 h-20 rounded-full ring-4 ${colors.ring} ${colors.bg} flex flex-col items-center justify-center shrink-0`}>
          <span className={`text-3xl font-black leading-none ${colors.text}`}>{grade}</span>
          <span className="text-xs text-gray-400 mt-0.5">{score}/100</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700">Overall Score</p>
          <p className="text-2xl font-black text-gray-900">{score} <span className="text-base font-normal text-gray-400">/ 100</span></p>
          {badge && (
            <span className={`mt-1 inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${badge.cls}`}>
              {badge.label}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {rows.map(({ label, maxPts, earned, skipped }) => {
          if (skipped) {
            return (
              <div key={label}>
                <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                  <span>{label}</span>
                  <span className="italic">N/A — not in report</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full" />
              </div>
            )
          }
          const pct = maxPts > 0 ? (earned / maxPts) * 100 : 0
          const barColor = pct >= 100 ? 'bg-green-400' : pct >= 85 ? 'bg-amber-400' : pct >= 70 ? 'bg-orange-400' : 'bg-red-400'
          return (
            <div key={label}>
              <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                <span>{label}</span>
                <span className="font-medium text-gray-700">{Math.round(earned)}/{maxPts} pts</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ─── 2. Coaching Flags ────────────────────────────────────────────────────────

function CoachingFlags({ analysis }) {
  const flags = getFlags(analysis)
  const criticals = flags.filter((f) => f.level === 'critical')
  const warnings  = flags.filter((f) => f.level === 'warning')

  return (
    <Card title="Coaching Flags">
      {flags.length === 0 ? (
        <div className="flex items-center gap-2 text-green-600">
          <span className="text-xl">✅</span>
          <span className="font-semibold text-sm">No Red Flags — looking strong!</span>
        </div>
      ) : (
        <div className="space-y-2">
          {criticals.map((f, i) => (
            <div key={i} className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              <span className="text-base leading-snug">🔴</span>
              <div>
                <span className="text-xs font-bold text-red-700 uppercase tracking-wide">Critical — </span>
                <span className="text-xs text-red-700">{f.msg}</span>
              </div>
            </div>
          ))}
          {warnings.map((f, i) => (
            <div key={i} className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
              <span className="text-base leading-snug">🟡</span>
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Warning — </span>
                <span className="text-xs text-amber-700">{f.msg}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

// ─── 3. Money Left on the Table ───────────────────────────────────────────────

const INDUSTRY_DISC_AVG = 2.2 // percent

function MoneyLeftOnTable({ analysis }) {
  const { total_discounts: discounts, gross_sales } = analysis
  if (discounts == null || !gross_sales) {
    return (
      <Card title="Money Left on the Table">
        <p className="text-xs text-gray-400">Discount data not available in this report.</p>
      </Card>
    )
  }

  const discPct   = (discounts / gross_sales) * 100
  const delta     = discPct - INDUSTRY_DISC_AVG
  const excess    = Math.max(0, (delta / 100) * gross_sales)
  const isAbove   = delta > 0

  return (
    <Card title="Money Left on the Table">
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-3xl font-black text-gray-900">${Math.round(discounts).toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total discounts given</p>
        </div>
        <div className="text-right">
          <p className={`text-xl font-bold ${isAbove ? 'text-red-500' : 'text-green-500'}`}>
            {discPct.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-400">of gross sales</p>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between py-1.5 border-b border-gray-50">
          <span className="text-gray-500">Your discount rate</span>
          <span className="font-semibold text-gray-800">{discPct.toFixed(2)}%</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-gray-50">
          <span className="text-gray-500">Industry avg discount rate</span>
          <span className="font-semibold text-gray-800">{INDUSTRY_DISC_AVG}%</span>
        </div>
        <div className="flex justify-between py-1.5">
          <span className={`font-semibold ${isAbove ? 'text-red-600' : 'text-green-600'}`}>
            {isAbove ? `Excess discounting (${delta.toFixed(1)}% above avg)` : `Below avg discounting — great!`}
          </span>
          {isAbove && (
            <span className="font-bold text-red-600">−${Math.round(excess).toLocaleString()}</span>
          )}
        </div>
      </div>
    </Card>
  )
}

// ─── 4. Labor vs Parts Split ──────────────────────────────────────────────────

function LaborPartsSplit({ analysis }) {
  const { labor_sales, parts_sales } = analysis
  if (labor_sales == null && parts_sales == null) {
    return (
      <Card title="Labor vs Parts Split">
        <p className="text-xs text-gray-400">Labor/parts sales data not available in this report.</p>
      </Card>
    )
  }

  const lv = labor_sales ?? 0
  const pv = parts_sales ?? 0
  const total = lv + pv
  if (total === 0) return null

  const laborPct = (lv / total) * 100
  const partsPct = (pv / total) * 100

  const laborHealthy = laborPct >= 55 && laborPct <= 60
  const partsHealthy = partsPct >= 40 && partsPct <= 45

  return (
    <Card title="Labor vs Parts Split">
      <div className="mb-3">
        <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1.5">
          <span>Labor {laborPct.toFixed(1)}%</span>
          <span>Parts {partsPct.toFixed(1)}%</span>
        </div>
        <div className="flex h-6 rounded-full overflow-hidden">
          <div
            className="bg-blue-500 flex items-center justify-center text-white text-xs font-bold transition-all duration-700"
            style={{ width: `${laborPct}%` }}
          >
            {laborPct >= 20 && `${laborPct.toFixed(0)}%`}
          </div>
          <div
            className="bg-emerald-400 flex items-center justify-center text-white text-xs font-bold transition-all duration-700"
            style={{ width: `${partsPct}%` }}
          >
            {partsPct >= 20 && `${partsPct.toFixed(0)}%`}
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>${Math.round(lv).toLocaleString()}</span>
          <span>${Math.round(pv).toLocaleString()}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Chip ok={laborHealthy} label="Labor" target="55–60%" />
        <Chip ok={partsHealthy} label="Parts"  target="40–45%" />
      </div>
      <p className="text-xs text-gray-400 mt-2">Healthy target: 55–60% labor / 40–45% parts of combined revenue</p>
    </Card>
  )
}

function Chip({ ok, label, target }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium
      ${ok ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
      {ok ? '✓' : '!'} {label}: {target}
    </span>
  )
}

// ─── 5. Detail panels ─────────────────────────────────────────────────────────

function BenchmarkRow({ label, value, avg, top, format }) {
  const fmt = format ?? ((v) => v != null ? String(Math.round(v)) : '—')
  return (
    <tr className="border-b border-gray-50 last:border-0">
      <td className="py-2 text-xs text-gray-600 pr-3 font-medium">{label}</td>
      <td className="py-2 text-xs font-bold text-gray-900 text-right pr-3">
        {value != null ? fmt(value) : <span className="text-gray-300">—</span>}
      </td>
      {avg != null && (
        <td className="py-2 text-xs text-amber-600 text-right pr-3">{fmt(avg)}</td>
      )}
      {top != null && (
        <td className="py-2 text-xs text-cyan-600 text-right">{fmt(top)}</td>
      )}
    </tr>
  )
}

function DetailTable({ rows, hasAvg = true }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-100">
          <th className="pb-1.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wide">Metric</th>
          <th className="pb-1.5 text-right text-xs font-bold text-gray-400 uppercase tracking-wide pr-3">You</th>
          {hasAvg && <th className="pb-1.5 text-right text-xs font-bold text-amber-400 uppercase tracking-wide pr-3">PMA Avg</th>}
          {hasAvg && <th className="pb-1.5 text-right text-xs font-bold text-cyan-500 uppercase tracking-wide">Top 10%</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <BenchmarkRow key={r.label} {...r} />
        ))}
      </tbody>
    </table>
  )
}

function LaborPanel({ a }) {
  const fmtMoney = (v) => v != null ? `$${Math.round(v).toLocaleString()}` : '—'
  const fmtPct   = (v) => v != null ? `${v.toFixed(1)}%` : '—'
  const fmtELR   = (v) => v != null ? `$${Math.round(v)}` : '—'

  return (
    <Card title="Labor Performance">
      <DetailTable rows={[
        { label: 'Sales',         value: a.labor_sales,         format: fmtMoney },
        { label: 'Gross Profit',  value: a.labor_profit,        format: fmtMoney },
        { label: 'Profit %',      value: a.labor_profit_pct,    avg: 59.3,  top: 65.9,  format: fmtPct   },
        { label: 'ELR',           value: a.effective_labor_rate, avg: 165,   top: 163,   format: fmtELR   },
        { label: 'Hours Sold',    value: a.hours_sold,           format: (v) => Math.round(v) },
        { label: 'Hours Presented', value: a.hours_presented,   format: (v) => Math.round(v) },
      ]} />
    </Card>
  )
}

function PartsPanel({ a }) {
  const fmtMoney = (v) => v != null ? `$${Math.round(v).toLocaleString()}` : '—'
  const fmtPct   = (v) => v != null ? `${v.toFixed(1)}%` : '—'

  return (
    <Card title="Parts Performance">
      <DetailTable rows={[
        { label: 'Sales',        value: a.parts_sales,     format: fmtMoney },
        { label: 'Gross Profit', value: a.parts_profit,    format: fmtMoney },
        { label: 'Profit %',     value: a.parts_profit_pct, avg: 46.1, top: 47.8, format: fmtPct },
        { label: 'Fees Collected', value: a.total_fees,    format: fmtMoney },
      ]} />
    </Card>
  )
}

function ShopSummaryPanel({ a }) {
  const fmtMoney = (v) => v != null ? `$${Math.round(v).toLocaleString()}` : '—'
  const fmtPct   = (v) => v != null ? `${v.toFixed(1)}%` : '—'
  const months   = a.period_months || 1

  return (
    <Card title="Shop Summary">
      <DetailTable rows={[
        { label: 'Car Count',    value: a.total_ros,              avg: Math.round(264 * months),   top: Math.round(275 * months),   format: (v) => Math.round(v).toString() },
        { label: 'Avg Ticket',   value: a.avg_ticket,             avg: 702,   top: 729,   format: fmtMoney },
        { label: 'GP / Hour',    value: a.gross_profit_per_hour,  avg: 171,   top: 200,   format: fmtMoney },
        { label: 'GP Margin',    value: a.gross_profit_margin,    avg: 52.3,  top: 57.4,  format: fmtPct  },
        { label: 'Close Ratio',  value: a.close_ratio,            avg: 47.6,  top: 59.3,  format: fmtPct  },
      ]} />
    </Card>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function AnalysisDetails({ analysis, goals }) {
  const a = analysis

  return (
    <div className="space-y-6 mt-6">
      {/* Row 1: Score + Flags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PerformanceScore analysis={a} goals={goals} />
        <CoachingFlags analysis={a} />
      </div>

      {/* Row 2: Money Left + Labor/Parts Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MoneyLeftOnTable analysis={a} />
        <LaborPartsSplit analysis={a} />
      </div>

      {/* Row 3: Detail panels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <LaborPanel a={a} />
        <PartsPanel a={a} />
        <ShopSummaryPanel a={a} />
      </div>
    </div>
  )
}
