export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, email, business_name, practice_type, services } = req.body

  if (!name || !email || !business_name || !practice_type || !services) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // Forward to Make.com webhook
    const makeRes = await fetch(process.env.MAKE_SAMPLE_REQUEST_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        business_name,
        practice_type,
        services,
        submitted_at: new Date().toISOString(),
        source: 'website_sample_form'
      })
    })

    if (!makeRes.ok) throw new Error('Make webhook failed')
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Sample request error:', err)
    // Still return 200 to user — don't expose internal errors
    return res.status(200).json({ success: true })
  }
}
