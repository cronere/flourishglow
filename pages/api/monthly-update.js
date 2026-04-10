export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const payload = req.body

  console.log('Monthly update received:', JSON.stringify(payload))

  if (!payload.client_id) {
    return res.status(400).json({ error: 'Missing client_id' })
  }

  try {
    // Forward to Make webhook which saves to monthly_updates table
    if (process.env.MAKE_MONTHLY_UPDATE_WEBHOOK) {
      await fetch(process.env.MAKE_MONTHLY_UPDATE_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Monthly update error:', err)
    // Return 200 anyway — don't block the client from seeing success
    return res.status(200).json({ success: true })
  }
}
