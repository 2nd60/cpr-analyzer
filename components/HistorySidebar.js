'use client'

function fmt(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function money(v) {
  if (v == null) return ''
  return `$${Math.round(v).toLocaleString()}`
}

export default function HistorySidebar({ analyses, currentId, onSelect, onNewUpload }) {
  return (
    <aside className="w-64 shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">History</h2>
        <button
          onClick={onNewUpload}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          + New
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {analyses.length === 0 && (
          <p className="px-4 py-6 text-xs text-gray-400 text-center">No past analyses yet.</p>
        )}
        {analyses.map((a) => (
          <button
            key={a.id}
            onClick={() => onSelect(a)}
            className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-white transition-colors ${
              a.id === currentId ? 'bg-white border-l-2 border-l-blue-500' : ''
            }`}
          >
            <p className="text-sm font-semibold text-gray-800 truncate">
              {a.shop_name || 'Unknown Shop'}
            </p>
            {a.period && (
              <p className="text-xs text-gray-500 mt-0.5">{a.period}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              {a.gross_sales != null && (
                <span className="text-xs text-gray-400">{money(a.gross_sales)}</span>
              )}
              {a.gross_profit_margin != null && (
                <span className="text-xs text-gray-400">{a.gross_profit_margin.toFixed(1)}% GP</span>
              )}
            </div>
            <p className="text-xs text-gray-300 mt-0.5">{fmt(a.created_at)}</p>
          </button>
        ))}
      </div>
    </aside>
  )
}
