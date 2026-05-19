import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AppShell from '@/components/AppShell'

export default async function Home() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
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

  const { data: analyses } = await supabase
    .from('analyses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  return <AppShell user={user} initialAnalyses={analyses ?? []} />
}
