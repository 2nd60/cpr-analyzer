import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { supabaseAdmin } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminShell from '@/components/AdminShell'

export default async function AdminPage() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try { cookieStore.set(name, value, options) } catch {}
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify coach role using admin client (bypasses RLS)
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'coach') redirect('/')

  // Fetch all non-coach users with their profile info
  const { data: users } = await supabaseAdmin
    .from('profiles')
    .select('id, email, goals')
    .neq('role', 'coach')
    .order('id')

  // Fetch most recent analysis per user (for the user list preview)
  const { data: recentAnalyses } = await supabaseAdmin
    .from('analyses')
    .select('id, user_id, shop_name, period, created_at, gross_profit_margin')
    .order('created_at', { ascending: false })

  return (
    <AdminShell
      coach={user}
      users={users ?? []}
      recentAnalyses={recentAnalyses ?? []}
    />
  )
}
