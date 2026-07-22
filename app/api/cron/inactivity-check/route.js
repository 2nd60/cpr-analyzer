import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DAY_MS = 24 * 60 * 60 * 1000

function daysAgo(n) {
  return new Date(Date.now() - n * DAY_MS)
}

export async function GET(request) {
  // Verify cron secret — treat a missing env var as a misconfiguration, not a passable value
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.error('[inactivity-check] CRON_SECRET is not set')
    return Response.json({ error: 'Server misconfiguration' }, { status: 500 })
  }
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const webhookUrl = process.env.GHL_INACTIVITY_WEBHOOK_URL

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Query MAX(created_at) per user joined with profile email
  const { data: rows, error: queryError } = await supabase
    .from('analyses')
    .select('user_id, created_at, profiles(email)')
    .order('created_at', { ascending: false })

  if (queryError) {
    console.error('[inactivity-check] query error:', queryError.message)
    return Response.json({ error: queryError.message }, { status: 500 })
  }

  // Collapse to one row per user (max created_at) — Supabase doesn't expose
  // GROUP BY directly through the client, so we do it in JS.
  const latestByUser = {}
  for (const row of rows) {
    if (!latestByUser[row.user_id]) {
      latestByUser[row.user_id] = {
        user_id: row.user_id,
        email: row.profiles?.email,
        last_at: new Date(row.created_at),
      }
    }
  }

  const day7Start  = daysAgo(8)   // 8 days ago
  const day7End    = daysAgo(7)   // 7 days ago  → window: (8d, 7d]
  const day14Start = daysAgo(15)
  const day14End   = daysAgo(14)

  const day7Users  = []
  const day14Users = []

  for (const { email, last_at } of Object.values(latestByUser)) {
    if (!email) continue
    if (last_at > day7Start && last_at <= day7End)   day7Users.push(email)
    if (last_at > day14Start && last_at <= day14End) day14Users.push(email)
  }

  const errors = []

  async function fireWebhook(email, days_inactive, reminder_sequence) {
    if (!webhookUrl) {
      errors.push(`${email} (${reminder_sequence}): GHL_INACTIVITY_WEBHOOK_URL not set — skipped`)
      return
    }
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, days_inactive, reminder_sequence }),
      })
      if (!res.ok) {
        errors.push(`${email} (${reminder_sequence}): HTTP ${res.status}`)
      }
    } catch (err) {
      errors.push(`${email} (${reminder_sequence}): ${err.message}`)
    }
  }

  await Promise.all([
    ...day7Users.map((email)  => fireWebhook(email, 7,  'day7')),
    ...day14Users.map((email) => fireWebhook(email, 14, 'day14')),
  ])

  const summary = {
    day7_count:  day7Users.length,
    day14_count: day14Users.length,
    errors,
    fired_at: new Date().toISOString(),
  }

  console.log('[inactivity-check]', JSON.stringify(summary))
  return Response.json(summary)
}
