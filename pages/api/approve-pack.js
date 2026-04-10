export default async function handler(req, res) {
  // Accept both GET (from email button click) and POST
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end()

  const { pack_id } = req.method === 'GET' ? req.query : req.body

  if (!pack_id) {
    return res.status(400).send(`
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 560px; margin: 80px auto; text-align: center; color: #2C2C2C;">
          <h2 style="color: #3D5440;">Missing pack ID</h2>
          <p>This link appears to be invalid. Please check your email and try again.</p>
        </body>
      </html>
    `)
  }

  try {
    // Fetch pack and client data from Supabase
    const packResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/packs?id=eq.${pack_id}&select=*,clients(first_name,last_name,email,business_name,plan)`,
      {
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        }
      }
    )

    const packData = await packResponse.json()
    const pack = packData[0]

    if (!pack) {
      return res.status(404).send(`
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 560px; margin: 80px auto; text-align: center; color: #2C2C2C;">
            <h2 style="color: #3D5440;">Pack not found</h2>
            <p>This pack may have already been delivered or the link has expired.</p>
          </body>
        </html>
      `)
    }

    // Check if already delivered
    if (pack.delivery_status === 'delivered') {
      return res.status(200).send(`
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 560px; margin: 80px auto; text-align: center; color: #2C2C2C;">
            <div style="background: #F9F5EE; padding: 48px; border-radius: 8px; border: 1px solid #F0E9DC;">
              <div style="font-size: 32px; margin-bottom: 16px;">✓</div>
              <h2 style="color: #3D5440; font-family: Georgia, serif; font-weight: 300; margin-bottom: 12px;">Already delivered</h2>
              <p style="color: #7A7269;">This pack has already been sent to the client.</p>
            </div>
          </body>
        </html>
      `)
    }

    const client = pack.clients
    const packMonth = new Date(pack.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    // Trigger Make Pack Delivery webhook
    const makeRes = await fetch(process.env.MAKE_PACK_DELIVERY_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pack_id: pack.id,
        client_id: pack.client_id,
        client_email: client.email,
        client_first_name: client.first_name,
        business_name: client.business_name,
        pack_month: packMonth
      })
    })

    if (!makeRes.ok) {
      throw new Error('Failed to trigger pack delivery')
    }

    // Mark pack as approved in Supabase
    await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/packs?id=eq.${pack_id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          reviewed_by_jacob: true,
          reviewed_at: new Date().toISOString(),
          delivery_status: 'delivering'
        })
      }
    )

    // Return success page
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Pack Approved — FlourishGlow</title>
          <style>
            body { font-family: Arial, sans-serif; background: #F9F5EE; margin: 0; padding: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
            .card { background: white; max-width: 480px; width: 90%; padding: 48px; border-radius: 8px; box-shadow: 0 8px 40px rgba(61,84,64,0.08); text-align: center; }
            .check { width: 56px; height: 56px; background: #3D5440; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 24px; color: white; }
            h1 { font-family: Georgia, serif; font-size: 28px; font-weight: 300; color: #3D5440; margin: 0 0 12px; }
            p { font-size: 14px; color: #7A7269; line-height: 1.7; margin: 0 0 8px; }
            .business { font-weight: 500; color: #2C2C2C; }
            .logo { font-family: Georgia, serif; font-size: 18px; color: #3D5440; margin-top: 32px; padding-top: 24px; border-top: 1px solid #F0E9DC; }
            .logo span { color: #D4A5A0; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="check">✓</div>
            <h1>Pack approved.</h1>
            <p>The content pack for <span class="business">${client.business_name}</span> is being delivered now.</p>
            <p>They'll receive their PDF within the next minute.</p>
            <div class="logo">Flourish<span>Glow</span></div>
          </div>
        </body>
      </html>
    `)

  } catch (err) {
    console.error('Approve pack error:', err)
    return res.status(500).send(`
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 560px; margin: 80px auto; text-align: center; color: #2C2C2C;">
          <h2 style="color: #c0392b;">Something went wrong</h2>
          <p>Please try again or trigger delivery manually.</p>
          <p style="font-size: 12px; color: #999;">${err.message}</p>
        </body>
      </html>
    `)
  }
}
