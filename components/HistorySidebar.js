'use client'

import { useState } from 'react'

function fmt(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function money(v) {
  if (v == null) return ''
  return `$${Math.round(v).toLocaleString()}`
}

export default function HistorySidebar({ analyses, currentId, onSelect, onNewUpload }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-gray-50 border-r border-gray-200 flex flex-col shadow-xl
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">History</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={onNewUpload}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              + New
            </button>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close history"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {analyses.length === 0 && (
            <p className="px-4 py-6 text-xs text-gray-400 text-center">No past analyses yet.</p>
          )}
          {analyses.map((a) => (
            <button
              key={a.id}
              onClick={() => { onSelect(a); setOpen(false) }}
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

      {/* Toggle tab — always visible on the left edge */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-20 bg-white border border-gray-200 border-l-0 rounded-r-lg shadow-md px-1.5 py-3 flex flex-col items-center gap-1 hover:bg-gray-50 transition-colors"
        aria-label="Toggle history"
      >
        <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-gray-500 font-semibold tracking-widest" style={{ fontSize: '9px', writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
          HISTORY
        </span>
      </button>
    </>
  )
}
