'use client'

import { useState } from 'react'
import { BENCHMARKS, GOAL_KEYS } from '@/lib/benchmarks'

export default function GoalsBar({ goals, onChange }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(goals)

  function openEdit() {
    setDraft({ ...goals })
    setEditing(true)
  }

  function handleSave() {
    onChange(draft)
    setEditing(false)
  }

  function handleChange(key, raw) {
    const n = parseFloat(raw)
    setDraft((d) => ({ ...d, [key]: isNaN(n) ? d[key] : n }))
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700">Shop Goals</span>
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="text-sm text-gray-400 hover:text-gray-600 px-3 py-1.5 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={openEdit}
                className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Goals
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {GOAL_KEYS.map((key) => {
            const b = BENCHMARKS[key]
            return (
              <div key={key} className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5">
                <p className="text-xs font-medium text-gray-500 mb-1">{b.label}</p>
                {editing ? (
                  <input
                    type="number"
                    step="any"
                    value={draft[key] ?? ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="w-full px-2 py-1 rounded-lg text-sm bg-white border border-gray-200 text-gray-900 focus:outline-none focus:border-blue-400"
                  />
                ) : (
                  <p className="text-sm font-bold text-gray-900">{b.format(goals[key] ?? b.goal)}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
