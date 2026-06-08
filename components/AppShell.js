'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Navbar from './Navbar'
import UploadScreen from './UploadScreen'
import Dashboard from './Dashboard'
import { getDefaultGoals } from '@/lib/benchmarks'
import { parseAnalysis } from '@/lib/parseAnalysis'

function loadGoalsFallback() {
  if (typeof window === 'undefined') return getDefaultGoals()
  try {
    const raw = localStorage.getItem('cpr-goals')
    return raw ? { ...getDefaultGoals(), ...JSON.parse(raw) } : getDefaultGoals()
  } catch {
    return getDefaultGoals()
  }
}

export default function AppShell({ user, initialAnalyses, initialGoals }) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const [analyses, setAnalyses] = useState(initialAnalyses)
  const [currentAnalysis, setCurrentAnalysis] = useState(null)
  const [goals, setGoals] = useState(() =>
    initialGoals ? { ...getDefaultGoals(), ...initialGoals } : loadGoalsFallback()
  )
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  // Ensure profile row exists and email is saved
  useEffect(() => {
    fetch('/api/profile', { method: 'POST' }).catch(() => {})
  }, [])

  async function handleGoalsChange(newGoals) {
    setGoals(newGoals)
    // Save to Supabase (primary) and localStorage (fallback)
    try { localStorage.setItem('cpr-goals', JSON.stringify(newGoals)) } catch {}
    fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goals: newGoals }),
    }).catch(() => {})
  }

  async function handleFileUpload(file) {
    setUploading(true)
    setUploadError(null)
    try {
      const base64 = await readFileAsBase64(file)
      const mimeType = file.type

      const fileBlock =
        mimeType === 'application/pdf'
          ? { type: 'document', source: { type: 'base64', media_type: mimeType, data: base64 } }
          : { type: 'image',    source: { type: 'base64', media_type: mimeType, data: base64 } }

      const messages = [
        {
          role: 'user',
          content: [
            fileBlock,
            {
              type: 'text',
              text:
                'Extract all financial metrics from this auto repair shop CPR report and return them as a single JSON object. ' +
                'Return ONLY the raw JSON — no markdown, no explanation.\n\n' +
                'Fields to include (use null if not found). All monetary/percentage values must be plain numbers:\n' +
                'shop_name, period, period_months (decimal number of months covered — e.g. 1 for a full month, 0.25 for one week, 3 for a quarter; derive from the report date range if not explicit), gross_sales, gross_profit, gross_profit_margin, ' +
                'avg_ticket, total_ros, close_ratio, effective_labor_rate, labor_sales, labor_profit, ' +
                'labor_profit_pct, parts_sales, parts_profit, parts_profit_pct, hours_presented, ' +
                'hours_sold, gross_profit_per_hour, total_discounts, total_fees',
            },
          ],
        },
      ]

      const res = await fetch(process.env.NEXT_PUBLIC_WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      })

      const responseData = await res.json().catch(() => ({}))

      if (!res.ok) {
        const msg =
          responseData?.error?.message ||
          responseData?.message ||
          `${res.status} ${res.statusText}`
        throw new Error(msg)
      }

      const text = responseData?.content?.[0]?.text
      if (!text) throw new Error('No content returned from analysis service.')

      let rawJson
      const fenceMatch = text.match(/```(?:json)?\s*([\s\S]+?)\s*```/)
      try {
        rawJson = JSON.parse(fenceMatch ? fenceMatch[1] : text)
      } catch {
        throw new Error('Could not parse metrics from the response. Try a clearer file.')
      }

      const parsed = parseAnalysis(rawJson)

      if (!parsed || Object.keys(parsed).length === 0) {
        throw new Error('Could not extract metrics from this report. Please try a different file.')
      }

      const periodMonths = parsed.period_months
      const dbPayload = { ...parsed, goals }
      if (dbPayload.period_months != null) {
        dbPayload.period_months = Math.max(1, Math.round(dbPayload.period_months))
      }
      const { data, error } = await supabase
        .from('analyses')
        .insert({ user_id: user.id, ...dbPayload })
        .select()
        .single()

      if (error) throw new Error(error.message)

      const displayData = { ...data, period_months: periodMonths ?? data.period_months }
      setAnalyses((prev) => [displayData, ...prev])
      setCurrentAnalysis(displayData)
    } catch (err) {
      setUploadError(err.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function handleSelectAnalysis(a) { setCurrentAnalysis(a) }
  function handleNewUpload() { setCurrentAnalysis(null); setUploadError(null) }

  async function handleDeleteAnalysis(id) {
    await supabase.from('analyses').delete().eq('id', id)
    setAnalyses((prev) => prev.filter((a) => a.id !== id))
    if (currentAnalysis?.id === id) { setCurrentAnalysis(null); setUploadError(null) }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar
        user={user}
        onLogout={handleLogout}
        showBack={!!currentAnalysis}
        onBack={handleNewUpload}
      />

      {currentAnalysis ? (
        <Dashboard
          key={currentAnalysis.id}
          analysis={currentAnalysis}
          goals={goals}
          onGoalsChange={handleGoalsChange}
          analyses={analyses}
          onSelectAnalysis={handleSelectAnalysis}
          onNewUpload={handleNewUpload}
          onDeleteAnalysis={handleDeleteAnalysis}
        />
      ) : (
        <UploadScreen
          goals={goals}
          onGoalsChange={handleGoalsChange}
          onFileUpload={handleFileUpload}
          uploading={uploading}
          error={uploadError}
          analyses={analyses}
          onSelectAnalysis={handleSelectAnalysis}
        />
      )}
    </div>
  )
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => { resolve(reader.result.split(',')[1]) }
    reader.onerror = () => reject(new Error('Failed to read file.'))
    reader.readAsDataURL(file)
  })
}
