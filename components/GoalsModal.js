'use client'

import { useState, useEffect } from 'react'
import { BENCHMARKS, GOAL_KEYS } from '@/lib/benchmarks'

export default function GoalsModal({ open, onClose, goals, onChange }) {
  const [draft, setDraft] = useState(goals)

  useEffect(() => {
    if (open) setDraft({ ...goals })
  }, [open])  // re-seed draft each time modal opens

  function handleChange(key, raw) {
    const n = parseFloat(raw)
    setDraft((d) => ({ ...d, [key]: isNaN(n) ? d[key] : n }))
  }

  function handleSave() {
    onChange(draft)
    onClose()
  }

  if (!open) return null

  const regularKeys = GOAL_KEYS

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Edit Shop Goals</h2>
          <p className="text-xs text-gray-500 mt-0.5">Set your coaching benchmarks for performance scoring</p>
        </div>

        <div className="px-6 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-4">
            {regularKeys.map((key) => {
              const b = BENCHMARKS[key]
              return (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    {b.label}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="any"
                      value={draft[key] ?? ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-xs text-gray-400 shrink-0">{b.unit}</span>
                  </div>
                </div>
              )
            })}

            {/* Bays field */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Number of Bays
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={draft.bays ?? 5}
                  onChange={(e) => handleChange('bays', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-xs text-gray-400 shrink-0">bays</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Used to scale PMA benchmarks to your shop size</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Save Goals
          </button>
        </div>
      </div>
    </div>
  )
}
