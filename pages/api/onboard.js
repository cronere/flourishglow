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
    // Clean up city_state field
    if (payload.city_state) {
      delete payload.city_state
    }

    // 1. Save to pending_clients via Make webhook
    //    Make inserts into pending_clients table only — no welcome email yet
    //    Welcome email + content generation fires AFTER Stripe payment confirmed
    const makeRes = await fetch(process.env.MAKE_PENDING_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        submitted_at: new Date().toISOString(),
        source: 'website_onboarding_form'
      })
    })

    if (!makeRes.ok) {
      console.error('Make pending webhook failed — proceeding to Stripe anyway')
    }

    // 2. Redirect to Stripe based on plan
    const stripeUrl = payload.plan === 'growth'
      ? 'https://pay.flourishglow.com/b/5kQ14n9Bc3MC38c8xFaVa01'
      : 'https://pay.flourishglow.com/b/7sY4gzdRs96WdMQ29haVa00'

    return res.status(200).json({ success: true, stripeUrl })
  } catch (err) {
    console.error('Onboarding error:', err)
    // Still redirect to Stripe even if pending save fails
    // Better to have a paid client with missing data than lose the sale
    const stripeUrl = payload.plan === 'growth'
      ? 'https://pay.flourishglow.com/b/5kQ14n9Bc3MC38c8xFaVa01'
      : 'https://pay.flourishglow.com/b/7sY4gzdRs96WdMQ29haVa00'
    return res.status(200).json({ success: true, stripeUrl })
  }
}
