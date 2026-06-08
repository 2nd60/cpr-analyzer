'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Navbar from './Navbar'
import Dashboard from './Dashboard'
import { getDefaultGoals } from '@/lib/benchmarks'

export default function AdminShell({ coach, users, recentAnalyses }) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const [selectedUser, setSelectedUser] = useState(null)
  const [userAnalyses, setUserAnalyses] = useState([])
  const [currentAnalysis, setCurrentAnalysis] = useState(null)
  const [userGoals, setUserGoals] = useState(getDefaultGoals())
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  async function selectUser(user) {
    setLoading(true)
    setSelectedUser(user)
    setCurrentAnalysis(null)

    // Load their goals from profile
    setUserGoals(user.goals ? { ...getDefaultGoals(), ...user.goals } : getDefaultGoals())

    // Fetch all their analyses
    const { data: analyses } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setUserAnalyses(analyses ?? [])
    if (analyses?.length > 0) setCurrentAnalysis(analyses[0])
    setLoading(false)
  }

  // Build a map of user_id → most recent analysis for the sidebar list
  const latestByUser = {}
  for (const a of recentAnalyses) {
    if (!latestByUser[a.user_id]) latestByUser[a.user_id] = a
  }

  // Only show users who have at least one analysis
  const usersWithData = users.filter((u) => latestByUser[u.id])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar
        user={coach}
        onLogout={handleLogout}
        isCoach
        showBack={!!selectedUser}
        onBack={() => { setSelectedUser(null); setCurrentAnalysis(null) }}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* User list sidebar */}
        <aside className="w-72 shrink-0 border-r border-gray-200 bg-gray-50 overflow-y-auto no-print">
          <div className="px-4 py-4 border-b border-gray-200">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">Shop Owners</h2>
            <p className="text-xs text-gray-400 mt-0.5">{usersWithData.length} with reports</p>
          </div>

          {usersWithData.length === 0 ? (
            <p className="px-4 py-6 text-sm text-gray-400">No shop owners have uploaded reports yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {usersWithData.map((u) => {
                const latest = latestByUser[u.id]
                const isSelected = selectedUser?.id === u.id
                return (
                  <button
                    key={u.id}
                    onClick={() => selectUser(u)}
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      isSelected ? 'bg-blue-50 border-l-2 border-blue-500' : 'hover:bg-white'
                    }`}
                  >
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {latest?.shop_name || u.email || 'Unknown Shop'}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{u.email}</p>
                    {latest && (
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-400">
                          {new Date(latest.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        {latest.gross_profit_margin != null && (
                          <p className="text-xs font-bold text-gray-600">
                            {latest.gross_profit_margin.toFixed(1)}% GP
                          </p>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && !selectedUser && (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-gray-400 text-sm">Select a shop owner from the sidebar to view their results</p>
            </div>
          )}

          {!loading && selectedUser && userAnalyses.length === 0 && (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-400 text-sm">No analyses found for this user.</p>
            </div>
          )}

          {!loading && selectedUser && currentAnalysis && (
            <Dashboard
              key={currentAnalysis.id}
              analysis={currentAnalysis}
              goals={userGoals}
              analyses={userAnalyses}
              onSelectAnalysis={setCurrentAnalysis}
              onNewUpload={() => {}}
              onDeleteAnalysis={() => {}}
              readOnly
            />
          )}
        </main>
      </div>
    </div>
  )
}
