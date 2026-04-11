export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const {
    pack_id,
    client_id,
    client_email,
    client_first_name,
    business_name,
    pack_month
  } = req.body

  console.log('Generating PDF for:', business_name, pack_month)

  console.log('generate-pdf called with body:', JSON.stringify(req.body))

  try {
    // Fetch pack data directly from Supabase
    const packUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/packs?id=eq.${pack_id}&select=*`
    console.log('Fetching pack from:', packUrl)
    const packResponse = await fetch(packUrl,
      {
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        }
      }
    )

    const packData = await packResponse.json()
    const pack = packData[0]

    console.log('Raw pack data:', JSON.stringify({
      has_pack: !!pack,
      social_captions_raw: pack ? JSON.stringify(pack.social_captions).substring(0, 100) : 'no pack',
      reactivation_raw: pack ? JSON.stringify(pack.reactivation_sequence).substring(0, 100) : 'no pack',
      promo_email_raw: pack ? JSON.stringify(pack.promo_email).substring(0, 100) : 'no pack',
      gbp_posts_raw: pack ? JSON.stringify(pack.gbp_posts).substring(0, 100) : 'no pack'
    }))

    if (!pack) {
      return res.status(404).json({ error: 'Pack not found' })
    }

    const strategy_note = pack.strategy_note

    // The full Claude JSON response is stored in social_captions
    // Parse it to extract all sections
    let fullPack
    try {
      const rawJson = typeof pack.social_captions === 'string' 
        ? pack.social_captions 
        : JSON.stringify(pack.social_captions)
      
      // Clean up any [object Object] artifacts
      const cleaned = rawJson.replace(/\[object Object\]/g, '{}')
      fullPack = JSON.parse(cleaned)
    } catch(e) {
      console.error('Failed to parse pack JSON:', e.message)
      return res.status(500).json({ error: 'Failed to parse pack data', details: e.message })
    }

    const social_captions = fullPack.social_captions || []
    const reactivation_sequence = fullPack.reactivation_sequence || []
    const promo_email = fullPack.promo_email || {}
    const gbp_posts = fullPack.gbp_posts || []
    const referral_email = fullPack.referral_email || {}
    const sms_captions = fullPack.sms_captions || []
    const content_calendar = fullPack.content_calendar || []

    console.log('Pack fields:', {
      has_strategy_note: !!strategy_note,
      social_captions_length: Array.isArray(social_captions) ? social_captions.length : typeof social_captions,
      reactivation_length: Array.isArray(reactivation_sequence) ? reactivation_sequence.length : typeof reactivation_sequence,
      promo_email_type: typeof promo_email,
      gbp_posts_length: Array.isArray(gbp_posts) ? gbp_posts.length : typeof gbp_posts
    })

    // Build social captions HTML
    const captionCard = (c) => `
      <td style="width:50%; vertical-align:top; padding:6px;">
        <div style="border:1px solid #F0E9DC; border-radius:4px; overflow:hidden; page-break-inside:avoid;">
          <div style="background:#F0E9DC; padding:7px 12px;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td style="font-size:7.5pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269;">Caption ${c.caption_number} of 12</td>
              <td style="text-align:right;"><span style="font-size:7pt; font-weight:500; text-transform:uppercase; color:#5C7A5E; background:rgba(92,122,94,0.12); padding:1px 7px; border-radius:20px; white-space:nowrap;">${c.angle}</span></td>
            </tr></table>
          </div>
          <div style="padding:12px;">
            <div style="font-size:9pt; font-weight:300; line-height:1.65; color:#2C2C2C; margin-bottom:8px;">${c.caption.replace(/\n/g, '<br/>')}</div>
            <div style="font-size:8pt; color:#D4A5A0; line-height:1.5; margin-bottom:6px;">${c.hashtags}</div>
            <div style="font-size:7pt; color:#7A7269; font-style:italic; padding-top:6px; border-top:1px solid #F0E9DC;">📸 ${c.image_suggestion}</div>
          </div>
        </div>
      </td>`

    const captionsHtml = social_captions.reduce((rows, c, i) => {
      if (i % 2 === 0) rows.push('<tr>')
      rows[rows.length - 1] += captionCard(c)
      if (i % 2 === 1) rows[rows.length - 1] += '</tr>'
      if (i === social_captions.length - 1 && i % 2 === 0) rows[rows.length - 1] += '<td></td></tr>'
      return rows
    }, []).join('')

    // Build reactivation emails HTML
    const reactivationHtml = reactivation_sequence.map(e => `
      <div style="border:1px solid #F0E9DC; border-radius:4px; overflow:hidden; margin-bottom:16px; page-break-inside:avoid;">
        <div style="background:#F0E9DC; padding:10px 18px;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="font-size:7.5pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269;">Email ${e.email_number} of 3</td>
            <td style="text-align:right;"><span style="font-size:7.5pt; font-weight:500; color:#5C7A5E; background:rgba(92,122,94,0.1); padding:2px 10px; border-radius:20px;">Send Day ${e.send_day}</span></td>
          </tr></table>
        </div>
        <div style="padding:18px;">
          <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:3px;">Subject Line</div>
          <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:15pt; font-weight:500; color:#3D5440; margin-bottom:3px; line-height:1.2;">${e.subject}</div>
          <div style="font-size:8.5pt; font-style:italic; color:#7A7269; margin-bottom:14px; padding-bottom:14px; border-bottom:1px solid #F0E9DC;">Preview text: ${e.preview_text}</div>
          <div style="font-size:9.5pt; font-weight:300; line-height:1.8; color:#2C2C2C;">${e.body.replace(/\n/g, '<br/>')}</div>
        </div>
      </div>
    `).join('')

    // Build GBP posts HTML
    const gbpTypeStyle = (type) => {
      const map = {
        'Offer': 'background:rgba(212,165,160,0.2); color:#b87a74;',
        'Educational': 'background:rgba(92,122,94,0.12); color:#5C7A5E;',
        'Seasonal': 'background:rgba(184,148,90,0.15); color:#b8945a;',
        'Review Request': 'background:rgba(61,84,64,0.1); color:#3D5440;'
      }
      return map[type] || map['Offer']
    }

    const gbpHtml = gbp_posts.reduce((rows, p, i) => {
      if (i % 2 === 0) rows.push('<tr>')
      rows[rows.length - 1] += `
        <td style="width:50%; vertical-align:top; padding:6px;">
          <div style="border:1px solid #F0E9DC; border-radius:4px; overflow:hidden; page-break-inside:avoid;">
            <div style="background:#F0E9DC; padding:8px 14px;">
              <table width="100%" cellpadding="0" cellspacing="0"><tr>
                <td style="font-size:7.5pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269;">Week ${p.week}</td>
                <td style="text-align:right;"><span style="font-size:7pt; font-weight:500; padding:1px 7px; border-radius:20px; text-transform:uppercase; letter-spacing:0.06em; ${gbpTypeStyle(p.type)}">${p.type}</span></td>
              </tr></table>
            </div>
            <div style="padding:12px 14px; background:#F9F5EE;">
              <div style="font-size:9pt; font-weight:300; line-height:1.65; color:#2C2C2C;">${p.post.replace(/\n/g, '<br/>')}</div>
            </div>
          </div>
        </td>`
      if (i % 2 === 1) rows[rows.length - 1] += '</tr>'
      if (i === gbp_posts.length - 1 && i % 2 === 0) rows[rows.length - 1] += '<td></td></tr>'
      return rows
    }, []).join('')

    // Build SMS captions HTML
    const smsCaptionsHtml = sms_captions.reduce((rows, s, i) => {
      if (i % 2 === 0) rows.push('<tr>')
      rows[rows.length - 1] += `
        <td style="width:50%; vertical-align:top; padding:6px;">
          <div style="border:1px solid #F0E9DC; border-radius:4px; overflow:hidden; page-break-inside:avoid;">
            <div style="background:#F0E9DC; padding:7px 12px;">
              <span style="font-size:7.5pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269;">Caption ${s.caption_number} of 12</span>
            </div>
            <div style="padding:12px;">
              <div style="font-size:9pt; font-weight:300; line-height:1.65; color:#2C2C2C;">${s.sms}</div>
              <div style="font-size:7pt; color:#7A7269; margin-top:8px; padding-top:6px; border-top:1px solid #F0E9DC;">${s.sms ? s.sms.length : 0} / 160 characters</div>
            </div>
          </div>
        </td>`
      if (i % 2 === 1) rows[rows.length - 1] += '</tr>'
      if (i === sms_captions.length - 1 && i % 2 === 0) rows[rows.length - 1] += '<td></td></tr>'
      return rows
    }, []).join('')

    // Build complete HTML — flowing layout, no fixed page heights
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${business_name} — Content Pack</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

    @page { size: A4; margin: 0; }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'DM Sans', Arial, sans-serif;
      background: #fff;
      color: #2C2C2C;
      font-size: 11pt;
      line-height: 1.5;
      width: 794px;
    }
  </style>
</head>
<body>

  <!-- COVER BLOCK -->
  <div style="background:#3D5440; padding:72px 72px 56px; page-break-after:always; min-height:100vh;">
    <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:30pt; font-weight:400; color:#fff; letter-spacing:0.02em; margin-bottom:6px;">
      Flourish<span style="color:#D4A5A0;">Glow</span>
    </div>
    <div style="font-size:8.5pt; letter-spacing:0.16em; text-transform:uppercase; color:rgba(255,255,255,0.4); margin-bottom:180px;">
      Done-for-you content for wellness practices
    </div>
    <div style="font-size:9pt; font-weight:500; letter-spacing:0.16em; text-transform:uppercase; color:#8AAD8C; margin-bottom:18px;">
      Monthly Content Pack
    </div>
    <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:48pt; font-weight:300; line-height:1.05; color:#fff; margin-bottom:20px;">
      Your content,<br/><em style="font-style:italic; color:#D4A5A0;">ready to post.</em>
    </div>
    <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:18pt; font-weight:400; color:rgba(255,255,255,0.7); margin-bottom:6px;">
      ${business_name}
    </div>
    <div style="font-size:9.5pt; font-weight:300; letter-spacing:0.08em; color:rgba(255,255,255,0.4); margin-bottom:56px;">
      Prepared by FlourishGlow · ${pack_month}
    </div>
    <div style="border-top:1px solid rgba(255,255,255,0.15); padding-top:28px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="text-align:center;">
          <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#fff; line-height:1; display:block; margin-bottom:4px;">12</div>
          <div style="font-size:7.5pt; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.35);">Social Captions</div>
        </td>
        <td style="text-align:center;">
          <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#fff; line-height:1; display:block; margin-bottom:4px;">3</div>
          <div style="font-size:7.5pt; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.35);">Reactivation Emails</div>
        </td>
        <td style="text-align:center;">
          <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#fff; line-height:1; display:block; margin-bottom:4px;">1</div>
          <div style="font-size:7.5pt; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.35);">Promo Email</div>
        </td>
        <td style="text-align:center;">
          <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#fff; line-height:1; display:block; margin-bottom:4px;">4</div>
          <div style="font-size:7.5pt; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.35);">Google Posts</div>
        </td>
      </tr>
      <tr>
        <td style="text-align:center; padding-top:20px;">
          <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#fff; line-height:1; display:block; margin-bottom:4px;">12</div>
          <div style="font-size:7.5pt; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.35);">SMS Captions</div>
        </td>
        <td style="text-align:center; padding-top:20px;">
          <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#fff; line-height:1; display:block; margin-bottom:4px;">1</div>
          <div style="font-size:7.5pt; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.35);">Referral Email</div>
        </td>
        <td style="text-align:center; padding-top:20px;" colspan="2">
          <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#fff; line-height:1; display:block; margin-bottom:4px;">1</div>
          <div style="font-size:7.5pt; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.35);">Content Calendar</div>
        </td>
      </tr></table>
    </div>
  </div>

  <!-- STRATEGY NOTE -->
  <div style="padding:48px 64px 40px;">
    <div style="font-size:8pt; font-weight:500; letter-spacing:0.16em; text-transform:uppercase; color:#5C7A5E; margin-bottom:8px;">This month's approach</div>
    <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#3D5440; line-height:1.1; margin-bottom:6px;">Your <em style="font-style:italic; color:#D4A5A0;">strategy note.</em></div>
    <div style="font-size:9.5pt; font-weight:300; color:#7A7269; margin-bottom:24px; line-height:1.6;">A brief overview of the content angles we chose this month and why.</div>
    <div style="background:#3D5440; padding:24px 28px; border-radius:4px; margin-bottom:40px;">
      <div style="font-size:8pt; font-weight:500; letter-spacing:0.14em; text-transform:uppercase; color:#8AAD8C; margin-bottom:10px;">From the FlourishGlow team</div>
      <div style="font-size:10.5pt; font-weight:300; line-height:1.8; color:rgba(255,255,255,0.85); font-style:italic;">${strategy_note}</div>
    </div>

    <!-- HOW TO USE -->
    <div style="height:1px; background:rgba(92,122,94,0.2); margin-bottom:28px;"></div>
    <div style="font-size:8pt; font-weight:500; letter-spacing:0.16em; text-transform:uppercase; color:#5C7A5E; margin-bottom:8px;">How to use this pack</div>
    <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#3D5440; line-height:1.1; margin-bottom:24px;">Getting <em style="font-style:italic; color:#D4A5A0;">started.</em></div>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate; border-spacing:12px; margin:0 -12px;">
      <tr>
        <td style="width:50%; vertical-align:top; padding:16px; background:#F9F5EE; border-radius:4px; border:1px solid #F0E9DC;">
          <div style="font-size:18pt; margin-bottom:8px;">📸</div>
          <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:13pt; font-weight:500; color:#3D5440; margin-bottom:8px;">Social Captions</div>
          <div style="font-size:8.5pt; font-weight:300; color:#7A7269; line-height:1.6; padding:3px 0; border-bottom:1px solid #F0E9DC;"><span style="font-weight:500; color:#5C7A5E; margin-right:6px;">1</span>Choose your image or use the suggestion provided</div>
          <div style="font-size:8.5pt; font-weight:300; color:#7A7269; line-height:1.6; padding:3px 0; border-bottom:1px solid #F0E9DC;"><span style="font-weight:500; color:#5C7A5E; margin-right:6px;">2</span>Copy the caption text exactly as written</div>
          <div style="font-size:8.5pt; font-weight:300; color:#7A7269; line-height:1.6; padding:3px 0; border-bottom:1px solid #F0E9DC;"><span style="font-weight:500; color:#5C7A5E; margin-right:6px;">3</span>Copy the hashtags and add them to your post</div>
          <div style="font-size:8.5pt; font-weight:300; color:#7A7269; line-height:1.6; padding:3px 0; border-bottom:1px solid #F0E9DC;"><span style="font-weight:500; color:#5C7A5E; margin-right:6px;">4</span>Post to Instagram and/or Facebook</div>
          <div style="font-size:8.5pt; font-weight:300; color:#7A7269; line-height:1.6; padding:3px 0;"><span style="font-weight:500; color:#5C7A5E; margin-right:6px;">5</span>Aim for 3 posts per week — Tue, Thu, Sat</div>
        </td>
        <td style="width:50%; vertical-align:top; padding:16px; background:#F9F5EE; border-radius:4px; border:1px solid #F0E9DC;">
          <div style="font-size:18pt; margin-bottom:8px;">📧</div>
          <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:13pt; font-weight:500; color:#3D5440; margin-bottom:8px;">Email Campaigns</div>
          <div style="font-size:8.5pt; font-weight:300; color:#7A7269; line-height:1.6; padding:3px 0; border-bottom:1px solid #F0E9DC;"><span style="font-weight:500; color:#5C7A5E; margin-right:6px;">1</span>Copy subject line and body into your email platform</div>
          <div style="font-size:8.5pt; font-weight:300; color:#7A7269; line-height:1.6; padding:3px 0; border-bottom:1px solid #F0E9DC;"><span style="font-weight:500; color:#5C7A5E; margin-right:6px;">2</span>Replace [PATIENT NAME] with your merge tag</div>
          <div style="font-size:8.5pt; font-weight:300; color:#7A7269; line-height:1.6; padding:3px 0; border-bottom:1px solid #F0E9DC;"><span style="font-weight:500; color:#5C7A5E; margin-right:6px;">3</span>Replace [BOOKING LINK] with your booking URL</div>
          <div style="font-size:8.5pt; font-weight:300; color:#7A7269; line-height:1.6; padding:3px 0; border-bottom:1px solid #F0E9DC;"><span style="font-weight:500; color:#5C7A5E; margin-right:6px;">4</span>Send reactivation emails to patients inactive 60-90 days</div>
          <div style="font-size:8.5pt; font-weight:300; color:#7A7269; line-height:1.6; padding:3px 0;"><span style="font-weight:500; color:#5C7A5E; margin-right:6px;">5</span>Send promo email to your full patient list</div>
        </td>
      </tr>
      <tr>
        <td style="width:50%; vertical-align:top; padding:16px; background:#F9F5EE; border-radius:4px; border:1px solid #F0E9DC;">
          <div style="font-size:18pt; margin-bottom:8px;">🗺️</div>
          <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:13pt; font-weight:500; color:#3D5440; margin-bottom:8px;">Google Business Posts</div>
          <div style="font-size:8.5pt; font-weight:300; color:#7A7269; line-height:1.6; padding:3px 0; border-bottom:1px solid #F0E9DC;"><span style="font-weight:500; color:#5C7A5E; margin-right:6px;">1</span>Go to your Google Business Profile dashboard</div>
          <div style="font-size:8.5pt; font-weight:300; color:#7A7269; line-height:1.6; padding:3px 0; border-bottom:1px solid #F0E9DC;"><span style="font-weight:500; color:#5C7A5E; margin-right:6px;">2</span>Click Add Update or Add Offer</div>
          <div style="font-size:8.5pt; font-weight:300; color:#7A7269; line-height:1.6; padding:3px 0; border-bottom:1px solid #F0E9DC;"><span style="font-weight:500; color:#5C7A5E; margin-right:6px;">3</span>Copy the post text and paste it in</div>
          <div style="font-size:8.5pt; font-weight:300; color:#7A7269; line-height:1.6; padding:3px 0; border-bottom:1px solid #F0E9DC;"><span style="font-weight:500; color:#5C7A5E; margin-right:6px;">4</span>Replace [PHONE] and [WEBSITE] placeholders</div>
          <div style="font-size:8.5pt; font-weight:300; color:#7A7269; line-height:1.6; padding:3px 0;"><span style="font-weight:500; color:#5C7A5E; margin-right:6px;">5</span>Post once per week throughout the month</div>
        </td>
        <td style="width:50%; vertical-align:top; padding:16px; background:#F9F5EE; border-radius:4px; border:1px solid #F0E9DC;">
          <div style="font-size:18pt; margin-bottom:8px;">💡</div>
          <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:13pt; font-weight:500; color:#3D5440; margin-bottom:8px;">Tips for Best Results</div>
          <div style="font-size:8.5pt; font-weight:300; color:#7A7269; line-height:1.6; padding:3px 0; border-bottom:1px solid #F0E9DC;"><span style="font-weight:500; color:#5C7A5E; margin-right:6px;">✓</span>Post consistently — 3x/week beats 1x/week every time</div>
          <div style="font-size:8.5pt; font-weight:300; color:#7A7269; line-height:1.6; padding:3px 0; border-bottom:1px solid #F0E9DC;"><span style="font-weight:500; color:#5C7A5E; margin-right:6px;">✓</span>Feel free to tweak wording to sound more like you</div>
          <div style="font-size:8.5pt; font-weight:300; color:#7A7269; line-height:1.6; padding:3px 0; border-bottom:1px solid #F0E9DC;"><span style="font-weight:500; color:#5C7A5E; margin-right:6px;">✓</span>Respond to all comments within 24 hours</div>
          <div style="font-size:8.5pt; font-weight:300; color:#7A7269; line-height:1.6; padding:3px 0; border-bottom:1px solid #F0E9DC;"><span style="font-weight:500; color:#5C7A5E; margin-right:6px;">✓</span>Use your own before/after photos when possible</div>
          <div style="font-size:8.5pt; font-weight:300; color:#7A7269; line-height:1.6; padding:3px 0;"><span style="font-weight:500; color:#5C7A5E; margin-right:6px;">✓</span>Fill out your monthly update form for tailored content</div>
        </td>
      </tr>
    </table>
  </div>

  <!-- CONTENT CALENDAR -->
  <div style="padding:48px 64px 16px; page-break-before:always;">
    <div style="font-size:8pt; font-weight:500; letter-spacing:0.16em; text-transform:uppercase; color:#5C7A5E; margin-bottom:8px;">Section 01</div>
    <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#3D5440; line-height:1.1; margin-bottom:6px;">Monthly Content <em style="font-style:italic; color:#D4A5A0;">Calendar.</em></div>
    <div style="font-size:9.5pt; font-weight:300; color:#7A7269; margin-bottom:20px; line-height:1.6;">Your complete posting and sending schedule for the month. Post social captions Monday, Wednesday, and Friday. Send emails as scheduled below.</div>

    <!-- COLOR KEY -->
    <div style="display:flex; gap:16px; margin-bottom:20px; flex-wrap:wrap;">
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="width:12px; height:12px; background:#5C7A5E; border-radius:2px; vertical-align:middle;"></td>
        <td style="font-size:8pt; color:#5C7A5E; font-weight:500; padding-left:6px; vertical-align:middle;">Social Post</td>
        <td style="width:16px;"></td>
        <td style="width:12px; height:12px; background:rgba(92,122,94,0.2); border:1px solid #5C7A5E; border-radius:2px; vertical-align:middle;"></td>
        <td style="font-size:8pt; color:#5C7A5E; font-weight:500; padding-left:6px; vertical-align:middle;">SMS Caption</td>
        <td style="width:16px;"></td>
        <td style="width:12px; height:12px; background:#7A6EA0; border-radius:2px; vertical-align:middle;"></td>
        <td style="font-size:8pt; color:#7A6EA0; font-weight:500; padding-left:6px; vertical-align:middle;">Reactivation Email</td>
        <td style="width:16px;"></td>
        <td style="width:12px; height:12px; background:#D4A5A0; border-radius:2px; vertical-align:middle;"></td>
        <td style="font-size:8pt; color:#b87a74; font-weight:500; padding-left:6px; vertical-align:middle;">Promo Email</td>
        <td style="width:16px;"></td>
        <td style="width:12px; height:12px; background:#b8945a; border-radius:2px; vertical-align:middle;"></td>
        <td style="font-size:8pt; color:#b8945a; font-weight:500; padding-left:6px; vertical-align:middle;">Referral Email</td>
      </tr></table>
    </div>

    <!-- WEEK 1 -->
    <div style="border:1px solid #F0E9DC; border-radius:4px; overflow:hidden; margin-bottom:10px; page-break-inside:avoid;">
      <div style="background:#3D5440; padding:8px 16px;">
        <span style="font-size:8pt; font-weight:500; letter-spacing:0.12em; text-transform:uppercase; color:rgba(255,255,255,0.8);">Week 1</span>
      </div>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:14.28%; padding:10px 12px; border-right:1px solid #F0E9DC; vertical-align:top; background:#F9F5EE;">
            <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Mon</div>
            <div style="font-size:8pt; font-weight:400; color:#fff; background:#5C7A5E; padding:3px 7px; border-radius:3px; line-height:1.4; margin-bottom:3px;">Caption 1</div>
            <div style="font-size:7pt; font-weight:400; color:#5C7A5E; background:rgba(92,122,94,0.1); padding:2px 7px; border-radius:3px; line-height:1.4;">SMS 1</div>
          </td>
          <td style="width:14.28%; padding:10px 12px; border-right:1px solid #F0E9DC; vertical-align:top;">
            <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Tue</div>
            <div style="font-size:8pt; font-weight:400; color:#fff; background:#7A6EA0; padding:3px 7px; border-radius:3px; line-height:1.4;">Reactivation 1</div>
          </td>
          <td style="width:14.28%; padding:10px 12px; border-right:1px solid #F0E9DC; vertical-align:top; background:#F9F5EE;">
            <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Wed</div>
            <div style="font-size:8pt; font-weight:400; color:#fff; background:#5C7A5E; padding:3px 7px; border-radius:3px; line-height:1.4; margin-bottom:3px;">Caption 2</div>
            <div style="font-size:7pt; font-weight:400; color:#5C7A5E; background:rgba(92,122,94,0.1); padding:2px 7px; border-radius:3px; line-height:1.4;">SMS 2</div>
          </td>
          <td style="width:14.28%; padding:10px 12px; border-right:1px solid #F0E9DC; vertical-align:top;">
            <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Thu</div>
            <div style="font-size:8pt; color:#aaa; font-style:italic;">—</div>
          </td>
          <td style="width:14.28%; padding:10px 12px; border-right:1px solid #F0E9DC; vertical-align:top; background:#F9F5EE;">
            <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Fri</div>
            <div style="font-size:8pt; font-weight:400; color:#fff; background:#5C7A5E; padding:3px 7px; border-radius:3px; line-height:1.4; margin-bottom:3px;">Caption 3</div>
            <div style="font-size:7pt; font-weight:400; color:#5C7A5E; background:rgba(92,122,94,0.1); padding:2px 7px; border-radius:3px; line-height:1.4;">SMS 3</div>
          </td>
          <td style="width:14.28%; padding:10px 12px; border-right:1px solid #F0E9DC; vertical-align:top;">
            <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Sat</div>
            <div style="font-size:8pt; font-weight:400; color:#fff; background:#D4A5A0; padding:3px 7px; border-radius:3px; line-height:1.4;">Promo Email</div>
          </td>
          <td style="width:14.28%; padding:10px 12px; vertical-align:top; background:#F9F5EE;">
            <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Sun</div>
            <div style="font-size:8pt; color:#aaa; font-style:italic;">—</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- WEEK 2 -->
    <div style="border:1px solid #F0E9DC; border-radius:4px; overflow:hidden; margin-bottom:10px; page-break-inside:avoid;">
      <div style="background:#3D5440; padding:8px 16px;">
        <span style="font-size:8pt; font-weight:500; letter-spacing:0.12em; text-transform:uppercase; color:rgba(255,255,255,0.8);">Week 2</span>
      </div>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:14.28%; padding:10px 12px; border-right:1px solid #F0E9DC; vertical-align:top; background:#F9F5EE;">
            <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Mon</div>
            <div style="font-size:8pt; font-weight:400; color:#fff; background:#5C7A5E; padding:3px 7px; border-radius:3px; line-height:1.4; margin-bottom:3px;">Caption 4</div>
            <div style="font-size:7pt; font-weight:400; color:#5C7A5E; background:rgba(92,122,94,0.1); padding:2px 7px; border-radius:3px; line-height:1.4;">SMS 4</div>
          </td>
          <td style="width:14.28%; padding:10px 12px; border-right:1px solid #F0E9DC; vertical-align:top;">
            <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Tue</div>
            <div style="font-size:8pt; font-weight:400; color:#fff; background:#7A6EA0; padding:3px 7px; border-radius:3px; line-height:1.4;">Reactivation 2</div>
          </td>
          <td style="width:14.28%; padding:10px 12px; border-right:1px solid #F0E9DC; vertical-align:top; background:#F9F5EE;">
            <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Wed</div>
            <div style="font-size:8pt; font-weight:400; color:#fff; background:#5C7A5E; padding:3px 7px; border-radius:3px; line-height:1.4; margin-bottom:3px;">Caption 5</div>
            <div style="font-size:7pt; font-weight:400; color:#5C7A5E; background:rgba(92,122,94,0.1); padding:2px 7px; border-radius:3px; line-height:1.4;">SMS 5</div>
          </td>
          <td style="width:14.28%; padding:10px 12px; border-right:1px solid #F0E9DC; vertical-align:top;">
            <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Thu</div>
            <div style="font-size:8pt; color:#aaa; font-style:italic;">—</div>
          </td>
          <td style="width:14.28%; padding:10px 12px; border-right:1px solid #F0E9DC; vertical-align:top; background:#F9F5EE;">
            <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Fri</div>
            <div style="font-size:8pt; font-weight:400; color:#fff; background:#5C7A5E; padding:3px 7px; border-radius:3px; line-height:1.4; margin-bottom:3px;">Caption 6</div>
            <div style="font-size:7pt; font-weight:400; color:#5C7A5E; background:rgba(92,122,94,0.1); padding:2px 7px; border-radius:3px; line-height:1.4;">SMS 6</div>
          </td>
          <td style="width:14.28%; padding:10px 12px; border-right:1px solid #F0E9DC; vertical-align:top;">
            <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Sat</div>
            <div style="font-size:8pt; color:#aaa; font-style:italic;">—</div>
          </td>
          <td style="width:14.28%; padding:10px 12px; vertical-align:top; background:#F9F5EE;">
            <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Sun</div>
            <div style="font-size:8pt; color:#aaa; font-style:italic;">—</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- WEEK 3 -->
    <div style="border:1px solid #F0E9DC; border-radius:4px; overflow:hidden; margin-bottom:10px; page-break-inside:avoid;">
      <div style="background:#3D5440; padding:8px 16px;">
        <span style="font-size:8pt; font-weight:500; letter-spacing:0.12em; text-transform:uppercase; color:rgba(255,255,255,0.8);">Week 3</span>
      </div>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:14.28%; padding:10px 12px; border-right:1px solid #F0E9DC; vertical-align:top; background:#F9F5EE;">
            <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Mon</div>
            <div style="font-size:8pt; font-weight:400; color:#fff; background:#5C7A5E; padding:3px 7px; border-radius:3px; line-height:1.4; margin-bottom:3px;">Caption 7</div>
            <div style="font-size:7pt; font-weight:400; color:#5C7A5E; background:rgba(92,122,94,0.1); padding:2px 7px; border-radius:3px; line-height:1.4;">SMS 7</div>
          </td>
          <td style="width:14.28%; padding:10px 12px; border-right:1px solid #F0E9DC; vertical-align:top;">
            <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Tue</div>
            <div style="font-size:8pt; font-weight:400; color:#fff; background:#7A6EA0; padding:3px 7px; border-radius:3px; line-height:1.4;">Reactivation 3</div>
          </td>
          <td style="width:14.28%; padding:10px 12px; border-right:1px solid #F0E9DC; vertical-align:top; background:#F9F5EE;">
            <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Wed</div>
            <div style="font-size:8pt; font-weight:400; color:#fff; background:#5C7A5E; padding:3px 7px; border-radius:3px; line-height:1.4; margin-bottom:3px;">Caption 8</div>
            <div style="font-size:7pt; font-weight:400; color:#5C7A5E; background:rgba(92,122,94,0.1); padding:2px 7px; border-radius:3px; line-height:1.4;">SMS 8</div>
          </td>
          <td style="width:14.28%; padding:10px 12px; border-right:1px solid #F0E9DC; vertical-align:top;">
            <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Thu</div>
            <div style="font-size:8pt; color:#aaa; font-style:italic;">—</div>
          </td>
          <td style="width:14.28%; padding:10px 12px; border-right:1px solid #F0E9DC; vertical-align:top; background:#F9F5EE;">
            <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Fri</div>
            <div style="font-size:8pt; font-weight:400; color:#fff; background:#5C7A5E; padding:3px 7px; border-radius:3px; line-height:1.4; margin-bottom:3px;">Caption 9</div>
            <div style="font-size:7pt; font-weight:400; color:#5C7A5E; background:rgba(92,122,94,0.1); padding:2px 7px; border-radius:3px; line-height:1.4;">SMS 9</div>
          </td>
          <td style="width:14.28%; padding:10px 12px; border-right:1px solid #F0E9DC; vertical-align:top;">
            <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Sat</div>
            <div style="font-size:8pt; font-weight:400; color:#fff; background:#b8945a; padding:3px 7px; border-radius:3px; line-height:1.4;">Referral Email</div>
          </td>
          <td style="width:14.28%; padding:10px 12px; vertical-align:top; background:#F9F5EE;">
            <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Sun</div>
            <div style="font-size:8pt; color:#aaa; font-style:italic;">—</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- WEEK 4 -->
    <div style="border:1px solid #F0E9DC; border-radius:4px; overflow:hidden; margin-bottom:10px; page-break-inside:avoid;">
      <div style="background:#3D5440; padding:8px 16px;">
        <span style="font-size:8pt; font-weight:500; letter-spacing:0.12em; text-transform:uppercase; color:rgba(255,255,255,0.8);">Week 4</span>
      </div>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:14.28%; padding:10px 12px; border-right:1px solid #F0E9DC; vertical-align:top; background:#F9F5EE;">
            <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Mon</div>
            <div style="font-size:8pt; font-weight:400; color:#fff; background:#5C7A5E; padding:3px 7px; border-radius:3px; line-height:1.4; margin-bottom:3px;">Caption 10</div>
            <div style="font-size:7pt; font-weight:400; color:#5C7A5E; background:rgba(92,122,94,0.1); padding:2px 7px; border-radius:3px; line-height:1.4;">SMS 10</div>
          </td>
          <td style="width:14.28%; padding:10px 12px; border-right:1px solid #F0E9DC; vertical-align:top;">
            <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Tue</div>
            <div style="font-size:8pt; color:#aaa; font-style:italic;">—</div>
          </td>
          <td style="width:14.28%; padding:10px 12px; border-right:1px solid #F0E9DC; vertical-align:top; background:#F9F5EE;">
            <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Wed</div>
            <div style="font-size:8pt; font-weight:400; color:#fff; background:#5C7A5E; padding:3px 7px; border-radius:3px; line-height:1.4; margin-bottom:3px;">Caption 11</div>
            <div style="font-size:7pt; font-weight:400; color:#5C7A5E; background:rgba(92,122,94,0.1); padding:2px 7px; border-radius:3px; line-height:1.4;">SMS 11</div>
          </td>
          <td style="width:14.28%; padding:10px 12px; border-right:1px solid #F0E9DC; vertical-align:top;">
            <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Thu</div>
            <div style="font-size:8pt; color:#aaa; font-style:italic;">—</div>
          </td>
          <td style="width:14.28%; padding:10px 12px; border-right:1px solid #F0E9DC; vertical-align:top; background:#F9F5EE;">
            <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Fri</div>
            <div style="font-size:8pt; font-weight:400; color:#fff; background:#5C7A5E; padding:3px 7px; border-radius:3px; line-height:1.4; margin-bottom:3px;">Caption 12</div>
            <div style="font-size:7pt; font-weight:400; color:#5C7A5E; background:rgba(92,122,94,0.1); padding:2px 7px; border-radius:3px; line-height:1.4;">SMS 12</div>
          </td>
          <td style="width:14.28%; padding:10px 12px; border-right:1px solid #F0E9DC; vertical-align:top;">
            <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Sat</div>
            <div style="font-size:8pt; color:#aaa; font-style:italic;">—</div>
          </td>
          <td style="width:14.28%; padding:10px 12px; vertical-align:top; background:#F9F5EE;">
            <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Sun</div>
            <div style="font-size:8pt; color:#aaa; font-style:italic;">—</div>
          </td>
        </tr>
      </table>
    </div>
  </div>

  <!-- SOCIAL CAPTIONS -->
  <div style="padding:48px 64px 16px; page-break-before:always;">
    <div style="font-size:8pt; font-weight:500; letter-spacing:0.16em; text-transform:uppercase; color:#5C7A5E; margin-bottom:8px;">Section 02</div>
    <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#3D5440; line-height:1.1; margin-bottom:6px;">Social Captions <em style="font-style:italic; color:#D4A5A0;">+ Images.</em></div>
    <div style="font-size:9.5pt; font-weight:300; color:#7A7269; margin-bottom:24px; line-height:1.6;">12 ready-to-post captions with image suggestions. Copy the caption, grab your image, add the hashtags, and post.</div>
    <table width="100%" cellpadding="0" cellspacing="0">${captionsHtml}</table>
  </div>

  <!-- SMS CAPTIONS -->
  <div style="padding:48px 64px 16px; page-break-before:always;">
    <div style="font-size:8pt; font-weight:500; letter-spacing:0.16em; text-transform:uppercase; color:#5C7A5E; margin-bottom:8px;">Section 03</div>
    <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#3D5440; line-height:1.1; margin-bottom:6px;">SMS <em style="font-style:italic; color:#D4A5A0;">Captions.</em></div>
    <div style="font-size:9.5pt; font-weight:300; color:#7A7269; margin-bottom:24px; line-height:1.6;">12 short-form versions of your social captions for SMS marketing platforms like Podium or Birdeye. Each is under 160 characters — no hashtags needed.</div>
    <table width="100%" cellpadding="0" cellspacing="0">${smsCaptionsHtml}</table>
  </div>

  <!-- GBP POSTS -->
  <div style="padding:48px 64px 16px; page-break-before:always;">
    <div style="font-size:8pt; font-weight:500; letter-spacing:0.16em; text-transform:uppercase; color:#5C7A5E; margin-bottom:8px;">Section 04</div>
    <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#3D5440; line-height:1.1; margin-bottom:6px;">Google Business <em style="font-style:italic; color:#D4A5A0;">Profile Posts.</em></div>
    <div style="font-size:9.5pt; font-weight:300; color:#7A7269; margin-bottom:24px; line-height:1.6;">Post one per week to keep your Google listing active. No hashtags needed for GBP posts.</div>
    <table width="100%" cellpadding="0" cellspacing="0">${gbpHtml}</table>
  </div>

  <!-- REACTIVATION EMAILS -->
  <div style="padding:48px 64px 16px; page-break-before:always;">
    <div style="font-size:8pt; font-weight:500; letter-spacing:0.16em; text-transform:uppercase; color:#5C7A5E; margin-bottom:8px;">Section 05</div>
    <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#3D5440; line-height:1.1; margin-bottom:6px;">Reactivation <em style="font-style:italic; color:#D4A5A0;">Email Sequence.</em></div>
    <div style="font-size:9.5pt; font-weight:300; color:#7A7269; margin-bottom:24px; line-height:1.6;">3 emails to re-engage patients inactive 60–90 days. Send on the first 3 Tuesdays of the month. Replace [PATIENT NAME] with your merge tag and [BOOKING LINK] with your booking URL.</div>
    ${reactivationHtml}
  </div>

  <!-- PROMO EMAIL -->
  <div style="padding:48px 64px 16px; page-break-before:always;">
    <div style="font-size:8pt; font-weight:500; letter-spacing:0.16em; text-transform:uppercase; color:#5C7A5E; margin-bottom:8px;">Section 06</div>
    <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#3D5440; line-height:1.1; margin-bottom:6px;">Monthly <em style="font-style:italic; color:#D4A5A0;">Promo Email.</em></div>
    <div style="font-size:9.5pt; font-weight:300; color:#7A7269; margin-bottom:24px; line-height:1.6;">Send this to your full patient list on the first Saturday of the month to announce this month's offer or seasonal push.</div>
    <div style="border:1px solid #F0E9DC; border-radius:4px; overflow:hidden; margin-bottom:16px; page-break-inside:avoid;">
      <div style="background:#F0E9DC; padding:10px 18px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="font-size:7.5pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269;">Promotional Email — Full List</td>
          <td style="text-align:right;"><span style="font-size:7.5pt; font-weight:500; color:#b87a74; background:rgba(212,165,160,0.2); padding:2px 10px; border-radius:20px;">Send Week 1 Saturday</span></td>
        </tr></table>
      </div>
      <div style="padding:18px;">
        <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:3px;">Subject Line</div>
        <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:15pt; font-weight:500; color:#3D5440; margin-bottom:3px; line-height:1.2;">${promo_email.subject}</div>
        <div style="font-size:8.5pt; font-style:italic; color:#7A7269; margin-bottom:14px; padding-bottom:14px; border-bottom:1px solid #F0E9DC;">Preview text: ${promo_email.preview_text}</div>
        <div style="font-size:9.5pt; font-weight:300; line-height:1.8; color:#2C2C2C;">${promo_email.body.split(' ').slice(0, 175).join(' ').replace(/\n/g, '<br/>')}${promo_email.body.split(' ').length > 175 ? '...' : ''}</div>
      </div>
    </div>
  </div>

  <!-- REFERRAL EMAIL -->
  <div style="padding:48px 64px 16px; page-break-before:always;">
    <div style="font-size:8pt; font-weight:500; letter-spacing:0.16em; text-transform:uppercase; color:#5C7A5E; margin-bottom:8px;">Section 07</div>
    <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#3D5440; line-height:1.1; margin-bottom:6px;">Monthly <em style="font-style:italic; color:#D4A5A0;">Referral Email.</em></div>
    <div style="font-size:9.5pt; font-weight:300; color:#7A7269; margin-bottom:24px; line-height:1.6;">Send this to your full patient list on the third Saturday of the month to encourage referrals. Replace [BOOKING LINK] with your booking URL.</div>
    <div style="border:1px solid #F0E9DC; border-radius:4px; overflow:hidden; margin-bottom:16px; page-break-inside:avoid;">
      <div style="background:#F0E9DC; padding:10px 18px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="font-size:7.5pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269;">Referral Email — Full List</td>
          <td style="text-align:right;"><span style="font-size:7.5pt; font-weight:500; color:#b8945a; background:rgba(184,148,90,0.15); padding:2px 10px; border-radius:20px;">Send Week 3 Saturday</span></td>
        </tr></table>
      </div>
      <div style="padding:18px;">
        <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:3px;">Subject Line</div>
        <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:15pt; font-weight:500; color:#3D5440; margin-bottom:3px; line-height:1.2;">${referral_email.subject || ''}</div>
        <div style="font-size:8.5pt; font-style:italic; color:#7A7269; margin-bottom:14px; padding-bottom:14px; border-bottom:1px solid #F0E9DC;">Preview text: ${referral_email.preview_text || ''}</div>
        <div style="font-size:9.5pt; font-weight:300; line-height:1.8; color:#2C2C2C;">${(referral_email.body || '').replace(/\n/g, '<br/>')}</div>
      </div>
    </div>
  </div>

  <!-- CHECKLIST / BACK MATTER -->
  <div style="background:#F0E9DC; padding:64px 72px; page-break-before:always; min-height:100vh;">
    <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:32pt; font-weight:300; color:#3D5440; line-height:1.1; margin-bottom:12px;">
      Your monthly<br/><em style="font-style:italic; color:#D4A5A0;">checklist.</em>
    </div>
    <div style="font-size:10.5pt; font-weight:300; color:#7A7269; line-height:1.7; max-width:480px; margin-bottom:36px;">
      Before you close this pack, make sure everything is scheduled and ready to go.
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
      <tr><td style="padding:14px 18px; background:white; border-radius:4px; border:1px solid rgba(92,122,94,0.15); margin-bottom:10px; display:block;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="width:26px; vertical-align:top; padding-top:2px;"><span style="display:inline-block; width:16px; height:16px; border:1.5px solid rgba(92,122,94,0.3); border-radius:3px;"></span></td>
          <td style="font-size:9.5pt; font-weight:300; color:#2C2C2C; line-height:1.5; vertical-align:top;"><strong style="font-weight:500; color:#3D5440;">Social captions scheduled</strong> — 12 captions loaded and ready to post 3x/week</td>
        </tr></table>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
      <tr><td style="padding:14px 18px; background:white; border-radius:4px; border:1px solid rgba(92,122,94,0.15);">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="width:26px; vertical-align:top; padding-top:2px;"><span style="display:inline-block; width:16px; height:16px; border:1.5px solid rgba(92,122,94,0.3); border-radius:3px;"></span></td>
          <td style="font-size:9.5pt; font-weight:300; color:#2C2C2C; line-height:1.5; vertical-align:top;"><strong style="font-weight:500; color:#3D5440;">Reactivation sequence set up</strong> — 3-email sequence targeting patients inactive 60–90 days</td>
        </tr></table>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
      <tr><td style="padding:14px 18px; background:white; border-radius:4px; border:1px solid rgba(92,122,94,0.15);">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="width:26px; vertical-align:top; padding-top:2px;"><span style="display:inline-block; width:16px; height:16px; border:1.5px solid rgba(92,122,94,0.3); border-radius:3px;"></span></td>
          <td style="font-size:9.5pt; font-weight:300; color:#2C2C2C; line-height:1.5; vertical-align:top;"><strong style="font-weight:500; color:#3D5440;">Promo email sent</strong> — monthly promotional email delivered to your full patient list</td>
        </tr></table>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
      <tr><td style="padding:14px 18px; background:white; border-radius:4px; border:1px solid rgba(92,122,94,0.15);">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="width:26px; vertical-align:top; padding-top:2px;"><span style="display:inline-block; width:16px; height:16px; border:1.5px solid rgba(92,122,94,0.3); border-radius:3px;"></span></td>
          <td style="font-size:9.5pt; font-weight:300; color:#2C2C2C; line-height:1.5; vertical-align:top;"><strong style="font-weight:500; color:#3D5440;">Google Business posts scheduled</strong> — 4 posts ready, one per week throughout the month</td>
        </tr></table>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
      <tr><td style="padding:14px 18px; background:white; border-radius:4px; border:1px solid rgba(92,122,94,0.15);">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="width:26px; vertical-align:top; padding-top:2px;"><span style="display:inline-block; width:16px; height:16px; border:1.5px solid rgba(92,122,94,0.3); border-radius:3px;"></span></td>
          <td style="font-size:9.5pt; font-weight:300; color:#2C2C2C; line-height:1.5; vertical-align:top;"><strong style="font-weight:500; color:#3D5440;">[BOOKING LINK] replaced</strong> — all booking link placeholders updated with your actual URL</td>
        </tr></table>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:40px;">
      <tr><td style="padding:14px 18px; background:white; border-radius:4px; border:1px solid rgba(92,122,94,0.15);">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="width:26px; vertical-align:top; padding-top:2px;"><span style="display:inline-block; width:16px; height:16px; border:1.5px solid rgba(92,122,94,0.3); border-radius:3px;"></span></td>
          <td style="font-size:9.5pt; font-weight:300; color:#2C2C2C; line-height:1.5; vertical-align:top;"><strong style="font-weight:500; color:#3D5440;">Monthly update form submitted</strong> — fill out your 3-question update at flourishglow.com/update</td>
        </tr></table>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
      <tr><td style="padding:14px 18px; background:white; border-radius:4px; border:1px solid rgba(92,122,94,0.15);">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="width:26px; vertical-align:top; padding-top:2px;"><span style="display:inline-block; width:16px; height:16px; border:1.5px solid rgba(92,122,94,0.3); border-radius:3px;"></span></td>
          <td style="font-size:9.5pt; font-weight:300; color:#2C2C2C; line-height:1.5; vertical-align:top;"><strong style="font-weight:500; color:#3D5440;">Referral email sent</strong> — sent to your full patient list to drive word-of-mouth referrals</td>
        </tr></table>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
      <tr><td style="padding:14px 18px; background:white; border-radius:4px; border:1px solid rgba(92,122,94,0.15);">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="width:26px; vertical-align:top; padding-top:2px;"><span style="display:inline-block; width:16px; height:16px; border:1.5px solid rgba(92,122,94,0.3); border-radius:3px;"></span></td>
          <td style="font-size:9.5pt; font-weight:300; color:#2C2C2C; line-height:1.5; vertical-align:top;"><strong style="font-weight:500; color:#3D5440;">SMS captions loaded</strong> — 12 short-form captions ready in your SMS platform</td>
        </tr></table>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:40px;">
      <tr><td style="padding:14px 18px; background:white; border-radius:4px; border:1px solid rgba(92,122,94,0.15);">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="width:26px; vertical-align:top; padding-top:2px;"><span style="display:inline-block; width:16px; height:16px; border:1.5px solid rgba(92,122,94,0.3); border-radius:3px;"></span></td>
          <td style="font-size:9.5pt; font-weight:300; color:#2C2C2C; line-height:1.5; vertical-align:top;"><strong style="font-weight:500; color:#3D5440;">Content calendar reviewed</strong> — you know exactly what to post and send each week this month</td>
        </tr></table>
      </td></tr>
    </table>

    <div style="border-top:1px solid rgba(92,122,94,0.2); padding-top:24px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="vertical-align:top;">
          <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:20pt; font-weight:400; color:#3D5440;">Flourish<span style="color:#D4A5A0;">Glow</span></div>
          <div style="font-size:8.5pt; color:#7A7269; margin-top:4px; letter-spacing:0.06em;">Done-for-you content for wellness practices</div>
        </td>
        <td style="text-align:right; vertical-align:top; font-size:8.5pt; color:#7A7269; line-height:1.8;">
          flourishglow.com<br/>
          hello@flourishglow.com<br/>
          <span style="font-size:7.5pt; color:rgba(122,114,105,0.6);">Questions? Just reply to this email.</span>
        </td>
      </tr></table>
    </div>
  </div>

</body>
</html>`

    // Call PDFShift API
    const pdfResponse = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`api:${process.env.PDFSHIFT_API_KEY}`).toString('base64'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source: html,
        landscape: false,
        use_print: false,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        format: 'A4'
      })
    })

    if (!pdfResponse.ok) {
      const error = await pdfResponse.text()
      console.error('PDFShift error:', error)
      return res.status(500).json({ error: 'PDF generation failed', details: error })
    }

    // Get PDF as buffer
    const pdfBuffer = await pdfResponse.arrayBuffer()
    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64')

    // Upload to Supabase Storage
    const fileName = `${pack_id}-${Date.now()}.pdf`
    const uploadResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/packs/${fileName}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/pdf',
          'x-upsert': 'true'
        },
        body: Buffer.from(pdfBuffer)
      }
    )

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text()
      console.error('Supabase Storage upload error:', error)
      return res.status(500).json({ error: 'Storage upload failed', details: error })
    }

    // Build the storage URL
    const pdfUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/packs/${fileName}`

    // Update pack record with pdf_url
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
          pdf_url: pdfUrl,
          pdf_base64: pdfBase64,
          generation_status: 'generated'
        })
      }
    )

    console.log('PDF generated and stored:', pdfUrl)

    return res.status(200).json({
      success: true,
      pdf_url: pdfUrl,
      pdf_base64: pdfBase64,
      file_name: fileName
    })

  } catch (err) {
    console.error('Generate PDF error:', err)
    return res.status(500).json({ error: 'Something went wrong', details: err.message })
  }
}
