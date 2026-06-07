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

export default function HistorySidebar({ analyses, currentId, onSelect, onNewUpload, onDelete }) {
  const [open, setOpen] = useState(false)
  const [confirmId, setConfirmId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(e, id) {
    e.stopPropagation()
    if (confirmId !== id) {
      setConfirmId(id)
      return
    }
    setDeleting(true)
    await onDelete(id)
    setConfirmId(null)
    setDeleting(false)
  }

  function cancelConfirm(e) {
    e.stopPropagation()
    setConfirmId(null)
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/30"
          onClick={() => { setOpen(false); setConfirmId(null) }}
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
              onClick={() => { setOpen(false); setConfirmId(null) }}
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
            <div
              key={a.id}
              className={`group relative border-b border-gray-100 ${
                a.id === currentId ? 'bg-white border-l-2 border-l-blue-500' : 'hover:bg-white'
              } transition-colors`}
            >
              <button
                onClick={() => { onSelect(a); setOpen(false); setConfirmId(null) }}
                className="w-full text-left px-4 py-3 pr-10"
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

              {/* Delete controls */}
              {confirmId === a.id ? (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    onClick={(e) => handleDelete(e, a.id)}
                    disabled={deleting}
                    className="text-xs bg-red-600 hover:bg-red-500 text-white px-2 py-0.5 rounded font-medium transition-colors"
                  >
                    {deleting ? '…' : 'Delete'}
                  </button>
                  <button
                    onClick={cancelConfirm}
                    className="text-xs text-gray-400 hover:text-gray-600 px-1 py-0.5"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => handleDelete(e, a.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all p-1"
                  aria-label="Delete"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Toggle tab */}
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
