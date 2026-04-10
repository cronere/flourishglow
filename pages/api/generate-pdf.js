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

  try {
    // Fetch pack data directly from Supabase
    const packResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/packs?id=eq.${pack_id}&select=*`,
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

    const safeparse = (val) => {
      if (!val) return null
      if (typeof val === 'object') return val
      if (typeof val === 'string') {
        try { return JSON.parse(val) } catch { return null }
      }
      return null
    }

    const social_captions = safeparse(pack.social_captions)
    const reactivation_sequence = safeparse(pack.reactivation_sequence)
    const promo_email = safeparse(pack.promo_email)
    const gbp_posts = safeparse(pack.gbp_posts)

    console.log('Pack fields:', {
      has_strategy_note: !!strategy_note,
      social_captions_length: Array.isArray(social_captions) ? social_captions.length : typeof social_captions,
      reactivation_length: Array.isArray(reactivation_sequence) ? reactivation_sequence.length : typeof reactivation_sequence,
      promo_email_type: typeof promo_email,
      gbp_posts_length: Array.isArray(gbp_posts) ? gbp_posts.length : typeof gbp_posts
    })

    // Build social captions HTML
    const captionsHtml = social_captions.map(c => `
      <div class="caption-card">
        <div class="caption-card-header">
          <span class="caption-num">Caption ${c.caption_number} of 12</span>
          <span class="caption-angle-badge">${c.angle}</span>
        </div>
        <div class="caption-body">
          <div class="caption-image-placeholder">
            <span class="caption-image-label">Branded Image</span>
          </div>
          <div class="caption-text">${c.caption.replace(/\n/g, '<br/>')}</div>
          <div class="caption-hashtags">${c.hashtags}</div>
          <div class="caption-suggestion">📸 ${c.image_suggestion}</div>
        </div>
      </div>
    `).join('')

    const captions1to6 = social_captions.slice(0, 6).map(c => `
      <div class="caption-card">
        <div class="caption-card-header">
          <span class="caption-num">Caption ${c.caption_number} of 12</span>
          <span class="caption-angle-badge">${c.angle}</span>
        </div>
        <div class="caption-body">
          <div class="caption-image-placeholder">
            <span class="caption-image-label">Branded Image</span>
          </div>
          <div class="caption-text">${c.caption.replace(/\n/g, '<br/>')}</div>
          <div class="caption-hashtags">${c.hashtags}</div>
          <div class="caption-suggestion">📸 ${c.image_suggestion}</div>
        </div>
      </div>
    `).join('')

    const captions7to12 = social_captions.slice(6, 12).map(c => `
      <div class="caption-card">
        <div class="caption-card-header">
          <span class="caption-num">Caption ${c.caption_number} of 12</span>
          <span class="caption-angle-badge">${c.angle}</span>
        </div>
        <div class="caption-body">
          <div class="caption-image-placeholder">
            <span class="caption-image-label">Branded Image</span>
          </div>
          <div class="caption-text">${c.caption.replace(/\n/g, '<br/>')}</div>
          <div class="caption-hashtags">${c.hashtags}</div>
          <div class="caption-suggestion">📸 ${c.image_suggestion}</div>
        </div>
      </div>
    `).join('')

    // Build reactivation emails HTML
    const reactivationHtml = reactivation_sequence.map(e => `
      <div class="email-card">
        <div class="email-card-header">
          <span class="email-num">Email ${e.email_number} of 3</span>
          <span class="email-send-day">Send Day ${e.send_day}</span>
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

    const gbpHtml = gbp_posts.map(p => `
      <div class="gbp-card">
        <div class="gbp-card-header">
          <span class="gbp-week">Week ${p.week}</span>
          <span class="gbp-type-badge gbp-type-${gbpTypeClass(p.type)}">${p.type}</span>
        </div>
        <div class="gbp-card-body">
          <div class="gbp-text">${p.post.replace(/\n/g, '<br/>')}</div>
        </div>
      </div>
    `).join('')

    // Build complete HTML
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${business_name} — Content Pack</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
    :root {
      --cream: #F9F5EE; --cream-dark: #F0E9DC; --sage: #5C7A5E;
      --sage-dark: #3D5440; --sage-light: #8AAD8C; --blush: #D4A5A0;
      --charcoal: #2C2C2C; --warm-gray: #7A7269;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', Arial, sans-serif; background: #fff; color: var(--charcoal); font-size: 11pt; line-height: 1.5; }
    .cover { background: var(--sage-dark); min-height: 100vh; padding: 80px 72px; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; }
    .cover-logo { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32pt; font-weight: 400; color: #fff; letter-spacing: 0.02em; }
    .cover-logo span { color: var(--blush); }
    .cover-tagline { font-size: 9pt; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-top: 8px; }
    .cover-label { font-size: 9pt; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; color: var(--sage-light); margin-bottom: 20px; }
    .cover-title { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 52pt; font-weight: 300; line-height: 1.05; color: #fff; margin-bottom: 24px; }
    .cover-title em { font-style: italic; color: var(--blush); }
    .cover-business { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 20pt; font-weight: 400; color: rgba(255,255,255,0.7); margin-bottom: 8px; }
    .cover-date { font-size: 10pt; font-weight: 300; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); }
    .cover-bottom { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 28px; display: flex; justify-content: space-between; align-items: flex-end; }
    .cover-stat { text-align: center; }
    .cover-stat-number { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28pt; font-weight: 300; color: #fff; line-height: 1; margin-bottom: 4px; }
    .cover-stat-label { font-size: 8pt; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.35); }
    .page { padding: 56px 72px; page-break-after: always; }
    .page:last-child { page-break-after: avoid; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 1px solid var(--cream-dark); }
    .page-header-logo { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 16pt; font-weight: 400; color: var(--sage-dark); }
    .page-header-logo span { color: var(--blush); }
    .page-header-info { text-align: right; font-size: 8pt; color: var(--warm-gray); letter-spacing: 0.06em; text-transform: uppercase; }
    .section-eyebrow { font-size: 8pt; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; color: var(--sage); margin-bottom: 10px; }
    .section-title { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28pt; font-weight: 300; color: var(--sage-dark); line-height: 1.1; margin-bottom: 8px; }
    .section-title em { font-style: italic; color: var(--blush); }
    .section-sub { font-size: 10pt; font-weight: 300; color: var(--warm-gray); margin-bottom: 32px; line-height: 1.6; }
    .strategy-box { background: var(--sage-dark); padding: 28px 32px; border-radius: 4px; margin-bottom: 40px; }
    .strategy-label { font-size: 8pt; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: var(--sage-light); margin-bottom: 12px; }
    .strategy-text { font-size: 11pt; font-weight: 300; line-height: 1.8; color: rgba(255,255,255,0.85); font-style: italic; }
    .how-to-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
    .how-to-card { padding: 20px; background: var(--cream); border-radius: 4px; border: 1px solid var(--cream-dark); }
    .how-to-icon { font-size: 20pt; margin-bottom: 10px; }
    .how-to-title { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 14pt; font-weight: 500; color: var(--sage-dark); margin-bottom: 8px; }
    .how-to-steps { list-style: none; padding: 0; }
    .how-to-step { font-size: 9pt; font-weight: 300; color: var(--warm-gray); line-height: 1.6; padding: 4px 0; border-bottom: 1px solid var(--cream-dark); display: flex; gap: 8px; align-items: flex-start; }
    .how-to-step:last-child { border-bottom: none; }
    .how-to-step-num { font-size: 8pt; font-weight: 500; color: var(--sage); flex-shrink: 0; margin-top: 1px; }
    .caption-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .caption-card { border: 1px solid var(--cream-dark); border-radius: 4px; overflow: hidden; page-break-inside: avoid; }
    .caption-card-header { background: var(--cream-dark); padding: 8px 14px; display: flex; align-items: center; justify-content: space-between; }
    .caption-num { font-size: 8pt; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--warm-gray); }
    .caption-angle-badge { font-size: 7.5pt; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--sage); background: rgba(92,122,94,0.12); padding: 2px 8px; border-radius: 20px; }
    .caption-body { padding: 14px; }
    .caption-image-placeholder { width: 100%; height: 48px; background: linear-gradient(135deg, rgba(92,122,94,0.1), rgba(212,165,160,0.12)); border-radius: 3px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; border: 1px dashed rgba(92,122,94,0.2); }
    .caption-image-label { font-size: 7pt; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--sage); opacity: 0.6; }
    .caption-text { font-size: 9.5pt; font-weight: 300; line-height: 1.65; color: var(--charcoal); margin-bottom: 8px; }
    .caption-hashtags { font-size: 8.5pt; color: var(--blush); line-height: 1.5; }
    .caption-suggestion { font-size: 7.5pt; color: var(--warm-gray); font-style: italic; margin-top: 6px; padding-top: 6px; border-top: 1px solid var(--cream-dark); }
    .email-card { border: 1px solid var(--cream-dark); border-radius: 4px; overflow: hidden; margin-bottom: 20px; page-break-inside: avoid; }
    .email-card-header { background: var(--cream-dark); padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; }
    .email-num { font-size: 8pt; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--warm-gray); }
    .email-send-day { font-size: 8pt; font-weight: 500; color: var(--sage); background: rgba(92,122,94,0.1); padding: 2px 10px; border-radius: 20px; }
    .email-card-body { padding: 20px; }
    .email-subject-label { font-size: 7.5pt; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--warm-gray); margin-bottom: 4px; }
    .email-subject { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 16pt; font-weight: 500; color: var(--sage-dark); margin-bottom: 4px; line-height: 1.2; }
    .email-preview { font-size: 9pt; font-style: italic; color: var(--warm-gray); margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--cream-dark); }
    .email-body { font-size: 10pt; font-weight: 300; line-height: 1.8; color: var(--charcoal); }
    .gbp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .gbp-card { border: 1px solid var(--cream-dark); border-radius: 4px; overflow: hidden; page-break-inside: avoid; }
    .gbp-card-header { padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; background: var(--cream-dark); }
    .gbp-week { font-size: 8pt; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--warm-gray); }
    .gbp-type-badge { font-size: 7.5pt; font-weight: 500; padding: 2px 8px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.06em; }
    .gbp-type-offer { background: rgba(212,165,160,0.15); color: #b87a74; }
    .gbp-type-educational { background: rgba(92,122,94,0.12); color: var(--sage); }
    .gbp-type-seasonal { background: rgba(184,148,90,0.12); color: #b8945a; }
    .gbp-type-review { background: rgba(61,84,64,0.1); color: var(--sage-dark); }
    .gbp-card-body { padding: 14px 16px; background: var(--cream); }
    .gbp-text { font-size: 9.5pt; font-weight: 300; line-height: 1.65; color: var(--charcoal); }
    .back-cover { background: var(--cream-dark); min-height: 100vh; padding: 80px 72px; display: flex; flex-direction: column; justify-content: space-between; page-break-before: always; }
    .back-cover-title { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 36pt; font-weight: 300; color: var(--sage-dark); line-height: 1.1; margin-bottom: 16px; }
    .back-cover-title em { font-style: italic; color: var(--blush); }
    .back-cover-sub { font-size: 11pt; font-weight: 300; color: var(--warm-gray); line-height: 1.7; max-width: 480px; margin-bottom: 48px; }
    .checklist { list-style: none; display: flex; flex-direction: column; gap: 12px; }
    .checklist-item { display: flex; align-items: flex-start; gap: 14px; padding: 16px 20px; background: white; border-radius: 4px; border: 1px solid rgba(92,122,94,0.15); }
    .checklist-box { width: 18px; height: 18px; border: 1.5px solid rgba(92,122,94,0.3); border-radius: 3px; flex-shrink: 0; margin-top: 2px; }
    .checklist-text { font-size: 10pt; font-weight: 300; color: var(--charcoal); line-height: 1.5; }
    .checklist-text strong { font-weight: 500; color: var(--sage-dark); }
    .back-cover-footer { border-top: 1px solid rgba(92,122,94,0.2); padding-top: 28px; display: flex; justify-content: space-between; align-items: center; }
    .back-cover-logo { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 22pt; font-weight: 400; color: var(--sage-dark); }
    .back-cover-logo span { color: var(--blush); }
    .back-cover-contact { text-align: right; font-size: 9pt; color: var(--warm-gray); line-height: 1.8; }
    .back-cover-contact a { color: var(--sage); text-decoration: none; }
    .page-footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid var(--cream-dark); display: flex; justify-content: space-between; align-items: center; }
    .page-footer-logo { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 11pt; color: var(--sage-dark); }
    .page-footer-logo span { color: var(--blush); }
    .page-footer-info { font-size: 7.5pt; color: var(--warm-gray); letter-spacing: 0.06em; }
    .divider-dark { height: 1px; background: rgba(92,122,94,0.2); margin: 32px 0; }
  </style>
</head>
<body>

  <!-- COVER -->
  <div class="cover">
    <div>
      <div class="cover-logo">Flourish<span>Glow</span></div>
      <div class="cover-tagline">Done-for-you content for wellness practices</div>
    </div>
    <div>
      <div class="cover-label">Monthly Content Pack</div>
      <div class="cover-title">Your content,<br /><em>ready to post.</em></div>
      <div class="cover-business">${business_name}</div>
      <div class="cover-date">Prepared by FlourishGlow · ${pack_month}</div>
    </div>
    <div class="cover-bottom">
      <div class="cover-stat"><div class="cover-stat-number">12</div><div class="cover-stat-label">Social Captions</div></div>
      <div class="cover-stat"><div class="cover-stat-number">3</div><div class="cover-stat-label">Reactivation Emails</div></div>
      <div class="cover-stat"><div class="cover-stat-number">1</div><div class="cover-stat-label">Promo Email</div></div>
      <div class="cover-stat"><div class="cover-stat-number">4</div><div class="cover-stat-label">Google Posts</div></div>
    </div>
  </div>

  <!-- STRATEGY + HOW TO USE -->
  <div class="page">
    <div class="page-header">
      <div class="page-header-logo">Flourish<span>Glow</span></div>
      <div class="page-header-info">${business_name} · ${pack_month}</div>
    </div>
    <div class="section-eyebrow">This month's approach</div>
    <div class="section-title">Your <em>strategy note.</em></div>
    <div class="section-sub">A brief overview of the content angles we chose this month and why.</div>
    <div class="strategy-box">
      <div class="strategy-label">From the FlourishGlow team</div>
      <div class="strategy-text">${strategy_note}</div>
    </div>
    <div class="divider-dark"></div>
    <div class="section-eyebrow">How to use this pack</div>
    <div class="section-title">Getting <em>started.</em></div>
    <div class="how-to-grid">
      <div class="how-to-card">
        <div class="how-to-icon">📸</div>
        <div class="how-to-title">Social Captions</div>
        <ul class="how-to-steps">
          <li class="how-to-step"><span class="how-to-step-num">1</span><span>Choose your image or use the suggestion provided</span></li>
          <li class="how-to-step"><span class="how-to-step-num">2</span><span>Copy the caption text exactly as written</span></li>
          <li class="how-to-step"><span class="how-to-step-num">3</span><span>Copy the hashtags and add them to your post</span></li>
          <li class="how-to-step"><span class="how-to-step-num">4</span><span>Post to Instagram and/or Facebook</span></li>
          <li class="how-to-step"><span class="how-to-step-num">5</span><span>Aim for 3 posts per week — Tue, Thu, Sat</span></li>
        </ul>
      </div>
      <div class="how-to-card">
        <div class="how-to-icon">📧</div>
        <div class="how-to-title">Email Campaigns</div>
        <ul class="how-to-steps">
          <li class="how-to-step"><span class="how-to-step-num">1</span><span>Copy subject line and body into your email platform</span></li>
          <li class="how-to-step"><span class="how-to-step-num">2</span><span>Replace [PATIENT NAME] with your merge tag</span></li>
          <li class="how-to-step"><span class="how-to-step-num">3</span><span>Replace [BOOKING LINK] with your booking URL</span></li>
          <li class="how-to-step"><span class="how-to-step-num">4</span><span>Send reactivation emails to patients inactive 60-90 days</span></li>
          <li class="how-to-step"><span class="how-to-step-num">5</span><span>Send promo email to your full patient list</span></li>
        </ul>
      </div>
      <div class="how-to-card">
        <div class="how-to-icon">🗺️</div>
        <div class="how-to-title">Google Business Posts</div>
        <ul class="how-to-steps">
          <li class="how-to-step"><span class="how-to-step-num">1</span><span>Go to your Google Business Profile dashboard</span></li>
          <li class="how-to-step"><span class="how-to-step-num">2</span><span>Click Add Update or Add Offer</span></li>
          <li class="how-to-step"><span class="how-to-step-num">3</span><span>Copy the post text and paste it in</span></li>
          <li class="how-to-step"><span class="how-to-step-num">4</span><span>Replace [PHONE] and [WEBSITE] placeholders</span></li>
          <li class="how-to-step"><span class="how-to-step-num">5</span><span>Post once per week throughout the month</span></li>
        </ul>
      </div>
      <div class="how-to-card">
        <div class="how-to-icon">💡</div>
        <div class="how-to-title">Tips for Best Results</div>
        <ul class="how-to-steps">
          <li class="how-to-step"><span class="how-to-step-num">✓</span><span>Post consistently — 3x/week beats 1x/week every time</span></li>
          <li class="how-to-step"><span class="how-to-step-num">✓</span><span>Feel free to tweak wording to sound more like you</span></li>
          <li class="how-to-step"><span class="how-to-step-num">✓</span><span>Respond to all comments within 24 hours</span></li>
          <li class="how-to-step"><span class="how-to-step-num">✓</span><span>Use your own before/after photos when possible</span></li>
          <li class="how-to-step"><span class="how-to-step-num">✓</span><span>Fill out your monthly update form for tailored content</span></li>
        </ul>
      </div>
    </div>
    <div class="page-footer">
      <div class="page-footer-logo">Flourish<span>Glow</span></div>
      <div class="page-footer-info">${business_name} · ${pack_month} · flourishglow.com</div>
    </div>
  </div>

  <!-- CAPTIONS 1-6 -->
  <div class="page">
    <div class="page-header">
      <div class="page-header-logo">Flourish<span>Glow</span></div>
      <div class="page-header-info">${business_name} · ${pack_month}</div>
    </div>
    <div class="section-eyebrow">Section 01</div>
    <div class="section-title">Social Captions <em>+ Images.</em></div>
    <div class="section-sub">12 ready-to-post captions with image suggestions. Copy the caption, grab your image, add the hashtags, and post.</div>
    <div class="caption-grid">${captions1to6}</div>
    <div class="page-footer">
      <div class="page-footer-logo">Flourish<span>Glow</span></div>
      <div class="page-footer-info">${business_name} · ${pack_month} · Page 2 of 6</div>
    </div>
  </div>

  <!-- CAPTIONS 7-12 -->
  <div class="page">
    <div class="page-header">
      <div class="page-header-logo">Flourish<span>Glow</span></div>
      <div class="page-header-info">${business_name} · ${pack_month}</div>
    </div>
    <div class="section-eyebrow">Section 01 continued</div>
    <div class="section-title">Social Captions <em>7–12.</em></div>
    <div class="caption-grid">${captions7to12}</div>
    <div class="page-footer">
      <div class="page-footer-logo">Flourish<span>Glow</span></div>
      <div class="page-footer-info">${business_name} · ${pack_month} · Page 3 of 6</div>
    </div>
  </div>

  <!-- REACTIVATION EMAILS -->
  <div class="page">
    <div class="page-header">
      <div class="page-header-logo">Flourish<span>Glow</span></div>
      <div class="page-header-info">${business_name} · ${pack_month}</div>
    </div>
    <div class="section-eyebrow">Section 02</div>
    <div class="section-title">Reactivation <em>Email Sequence.</em></div>
    <div class="section-sub">3 emails to re-engage patients inactive 60–90 days. Replace [PATIENT NAME] with your merge tag and [BOOKING LINK] with your booking URL.</div>
    ${reactivationHtml}
    <div class="page-footer">
      <div class="page-footer-logo">Flourish<span>Glow</span></div>
      <div class="page-footer-info">${business_name} · ${pack_month} · Page 4 of 6</div>
    </div>
  </div>

  <!-- PROMO EMAIL + GBP -->
  <div class="page">
    <div class="page-header">
      <div class="page-header-logo">Flourish<span>Glow</span></div>
      <div class="page-header-info">${business_name} · ${pack_month}</div>
    </div>
    <div class="section-eyebrow">Section 03</div>
    <div class="section-title">Monthly <em>Promo Email.</em></div>
    <div class="section-sub">Send this to your full patient list to announce this month's offer or seasonal push.</div>
    <div class="email-card" style="margin-bottom: 40px;">
      <div class="email-card-header">
        <span class="email-num">Promotional Email — Full List</span>
        <span class="email-send-day">Send anytime this month</span>
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
    <div class="gbp-grid">${gbpHtml}</div>
    <div class="page-footer">
      <div class="page-footer-logo">Flourish<span>Glow</span></div>
      <div class="page-footer-info">${business_name} · ${pack_month} · Page 5 of 6</div>
    </div>
  </div>

  <!-- BACK COVER -->
  <div class="back-cover">
    <div>
      <div class="back-cover-title">Your monthly<br /><em>checklist.</em></div>
      <div class="back-cover-sub">Before you close this pack, make sure everything is scheduled and ready to go.</div>
      <ul class="checklist">
        <li class="checklist-item"><div class="checklist-box"></div><div class="checklist-text"><strong>Social captions scheduled</strong> — 12 captions loaded and ready to post 3x/week</div></li>
        <li class="checklist-item"><div class="checklist-box"></div><div class="checklist-text"><strong>Reactivation sequence set up</strong> — 3-email sequence targeting patients inactive 60–90 days</div></li>
        <li class="checklist-item"><div class="checklist-box"></div><div class="checklist-text"><strong>Promo email sent</strong> — monthly promotional email delivered to your full patient list</div></li>
        <li class="checklist-item"><div class="checklist-box"></div><div class="checklist-text"><strong>Google Business posts scheduled</strong> — 4 posts ready, one per week throughout the month</div></li>
        <li class="checklist-item"><div class="checklist-box"></div><div class="checklist-text"><strong>[BOOKING LINK] replaced</strong> — all booking link placeholders updated with your actual URL</div></li>
        <li class="checklist-item"><div class="checklist-box"></div><div class="checklist-text"><strong>Monthly update form submitted</strong> — fill out your 3-question update at flourishglow.com/update</div></li>
      </ul>
    </div>
    <div class="back-cover-footer">
      <div>
        <div class="back-cover-logo">Flourish<span>Glow</span></div>
        <div style="font-size: 9pt; color: var(--warm-gray); margin-top: 4px; letter-spacing: 0.06em;">Done-for-you content for wellness practices</div>
      </div>
      <div class="back-cover-contact">
        <div>flourishglow.com</div>
        <div><a href="mailto:hello@flourishglow.com">hello@flourishglow.com</a></div>
        <div style="margin-top: 4px; font-size: 8pt; color: rgba(122,114,105,0.6);">Questions? Just reply to this email.</div>
      </div>
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
