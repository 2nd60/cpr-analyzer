import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { supabaseAdmin } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const cookieStore = await cookies()

  // Identify the calling user from their session cookie
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
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Use the service-role client to bypass RLS for the upsert
  const { error } = await supabaseAdmin
    .from('profiles')
    .upsert({ id: user.id }, { onConflict: 'id', ignoreDuplicates: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
