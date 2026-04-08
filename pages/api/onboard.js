export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const payload = req.body

  const required = ['first_name', 'last_name', 'email', 'business_name', 'location', 'practice_type', 'plan', 'brand_voice']
  for (const field of required) {
    if (!payload[field]) {
      return res.status(400).json({ error: `Missing required field: ${field}` })
    }
  }

  try {
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
    //    Use plan to determine which Stripe price ID
    const stripeUrl = payload.plan === 'growth'
      ? process.env.STRIPE_GROWTH_CHECKOUT_URL
      : process.env.STRIPE_CORE_CHECKOUT_URL

    return res.status(200).json({ success: true, stripeUrl })
  } catch (err) {
    console.error('Onboarding error:', err)
    return res.status(500).json({ error: 'Something went wrong. Please try again or email hello@flourishglow.com' })
  }
}
