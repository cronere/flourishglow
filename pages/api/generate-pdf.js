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

    console.log('Pack fields:', {
      has_strategy_note: !!strategy_note,
      social_captions_length: Array.isArray(social_captions) ? social_captions.length : typeof social_captions,
      reactivation_length: Array.isArray(reactivation_sequence) ? reactivation_sequence.length : typeof reactivation_sequence,
      promo_email_type: typeof promo_email,
      gbp_posts_length: Array.isArray(gbp_posts) ? gbp_posts.length : typeof gbp_posts
    })

    // Build social captions HTML
    const captionCard = (c) => `
      <td class="caption-cell">
        <div class="caption-card">
          <div class="caption-card-header">
            <table class="caption-header-table"><tr>
              <td><span class="caption-num">Caption ${c.caption_number} of 12</span></td>
              <td style="text-align:right;"><span class="caption-angle-badge">${c.angle}</span></td>
            </tr></table>
          </div>
          <div class="caption-body">
            <div class="caption-image-box"><span class="caption-image-label">Branded Image</span></div>
            <div class="caption-text">${c.caption.replace(/\n/g, '<br/>')}</div>
            <div class="caption-hashtags">${c.hashtags}</div>
            <div class="caption-suggestion">📸 ${c.image_suggestion}</div>
          </div>
        </div>
      </td>`

    const captions1to6 = social_captions.slice(0, 6).reduce((rows, c, i) => {
      if (i % 2 === 0) rows.push('<tr>')
      rows[rows.length - 1] += captionCard(c)
      if (i % 2 === 1) rows[rows.length - 1] += '</tr>'
      return rows
    }, []).join('')

    const captions7to12 = social_captions.slice(6, 12).reduce((rows, c, i) => {
      if (i % 2 === 0) rows.push('<tr>')
      rows[rows.length - 1] += captionCard(c)
      if (i % 2 === 1) rows[rows.length - 1] += '</tr>'
      return rows
    }, []).join('')

    // Build reactivation emails HTML
    const reactivationHtml = reactivation_sequence.map(e => `
      <div class="email-card">
        <div class="email-card-header">
          <table class="email-header-table"><tr>
            <td><span class="email-num">Email ${e.email_number} of 3</span></td>
            <td style="text-align:right;"><span class="email-send-day">Send Day ${e.send_day}</span></td>
          </tr></table>
        </div>
        <div class="email-card-body">
          <div class="email-subject-label">Subject Line</div>
          <div class="email-subject">${e.subject}</div>
          <div class="email-preview">Preview text: ${e.preview_text}</div>
          <div class="email-body">${e.body.replace(/\n/g, '<br/>')}</div>
        </div>
      </div>
    `).join('')

    // Build GBP posts HTML
    const gbpTypeClass = (type) => {
      const map = { 'Offer': 'offer', 'Educational': 'educational', 'Seasonal': 'seasonal', 'Review Request': 'review' }
      return map[type] || 'offer'
    }

    const gbpHtml = gbp_posts.reduce((rows, p, i) => {
      if (i % 2 === 0) rows.push('<tr>')
      rows[rows.length - 1] += `
        <td class="gbp-cell">
          <div class="gbp-card">
            <div class="gbp-card-header">
              <table class="gbp-header-table"><tr>
                <td><span class="gbp-week">Week ${p.week}</span></td>
                <td style="text-align:right;"><span class="gbp-type-badge gbp-type-${gbpTypeClass(p.type)}">${p.type}</span></td>
              </tr></table>
            </div>
            <div class="gbp-card-body">
              <div class="gbp-text">${p.post.replace(/\n/g, '<br/>')}</div>
            </div>
          </div>
        </td>`
      if (i % 2 === 1) rows[rows.length - 1] += '</tr>'
      return rows
    }, []).join('')

    // Build complete HTML
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${business_name} — Content Pack</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

    @page {
      size: A4;
      margin: 0;
    }

    :root {
      --cream: #F9F5EE; --cream-dark: #F0E9DC; --sage: #5C7A5E;
      --sage-dark: #3D5440; --sage-light: #8AAD8C; --blush: #D4A5A0;
      --charcoal: #2C2C2C; --warm-gray: #7A7269;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'DM Sans', Arial, sans-serif;
      background: #fff;
      color: var(--charcoal);
      font-size: 11pt;
      line-height: 1.5;
      width: 794px;
    }

    /* ── COVER ── */
    .cover {
      background: #3D5440;
      width: 794px;
      height: 1123px;
      padding: 72px;
      page-break-after: always;
      position: relative;
    }

    .cover-top { margin-bottom: 240px; }
    .cover-logo { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32pt; font-weight: 400; color: #fff; letter-spacing: 0.02em; }
    .cover-logo span { color: #D4A5A0; }
    .cover-tagline { font-size: 9pt; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-top: 8px; }
    .cover-label { font-size: 9pt; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; color: #8AAD8C; margin-bottom: 20px; }
    .cover-title { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 52pt; font-weight: 300; line-height: 1.05; color: #fff; margin-bottom: 24px; }
    .cover-title em { font-style: italic; color: #D4A5A0; }
    .cover-business { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 20pt; font-weight: 400; color: rgba(255,255,255,0.7); margin-bottom: 8px; }
    .cover-date { font-size: 10pt; font-weight: 300; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); margin-bottom: 48px; }

    .cover-stats { border-top: 1px solid rgba(255,255,255,0.15); padding-top: 28px; }
    .cover-stats table { width: 100%; border-collapse: collapse; }
    .cover-stats td { text-align: center; padding: 0 16px; }
    .cover-stat-number { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28pt; font-weight: 300; color: #fff; line-height: 1; display: block; margin-bottom: 4px; }
    .cover-stat-label { font-size: 8pt; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.35); display: block; }

    /* ── PAGES ── */
    .page { padding: 48px 64px; page-break-after: always; }
    .page-last { padding: 48px 64px; }

    .page-header { margin-bottom: 32px; padding-bottom: 16px; border-bottom: 1px solid #F0E9DC; }
    .page-header table { width: 100%; border-collapse: collapse; }
    .page-header-logo { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 16pt; font-weight: 400; color: #3D5440; }
    .page-header-logo span { color: #D4A5A0; }
    .page-header-info { font-size: 8pt; color: #7A7269; letter-spacing: 0.06em; text-transform: uppercase; text-align: right; }

    .section-eyebrow { font-size: 8pt; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; color: #5C7A5E; margin-bottom: 8px; }
    .section-title { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 26pt; font-weight: 300; color: #3D5440; line-height: 1.1; margin-bottom: 6px; }
    .section-title em { font-style: italic; color: #D4A5A0; }
    .section-sub { font-size: 9.5pt; font-weight: 300; color: #7A7269; margin-bottom: 24px; line-height: 1.6; }

    /* ── STRATEGY ── */
    .strategy-box { background: #3D5440; padding: 24px 28px; border-radius: 4px; margin-bottom: 32px; }
    .strategy-label { font-size: 8pt; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: #8AAD8C; margin-bottom: 10px; }
    .strategy-text { font-size: 10.5pt; font-weight: 300; line-height: 1.8; color: rgba(255,255,255,0.85); font-style: italic; }

    /* ── HOW TO USE — table layout ── */
    .how-to-table { width: 100%; border-collapse: separate; border-spacing: 12px; margin: 0 -12px; margin-bottom: 24px; }
    .how-to-card { padding: 16px; background: #F9F5EE; border-radius: 4px; border: 1px solid #F0E9DC; vertical-align: top; width: 50%; }
    .how-to-icon { font-size: 18pt; margin-bottom: 8px; display: block; }
    .how-to-title { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 13pt; font-weight: 500; color: #3D5440; margin-bottom: 8px; }
    .how-to-step { font-size: 8.5pt; font-weight: 300; color: #7A7269; line-height: 1.6; padding: 3px 0; border-bottom: 1px solid #F0E9DC; }
    .how-to-step:last-child { border-bottom: none; }
    .how-to-num { font-size: 8pt; font-weight: 500; color: #5C7A5E; margin-right: 6px; }

    /* ── CAPTIONS — table layout ── */
    .caption-table { width: 100%; border-collapse: separate; border-spacing: 12px; margin: 0 -12px; }
    .caption-cell { vertical-align: top; width: 50%; }
    .caption-card { border: 1px solid #F0E9DC; border-radius: 4px; overflow: hidden; }
    .caption-card-header { background: #F0E9DC; padding: 7px 12px; }
    .caption-header-table { width: 100%; border-collapse: collapse; }
    .caption-num { font-size: 7.5pt; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: #7A7269; }
    .caption-angle-badge { font-size: 7pt; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: #5C7A5E; background: rgba(92,122,94,0.12); padding: 1px 7px; border-radius: 20px; white-space: nowrap; }
    .caption-body { padding: 12px; }
    .caption-image-box { width: 100%; height: 40px; background: #F0E9DC; border-radius: 3px; margin-bottom: 8px; text-align: center; line-height: 40px; border: 1px dashed rgba(92,122,94,0.25); }
    .caption-image-label { font-size: 6.5pt; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: #5C7A5E; opacity: 0.7; }
    .caption-text { font-size: 9pt; font-weight: 300; line-height: 1.6; color: #2C2C2C; margin-bottom: 7px; }
    .caption-hashtags { font-size: 8pt; color: #D4A5A0; line-height: 1.5; }
    .caption-suggestion { font-size: 7pt; color: #7A7269; font-style: italic; margin-top: 6px; padding-top: 6px; border-top: 1px solid #F0E9DC; }

    /* ── EMAILS ── */
    .email-card { border: 1px solid #F0E9DC; border-radius: 4px; overflow: hidden; margin-bottom: 16px; page-break-inside: avoid; }
    .email-card-header { background: #F0E9DC; padding: 10px 18px; }
    .email-header-table { width: 100%; border-collapse: collapse; }
    .email-num { font-size: 7.5pt; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: #7A7269; }
    .email-send-day { font-size: 7.5pt; font-weight: 500; color: #5C7A5E; background: rgba(92,122,94,0.1); padding: 2px 10px; border-radius: 20px; white-space: nowrap; }
    .email-card-body { padding: 18px; }
    .email-subject-label { font-size: 7pt; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: #7A7269; margin-bottom: 3px; }
    .email-subject { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 15pt; font-weight: 500; color: #3D5440; margin-bottom: 3px; line-height: 1.2; }
    .email-preview { font-size: 8.5pt; font-style: italic; color: #7A7269; margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid #F0E9DC; }
    .email-body { font-size: 9.5pt; font-weight: 300; line-height: 1.8; color: #2C2C2C; }

    /* ── GBP — table layout ── */
    .gbp-table { width: 100%; border-collapse: separate; border-spacing: 12px; margin: 0 -12px; }
    .gbp-cell { vertical-align: top; width: 50%; }
    .gbp-card { border: 1px solid #F0E9DC; border-radius: 4px; overflow: hidden; }
    .gbp-card-header { background: #F0E9DC; padding: 8px 14px; }
    .gbp-header-table { width: 100%; border-collapse: collapse; }
    .gbp-week { font-size: 7.5pt; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: #7A7269; }
    .gbp-type-badge { font-size: 7pt; font-weight: 500; padding: 1px 7px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.06em; white-space: nowrap; }
    .gbp-type-offer { background: rgba(212,165,160,0.2); color: #b87a74; }
    .gbp-type-educational { background: rgba(92,122,94,0.12); color: #5C7A5E; }
    .gbp-type-seasonal { background: rgba(184,148,90,0.15); color: #b8945a; }
    .gbp-type-review { background: rgba(61,84,64,0.1); color: #3D5440; }
    .gbp-card-body { padding: 12px 14px; background: #F9F5EE; }
    .gbp-text { font-size: 9pt; font-weight: 300; line-height: 1.65; color: #2C2C2C; }

    /* ── BACK COVER ── */
    .back-cover {
      background: #F0E9DC;
      width: 794px;
      height: 1123px;
      padding: 72px;
      page-break-before: always;
    }

    .back-cover-title { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 34pt; font-weight: 300; color: #3D5440; line-height: 1.1; margin-bottom: 12px; }
    .back-cover-title em { font-style: italic; color: #D4A5A0; }
    .back-cover-sub { font-size: 10.5pt; font-weight: 300; color: #7A7269; line-height: 1.7; max-width: 480px; margin-bottom: 36px; }
    .checklist-item { display: table; width: 100%; padding: 14px 18px; background: white; border-radius: 4px; border: 1px solid rgba(92,122,94,0.15); margin-bottom: 10px; page-break-inside: avoid; }
    .checklist-box-cell { display: table-cell; width: 26px; vertical-align: top; padding-top: 2px; }
    .checklist-box { width: 16px; height: 16px; border: 1.5px solid rgba(92,122,94,0.3); border-radius: 3px; display: inline-block; }
    .checklist-text-cell { display: table-cell; vertical-align: top; font-size: 9.5pt; font-weight: 300; color: #2C2C2C; line-height: 1.5; }
    .checklist-text-cell strong { font-weight: 500; color: #3D5440; }

    .back-footer { border-top: 1px solid rgba(92,122,94,0.2); padding-top: 24px; margin-top: 36px; }
    .back-footer table { width: 100%; border-collapse: collapse; }
    .back-footer-logo { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 20pt; font-weight: 400; color: #3D5440; }
    .back-footer-logo span { color: #D4A5A0; }
    .back-footer-tagline { font-size: 8.5pt; color: #7A7269; margin-top: 4px; letter-spacing: 0.06em; }
    .back-footer-contact { text-align: right; font-size: 8.5pt; color: #7A7269; line-height: 1.8; }
    .back-footer-contact a { color: #5C7A5E; text-decoration: none; }

    /* ── PAGE FOOTER ── */
    .page-footer { margin-top: 32px; padding-top: 14px; border-top: 1px solid #F0E9DC; }
    .page-footer table { width: 100%; border-collapse: collapse; }
    .page-footer-logo { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 10pt; color: #3D5440; }
    .page-footer-logo span { color: #D4A5A0; }
    .page-footer-info { font-size: 7pt; color: #7A7269; letter-spacing: 0.06em; text-align: right; }

    .divider { height: 1px; background: rgba(92,122,94,0.2); margin: 28px 0; }
  </style>
</head>
<body>

  <!-- COVER -->
  <div class="cover">
    <div class="cover-top">
      <div class="cover-logo">Flourish<span>Glow</span></div>
      <div class="cover-tagline">Done-for-you content for wellness practices</div>
    </div>
    <div>
      <div class="cover-label">Monthly Content Pack</div>
      <div class="cover-title">Your content,<br /><em>ready to post.</em></div>
      <div class="cover-business">${business_name}</div>
      <div class="cover-date">Prepared by FlourishGlow · ${pack_month}</div>
    </div>
    <div class="cover-stats">
      <table><tr>
        <td><span class="cover-stat-number">12</span><span class="cover-stat-label">Social Captions</span></td>
        <td><span class="cover-stat-number">3</span><span class="cover-stat-label">Reactivation Emails</span></td>
        <td><span class="cover-stat-number">1</span><span class="cover-stat-label">Promo Email</span></td>
        <td><span class="cover-stat-number">4</span><span class="cover-stat-label">Google Posts</span></td>
      </tr></table>
    </div>
  </div>

  <!-- STRATEGY + HOW TO USE -->
  <div class="page">
    <div class="page-header">
      <table><tr>
        <td><div class="page-header-logo">Flourish<span>Glow</span></div></td>
        <td><div class="page-header-info">${business_name} · ${pack_month}</div></td>
      </tr></table>
    </div>
    <div class="section-eyebrow">This month's approach</div>
    <div class="section-title">Your <em>strategy note.</em></div>
    <div class="section-sub">A brief overview of the content angles we chose this month and why.</div>
    <div class="strategy-box">
      <div class="strategy-label">From the FlourishGlow team</div>
      <div class="strategy-text">${strategy_note}</div>
    </div>
    <div class="divider"></div>
    <div class="section-eyebrow">How to use this pack</div>
    <div class="section-title">Getting <em>started.</em></div>
    <table class="how-to-table"><tr>
      <td class="how-to-card">
        <span class="how-to-icon">📸</span>
        <div class="how-to-title">Social Captions</div>
        <div class="how-to-step"><span class="how-to-num">1</span>Choose your image or use the suggestion provided</div>
        <div class="how-to-step"><span class="how-to-num">2</span>Copy the caption text exactly as written</div>
        <div class="how-to-step"><span class="how-to-num">3</span>Copy the hashtags and add them to your post</div>
        <div class="how-to-step"><span class="how-to-num">4</span>Post to Instagram and/or Facebook</div>
        <div class="how-to-step"><span class="how-to-num">5</span>Aim for 3 posts per week — Tue, Thu, Sat</div>
      </td>
      <td class="how-to-card">
        <span class="how-to-icon">📧</span>
        <div class="how-to-title">Email Campaigns</div>
        <div class="how-to-step"><span class="how-to-num">1</span>Copy subject line and body into your email platform</div>
        <div class="how-to-step"><span class="how-to-num">2</span>Replace [PATIENT NAME] with your merge tag</div>
        <div class="how-to-step"><span class="how-to-num">3</span>Replace [BOOKING LINK] with your booking URL</div>
        <div class="how-to-step"><span class="how-to-num">4</span>Send reactivation emails to patients inactive 60-90 days</div>
        <div class="how-to-step"><span class="how-to-num">5</span>Send promo email to your full patient list</div>
      </td>
    </tr><tr>
      <td class="how-to-card">
        <span class="how-to-icon">🗺️</span>
        <div class="how-to-title">Google Business Posts</div>
        <div class="how-to-step"><span class="how-to-num">1</span>Go to your Google Business Profile dashboard</div>
        <div class="how-to-step"><span class="how-to-num">2</span>Click Add Update or Add Offer</div>
        <div class="how-to-step"><span class="how-to-num">3</span>Copy the post text and paste it in</div>
        <div class="how-to-step"><span class="how-to-num">4</span>Replace [PHONE] and [WEBSITE] placeholders</div>
        <div class="how-to-step"><span class="how-to-num">5</span>Post once per week throughout the month</div>
      </td>
      <td class="how-to-card">
        <span class="how-to-icon">💡</span>
        <div class="how-to-title">Tips for Best Results</div>
        <div class="how-to-step"><span class="how-to-num">✓</span>Post consistently — 3x/week beats 1x/week every time</div>
        <div class="how-to-step"><span class="how-to-num">✓</span>Feel free to tweak wording to sound more like you</div>
        <div class="how-to-step"><span class="how-to-num">✓</span>Respond to all comments within 24 hours</div>
        <div class="how-to-step"><span class="how-to-num">✓</span>Use your own before/after photos when possible</div>
        <div class="how-to-step"><span class="how-to-num">✓</span>Fill out your monthly update form for tailored content</div>
      </td>
    </tr></table>
    <div class="page-footer">
      <table><tr>
        <td><div class="page-footer-logo">Flourish<span>Glow</span></div></td>
        <td><div class="page-footer-info">${business_name} · ${pack_month} · flourishglow.com</div></td>
      </tr></table>
    </div>
  </div>

  <!-- CAPTIONS 1-6 -->
  <div class="page">
    <div class="page-header">
      <table><tr>
        <td><div class="page-header-logo">Flourish<span>Glow</span></div></td>
        <td><div class="page-header-info">${business_name} · ${pack_month}</div></td>
      </tr></table>
    </div>
    <div class="section-eyebrow">Section 01</div>
    <div class="section-title">Social Captions <em>+ Images.</em></div>
    <div class="section-sub">12 ready-to-post captions with image suggestions. Copy the caption, grab your image, add the hashtags, and post.</div>
    <table class="caption-table">${captions1to6}</table>
    <div class="page-footer">
      <table><tr>
        <td><div class="page-footer-logo">Flourish<span>Glow</span></div></td>
        <td><div class="page-footer-info">${business_name} · ${pack_month} · Page 2 of 6</div></td>
      </tr></table>
    </div>
  </div>

  <!-- CAPTIONS 7-12 -->
  <div class="page">
    <div class="page-header">
      <table><tr>
        <td><div class="page-header-logo">Flourish<span>Glow</span></div></td>
        <td><div class="page-header-info">${business_name} · ${pack_month}</div></td>
      </tr></table>
    </div>
    <div class="section-eyebrow">Section 01 continued</div>
    <div class="section-title">Social Captions <em>7–12.</em></div>
    <table class="caption-table">${captions7to12}</table>
    <div class="page-footer">
      <table><tr>
        <td><div class="page-footer-logo">Flourish<span>Glow</span></div></td>
        <td><div class="page-footer-info">${business_name} · ${pack_month} · Page 3 of 6</div></td>
      </tr></table>
    </div>
  </div>

  <!-- REACTIVATION EMAILS -->
  <div class="page">
    <div class="page-header">
      <table><tr>
        <td><div class="page-header-logo">Flourish<span>Glow</span></div></td>
        <td><div class="page-header-info">${business_name} · ${pack_month}</div></td>
      </tr></table>
    </div>
    <div class="section-eyebrow">Section 02</div>
    <div class="section-title">Reactivation <em>Email Sequence.</em></div>
    <div class="section-sub">3 emails to re-engage patients inactive 60–90 days. Replace [PATIENT NAME] with your merge tag and [BOOKING LINK] with your booking URL.</div>
    ${reactivationHtml}
    <div class="page-footer">
      <table><tr>
        <td><div class="page-footer-logo">Flourish<span>Glow</span></div></td>
        <td><div class="page-footer-info">${business_name} · ${pack_month} · Page 4 of 6</div></td>
      </tr></table>
    </div>
  </div>

  <!-- PROMO EMAIL + GBP -->
  <div class="page">
    <div class="page-header">
      <table><tr>
        <td><div class="page-header-logo">Flourish<span>Glow</span></div></td>
        <td><div class="page-header-info">${business_name} · ${pack_month}</div></td>
      </tr></table>
    </div>
    <div class="section-eyebrow">Section 03</div>
    <div class="section-title">Monthly <em>Promo Email.</em></div>
    <div class="section-sub">Send this to your full patient list to announce this month's offer or seasonal push.</div>
    <div class="email-card" style="margin-bottom:32px;">
      <div class="email-card-header">
        <table class="email-header-table"><tr>
          <td><span class="email-num">Promotional Email — Full List</span></td>
          <td style="text-align:right;"><span class="email-send-day">Send anytime this month</span></td>
        </tr></table>
      </div>
      <div class="email-card-body">
        <div class="email-subject-label">Subject Line</div>
        <div class="email-subject">${promo_email.subject}</div>
        <div class="email-preview">Preview text: ${promo_email.preview_text}</div>
        <div class="email-body">${promo_email.body.replace(/\n/g, '<br/>')}</div>
      </div>
    </div>
    <div class="section-eyebrow">Section 04</div>
    <div class="section-title">Google Business <em>Profile Posts.</em></div>
    <div class="section-sub">Post one per week to keep your Google listing active. No hashtags needed for GBP posts.</div>
    <table class="gbp-table">${gbpHtml}</table>
    <div class="page-footer">
      <table><tr>
        <td><div class="page-footer-logo">Flourish<span>Glow</span></div></td>
        <td><div class="page-footer-info">${business_name} · ${pack_month} · Page 5 of 6</div></td>
      </tr></table>
    </div>
  </div>

  <!-- BACK COVER -->
  <div class="back-cover">
    <div class="back-cover-title">Your monthly<br /><em>checklist.</em></div>
    <div class="back-cover-sub">Before you close this pack, make sure everything is scheduled and ready to go.</div>
    <div class="checklist-item"><div class="checklist-box-cell"><span class="checklist-box"></span></div><div class="checklist-text-cell"><strong>Social captions scheduled</strong> — 12 captions loaded and ready to post 3x/week</div></div>
    <div class="checklist-item"><div class="checklist-box-cell"><span class="checklist-box"></span></div><div class="checklist-text-cell"><strong>Reactivation sequence set up</strong> — 3-email sequence targeting patients inactive 60–90 days</div></div>
    <div class="checklist-item"><div class="checklist-box-cell"><span class="checklist-box"></span></div><div class="checklist-text-cell"><strong>Promo email sent</strong> — monthly promotional email delivered to your full patient list</div></div>
    <div class="checklist-item"><div class="checklist-box-cell"><span class="checklist-box"></span></div><div class="checklist-text-cell"><strong>Google Business posts scheduled</strong> — 4 posts ready, one per week throughout the month</div></div>
    <div class="checklist-item"><div class="checklist-box-cell"><span class="checklist-box"></span></div><div class="checklist-text-cell"><strong>[BOOKING LINK] replaced</strong> — all booking link placeholders updated with your actual URL</div></div>
    <div class="checklist-item"><div class="checklist-box-cell"><span class="checklist-box"></span></div><div class="checklist-text-cell"><strong>Monthly update form submitted</strong> — fill out your 3-question update at flourishglow.com/update</div></div>
    <div class="back-footer">
      <table><tr>
        <td>
          <div class="back-footer-logo">Flourish<span>Glow</span></div>
          <div class="back-footer-tagline">Done-for-you content for wellness practices</div>
        </td>
        <td>
          <div class="back-footer-contact">
            flourishglow.com<br/>
            <a href="mailto:hello@flourishglow.com">hello@flourishglow.com</a><br/>
            <span style="font-size:7.5pt;color:rgba(122,114,105,0.6);">Questions? Just reply to this email.</span>
          </div>
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
