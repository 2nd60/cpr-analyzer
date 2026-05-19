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
    <div className="bg-gray-900 text-white">
      <div className="max-w-screen-xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-xs font-bold tracking-widest uppercase text-gray-400 shrink-0">
            Shop Goals
          </span>

          <div className="flex items-center gap-3 flex-wrap flex-1">
            {GOAL_KEYS.map((key) => {
              const b = BENCHMARKS[key]
              return (
                <div key={key} className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-400 hidden md:block">{b.label}:</span>
                  {editing ? (
                    <input
                      type="number"
                      step="any"
                      value={draft[key] ?? ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="w-20 px-2 py-0.5 rounded text-xs bg-gray-800 border border-gray-600 text-white focus:outline-none focus:border-blue-400"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-white">
                      {b.format(goals[key] ?? b.goal)}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-md transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="text-xs text-gray-400 hover:text-white px-2 py-1 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={openEdit}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Goals
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
