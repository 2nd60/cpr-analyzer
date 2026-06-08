// Run once to create coach accounts and set their roles.
// Usage: node scripts/create-coaches.js

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const COACHES = [
  'ron@maverickshopowners.com',
  'gerry@maverickshopowners.com',
  'bill@maverickshopowners.com',
  'charlotte@maverickshopowners.com',
]

async function main() {
  for (const email of COACHES) {
    console.log(`\nProcessing: ${email}`)

    // Check if user already exists
    const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    const existing = users?.find((u) => u.email === email)

    let userId

    if (existing) {
      console.log(`  Already exists (${existing.id}) — updating profile role`)
      userId = existing.id
    } else {
      // Invite creates the account and sends them an email to set their password
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(email)
      if (error) {
        console.error(`  Failed to invite: ${error.message}`)
        continue
      }
      userId = data.user.id
      console.log(`  Invited successfully (${userId})`)
    }

    // Upsert profile row with coach role
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: userId, role: 'coach', email }, { onConflict: 'id' })

    if (profileError) console.error(`  Profile error: ${profileError.message}`)
    else console.log(`  Profile set to coach`)
  }

  console.log('\nAll done!')
}

main().catch(console.error)
