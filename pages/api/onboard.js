export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const payload = req.body

  // Log what we received for debugging
  console.log('Onboarding payload received:', JSON.stringify(payload))

  // Basic check — just need email and plan to proceed
  if (!payload.email || !payload.plan) {
    return res.status(400).json({ error: 'Missing email or plan' })
  }

  try {
    // Remap city_state to location for Supabase
    if (payload.city_state) {
      payload.location = payload.city_state
      delete payload.city_state
    }

    // 1. Forward full onboarding payload to Make.com
    //    Make will: create Supabase record, send welcome email, trigger first pack generation
    const makeRes = await fetch(process.env.MAKE_ONBOARD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        submitted_at: new Date().toISOString(),
        source: 'website_onboarding_form'
      })
    })

    if (!makeRes.ok) throw new Error('Make webhook failed')

    // 2. Return Stripe checkout URL for client-side redirect
    const stripeUrl = payload.plan === 'growth'
      ? 'https://pay.flourishglow.com/b/5kQ14n9Bc3MC38c8xFaVa01'
      : 'https://pay.flourishglow.com/b/7sY4gzdRs96WdMQ29haVa00'

    return res.status(200).json({ success: true, stripeUrl })
  } catch (err) {
    console.error('Onboarding error:', err)
    return res.status(500).json({ error: 'Something went wrong. Please try again or email hello@flourishglow.com' })
  }
}
