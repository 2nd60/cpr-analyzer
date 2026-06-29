function num(v) {
  if (v == null) return null
  if (typeof v === 'number') return v
  const n = parseFloat(String(v).replace(/[$,%\s]/g, '').replace(/,/g, ''))
  return isNaN(n) ? null : n
}

function str(v) {
  return v != null ? String(v).trim() : null
}

// Each key maps to possible field names the worker might return
const ALIASES = {
  shop_name: ['shop_name', 'shopName', 'shop', 'company', 'companyName', 'business_name'],
  period: ['period', 'report_period', 'reportPeriod', 'date_range', 'dateRange', 'month', 'date'],
  period_months: ['period_months', 'periodMonths', 'months', 'num_months'],
  gross_sales: ['gross_sales', 'grossSales', 'total_sales', 'totalSales', 'sales', 'revenue', 'total_revenue'],
  gross_profit: ['gross_profit', 'grossProfit', 'total_gross_profit', 'gp'],
  gross_profit_margin: ['gross_profit_margin', 'grossProfitMargin', 'gp_margin', 'gpMargin', 'gp_pct', 'gross_margin'],
  avg_ticket: ['avg_ticket', 'avgTicket', 'average_ticket', 'averageTicket', 'avg_ro', 'avgRo'],
  total_ros: ['total_ros', 'totalRos', 'ro_count', 'roCount', 'total_repair_orders', 'repair_orders', 'ros'],
  close_ratio: ['close_ratio', 'closeRatio', 'close_rate', 'closeRate', 'closing_ratio'],
  effective_labor_rate: ['effective_labor_rate', 'effectiveLaborRate', 'elr', 'effective_rate', 'labor_rate'],
  labor_sales: ['labor_sales', 'laborSales', 'total_labor', 'labor_revenue'],
  labor_profit: ['labor_profit', 'laborProfit', 'labor_gross_profit'],
  labor_profit_pct: ['labor_profit_pct', 'laborProfitPct', 'labor_margin', 'laborMargin', 'labor_gp_pct'],
  parts_sales: ['parts_sales', 'partsSales', 'total_parts', 'parts_revenue'],
  parts_profit: ['parts_profit', 'partsProfit', 'parts_gross_profit'],
  parts_profit_pct: ['parts_profit_pct', 'partsProfitPct', 'parts_margin', 'partsMargin', 'parts_gp_pct'],
  hours_presented: ['hours_presented', 'hoursPresented', 'hrs_presented'],
  hours_sold: ['hours_sold', 'hoursSold', 'hrs_sold'],
  gross_profit_per_hour: ['gross_profit_per_hour', 'grossProfitPerHour', 'gp_per_hour', 'gpPerHour', 'gp_hour'],
  total_discounts: ['total_discounts', 'totalDiscounts', 'discounts', 'discount_total'],
  total_fees: ['total_fees', 'totalFees', 'fees', 'fee_total', 'shop_fees'],
}

function find(raw, aliases) {
  const lowerRaw = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k.toLowerCase().replace(/\s+/g, '_'), v]))
  for (const alias of aliases) {
    const key = alias.toLowerCase().replace(/\s+/g, '_')
    if (lowerRaw[key] != null) return lowerRaw[key]
  }
  return null
}

// Extract the start date from a freeform period string.
// Returns a Date or null.
export function parsePeriodDate(period) {
  if (!period) return null
  const s = String(period)

  // "01/01/2024 To: 12/31/2024" — grab the first MM/DD/YYYY
  const mdyMatch = s.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (mdyMatch) {
    return new Date(`${mdyMatch[3]}-${mdyMatch[1].padStart(2, '0')}-${mdyMatch[2].padStart(2, '0')}`)
  }

  // "2024-01" or "2024-01-15"
  const isoMatch = s.match(/(\d{4})-(\d{2})(?:-(\d{2}))?/)
  if (isoMatch) {
    return new Date(`${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3] ?? '01'}`)
  }

  // "January 2024" / "Jan 2024"
  const monthNameMatch = s.match(/([A-Za-z]+)\s+(\d{4})/)
  if (monthNameMatch) {
    const d = new Date(`${monthNameMatch[1]} 1, ${monthNameMatch[2]}`)
    if (!isNaN(d)) return d
  }

  return null
}

export function parseAnalysis(raw) {
  if (!raw || typeof raw !== 'object') return {}
  const result = {}

  for (const [field, aliases] of Object.entries(ALIASES)) {
    const val = find(raw, aliases)
    if (val == null) continue
    if (field === 'shop_name' || field === 'period') {
      result[field] = str(val)
    } else if (field === 'total_ros') {
      const n = num(val)
      result[field] = n != null ? Math.round(n) : null
    } else if (field === 'period_months') {
      result[field] = num(val)
    } else {
      result[field] = num(val)
    }
  }

  // Derive gross_profit_margin if missing but gross_profit + gross_sales present
  if (result.gross_profit_margin == null && result.gross_profit != null && result.gross_sales) {
    result.gross_profit_margin = (result.gross_profit / result.gross_sales) * 100
  }

  // Derive gross_profit if missing
  if (result.gross_profit == null && result.gross_profit_margin != null && result.gross_sales) {
    result.gross_profit = (result.gross_profit_margin / 100) * result.gross_sales
  }

  // Derive avg_ticket if missing
  if (result.avg_ticket == null && result.gross_sales != null && result.total_ros) {
    result.avg_ticket = result.gross_sales / result.total_ros
  }

  // Derive gp_per_hour if missing
  if (result.gross_profit_per_hour == null && result.gross_profit != null && result.hours_sold) {
    result.gross_profit_per_hour = result.gross_profit / result.hours_sold
  }

  // Derive effective_labor_rate if missing
  if (result.effective_labor_rate == null && result.labor_sales != null && result.hours_sold) {
    result.effective_labor_rate = result.labor_sales / result.hours_sold
  }

  return result
}
