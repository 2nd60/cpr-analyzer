export const BENCHMARKS = {
  gross_profit_margin: {
    label: 'Gross Profit Margin',
    unit: '%',
    goal: 60,
    pmaAvg: 52.3,
    pmaTop10: 57.4,
    gaugeMax: 72,
    format: (v) => `${v.toFixed(1)}%`,
  },
  avg_ticket: {
    label: 'Avg Ticket (ARO)',
    unit: '$',
    goal: 700,
    pmaAvg: 702,
    pmaTop10: 729,
    gaugeMax: 900,
    format: (v) => `$${Math.round(v).toLocaleString()}`,
  },
  hours_per_ro: {
    label: 'Hrs Presented / Vehicle',
    unit: 'hrs',
    goal: 8,
    pmaAvg: 6.5,
    pmaTop10: 9,
    gaugeMax: 12,
    compute: (a) => (a.hours_presented != null && a.total_ros > 0) ? a.hours_presented / a.total_ros : null,
    format: (v) => `${v.toFixed(1)}`,
  },
  effective_labor_rate: {
    label: 'Eff. Labor Rate',
    unit: '$/hr',
    goal: 136,
    pmaAvg: 165,
    pmaTop10: 163,
    gaugeMax: 200,
    format: (v) => `$${Math.round(v)}`,
  },
  labor_profit_pct: {
    label: 'Labor Profit %',
    unit: '%',
    goal: 65,
    pmaAvg: 59.3,
    pmaTop10: 65.9,
    gaugeMax: 80,
    format: (v) => `${v.toFixed(1)}%`,
  },
  parts_profit_pct: {
    label: 'Parts Profit %',
    unit: '%',
    goal: 50,
    pmaAvg: 46.1,
    pmaTop10: 47.8,
    gaugeMax: 62,
    format: (v) => `${v.toFixed(1)}%`,
  },
  gross_profit_per_hour: {
    label: 'GP / Hour',
    unit: '$/hr',
    goal: 150,
    pmaAvg: 171,
    pmaTop10: 200,
    gaugeMax: 250,
    format: (v) => `$${Math.round(v)}`,
  },
  car_count: {
    field: 'total_ros',   // maps to total_ros column in analyses table
    label: 'Monthly Car Count',
    unit: '/mo',
    goal: 100,
    pmaAvg: 264,
    pmaTop10: 275,
    gaugeMax: 350,
    perMonth: true,       // raw value must be divided by period_months before comparing to goal
    format: (v) => Math.round(v).toString(),
  },
}

export const GOAL_KEYS = Object.keys(BENCHMARKS)

export function getDefaultGoals() {
  return Object.fromEntries(GOAL_KEYS.map((k) => [k, BENCHMARKS[k].goal]))
}

export function getNeedleColor(value, goal) {
  if (value == null || goal == null || goal === 0) return '#94a3b8'
  const ratio = value / goal
  if (ratio >= 1.0) return '#22c55e'   // green
  if (ratio >= 0.85) return '#f59e0b'  // amber
  if (ratio >= 0.70) return '#f97316'  // orange
  return '#ef4444'                      // red
}
