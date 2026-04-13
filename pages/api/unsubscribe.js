export default async function handler(req, res) {
  const { email } = req.query

  if (!email) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Unsubscribe — FlourishGlow</title>
      <style>body{font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#F0E9DC;}
      .card{background:#fff;padding:48px;border-radius:4px;text-align:center;max-width:480px;}</style>
      </head>
      <body><div class="card">
        <p style="color:#7A7269;">Invalid unsubscribe link. Please reply to any of our emails to be removed.</p>
      </div></body></html>
    `)
  }

  try {
    // Update leads table
    const updateRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/leads?email=eq.${encodeURIComponent(email)}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          unsubscribed: true,
          unsubscribed_at: new Date().toISOString()
        })
      }
    )

    if (!updateRes.ok) {
      throw new Error('Supabase update failed')
    }

    // Return clean confirmation page
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribed — FlourishGlow</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #F0E9DC; }
          .card { background: #fff; padding: 48px 40px; border-radius: 4px; text-align: center; max-width: 480px; border: 1px solid #e8e0d5; }
          .logo { font-family: Georgia, serif; font-size: 20px; color: #3D5440; margin-bottom: 24px; }
          .logo span { color: #D4A5A0; }
          h1 { font-family: Georgia, serif; font-size: 26px; font-weight: 300; color: #3D5440; margin: 0 0 16px; }
          p { font-size: 14px; color: #7A7269; line-height: 1.7; margin: 0 0 24px; }
          a { color: #5C7A5E; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo">Flourish<span>Glow</span></div>
          <h1>You've been unsubscribed.</h1>
          <p>You won't receive any more emails from FlourishGlow. We're sorry to see you go.</p>
          <p>If this was a mistake or you'd like to learn more in the future, you're always welcome back.<br><a href="https://flourishglow.com">flourishglow.com</a></p>
        </div>
      </body>
      </html>
    `)

  } catch (err) {
    console.error('Unsubscribe error:', err)
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Unsubscribe — FlourishGlow</title>
      <style>body{font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#F0E9DC;}
      .card{background:#fff;padding:48px;border-radius:4px;text-align:center;max-width:480px;}</style>
      </head>
      <body><div class="card">
        <p style="color:#7A7269;">Something went wrong. Please reply to any of our emails to be removed and we'll take care of it immediately.</p>
      </div></body></html>
    `)
  }
}
