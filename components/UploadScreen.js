'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import GoalsBar from './GoalsBar'

const SOFTWARES = [
  { name: 'Tekmetric', report: 'End of Day Report' },
  { name: 'Mitchell1', report: 'Business Summary Report' },
  { name: 'Shop-Ware', report: 'Performance Report' },
  { name: 'RO Writer', report: 'Summary Report' },
  { name: 'Protractor', report: 'ProSummary Report' },
]

const ACCEPTED = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']

export default function UploadScreen({
  goals,
  onGoalsChange,
  onFileUpload,
  uploading,
  error,
  analyses,
  onSelectAnalysis,
}) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const handleFile = useCallback(
    (file) => {
      if (!file) return
      if (!ACCEPTED.includes(file.type)) {
        alert('Please upload a PDF, PNG, or JPG file.')
        return
      }
      onFileUpload(file)
    },
    [onFileUpload]
  )

  function onDragOver(e) {
    e.preventDefault()
    setDragging(true)
  }
  function onDragLeave(e) {
    e.preventDefault()
    setDragging(false)
  }
  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    handleFile(file)
  }
  function onInputChange(e) {
    handleFile(e.target.files?.[0])
    e.target.value = ''
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      <GoalsBar goals={goals} onChange={onGoalsChange} />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        {/* Logo */}
        <Image
          src="https://maverickshopowners.s3.us-east-1.amazonaws.com/CPR_logo_transparent_full.png"
          alt="CPR Analyzer"
          width={220}
          height={88}
          priority
          className="object-contain mb-6"
          unoptimized
        />

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
          Upload. Analyze. Move Forward with Confidence.
        </h1>
        <p className="text-gray-500 text-sm text-center mb-8 max-w-md">
          Drop your shop management report below and get instant performance insights compared to PMA benchmarks.
        </p>

        {/* Drop zone */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`w-full max-w-lg border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all select-none ${
            dragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-white'
          } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
            onChange={onInputChange}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-gray-600">Analyzing your report…</p>
            </div>
          ) : (
            <>
              <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                {dragging ? 'Drop your report here' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-xs text-gray-400">PDF, PNG, or JPG accepted</p>
            </>
          )}
        </div>

        {error && (
          <div className="mt-4 w-full max-w-lg p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Supported software */}
        <div className="mt-8 w-full max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 text-center">
            Supported Software
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SOFTWARES.map((s) => (
              <div key={s.name} className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                <span className="text-sm font-medium text-gray-700">{s.name}</span>
                <span className="text-xs text-gray-400 ml-auto truncate">{s.report}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Past analyses preview */}
        {analyses.length > 0 && (
          <div className="mt-10 w-full max-w-lg">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Recent Analyses
            </p>
            <div className="space-y-2">
              {analyses.slice(0, 5).map((a) => (
                <button
                  key={a.id}
                  onClick={() => onSelectAnalysis(a)}
                  className="w-full text-left bg-white border border-gray-100 rounded-xl px-4 py-3 hover:border-gray-300 hover:shadow-sm transition-all flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{a.shop_name || 'Unnamed Report'}</p>
                    {a.period && <p className="text-xs text-gray-400">{a.period}</p>}
                  </div>
                  <div className="text-right">
                    {a.gross_profit_margin != null && (
                      <p className="text-sm font-bold text-gray-700">{a.gross_profit_margin.toFixed(1)}% GP</p>
                    )}
                    <p className="text-xs text-gray-300">
                      {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
