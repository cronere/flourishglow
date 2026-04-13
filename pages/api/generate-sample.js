export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, email, business_name, practice_type, services } = req.body

  if (!name || !email || !business_name || !practice_type || !services) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const now = new Date()
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const current_month = `${monthNames[now.getMonth()]} ${now.getFullYear()}`
  const month = now.getMonth()
  const current_season = month >= 2 && month <= 4 ? 'Spring' : month >= 5 && month <= 7 ? 'Summer' : month >= 8 && month <= 10 ? 'Fall' : 'Winter'

  try {
    // Step 1 — Call Claude to generate content
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 6000,
        messages: [{
          role: 'user',
          content: `You are a professional content writer specializing exclusively in wellness practice marketing.\n\nPRACTICE PROFILE:\nBusiness Name: ${business_name}\nPractice Type: ${practice_type}\nLocation: Not specified\nOwner: ${name}\nWebsite: Not provided\nInstagram: Not provided\nServices Offered: ${services}\nAdditional Services: \nIdeal Client: Patients seeking professional wellness and aesthetic treatments\nBrand Voice: Warm & Approachable\nThings to Avoid: \nThis Month's Promotional Focus: \nAdditional Notes: This is a sample pack to demonstrate FlourishGlow's service.\nCurrent Month: ${current_month}\nCurrent Season: ${current_season}\n\nGenerate a complete monthly content pack. Return ONLY valid JSON with this exact structure:\n\n{"strategy_note": "2-3 sentence note explaining the content angles and themes chosen for this pack and why. Do not mention any month name, season name, or specific time period.","social_captions": [{"caption_number": 1,"angle": "Pain Point","caption": "Full caption text","hashtags": "#hashtag1 #hashtag2","image_suggestion": "Brief image description"}],"reactivation_sequence": [{"email_number": 1,"send_day": 1,"subject": "Subject line","preview_text": "Preview text","body": "Maximum 100 words. No bullet points. Flowing prose. Warm personal tone. Ends with [BOOKING LINK]."},{"email_number": 2,"send_day": 4,"subject": "Subject line","preview_text": "Preview text","body": "Maximum 100 words. No bullet points. Flowing prose. Introduces a specific offer. Ends with [BOOKING LINK]."},{"email_number": 3,"send_day": 9,"subject": "Subject line","preview_text": "Preview text","body": "Maximum 80 words. No bullet points. Flowing prose. Gentle final nudge. Ends with [BOOKING LINK]."}],"promo_email": {"subject": "Subject line","preview_text": "Preview text 40-60 characters","body": "Maximum 120 words. No bullet points. Flowing prose. One compelling hook sentence, explain the offer, end with [BOOKING LINK]."},"gbp_posts": [{"week": 1,"type": "Offer","post": "Post text"},{"week": 2,"type": "Educational","post": "Post text"},{"week": 3,"type": "Seasonal","post": "Post text"},{"week": 4,"type": "Review Request","post": "Post text"}],"gbp_photo_captions": [{"photo_number": 1,"subject": "Brief description of what photo to take","caption": "1-2 sentence caption to post with the photo on Google Business Profile. No hashtags."},{"photo_number": 2,"subject": "Brief description of what photo to take","caption": "1-2 sentence caption to post with the photo on Google Business Profile. No hashtags."},{"photo_number": 3,"subject": "Brief description of what photo to take","caption": "1-2 sentence caption to post with the photo on Google Business Profile. No hashtags."},{"photo_number": 4,"subject": "Brief description of what photo to take","caption": "1-2 sentence caption to post with the photo on Google Business Profile. No hashtags."}],"faq_posts": [{"question": "Common patient question about one of the practice services","answer": "Clear concise answer 2-3 sentences. No medical claims. Use language like targets, designed to, may help.","hashtags": "#hashtag1 #hashtag2","image_suggestion": "Brief image description"},{"question": "Common patient question about one of the practice services","answer": "Clear concise answer 2-3 sentences. No medical claims.","hashtags": "#hashtag1 #hashtag2","image_suggestion": "Brief image description"},{"question": "Common patient question about one of the practice services","answer": "Clear concise answer 2-3 sentences. No medical claims.","hashtags": "#hashtag1 #hashtag2","image_suggestion": "Brief image description"}],"seasonal_offer_copy": {"headline": "Short punchy headline for the seasonal offer. Maximum 8 words.","subheadline": "One sentence expanding on the offer. Maximum 20 words.","body": "2-3 sentences of offer copy. Maximum 60 words.","cta": "Call to action text. Maximum 6 words."},"referral_email": {"subject": "Subject line","preview_text": "Preview text 40-60 characters","body": "Maximum 100 words. No bullet points. Flowing prose. Warm tone. Asks current patient to refer a friend. Create a compelling default incentive such as a complimentary consultation or small treatment credit. Ends with [BOOKING LINK]."},"sms_captions": [{"caption_number": 1,"sms": "SMS version of caption 1 under 160 characters. No hashtags. Conversational tone."}]}\n\nWrite exactly 12 social captions rotating through these angles: Pain Point, Educational, Sample/Demo, Before & After, Stats & Facts, Pain Point, Educational, Seasonal, Before & After, Pain Point, Educational, Direct CTA.\n\nWrite exactly 12 SMS captions corresponding to each of the 12 social captions.\n\nWrite exactly 3 FAQ posts based on the most common patient questions about the practice services.\n\nWrite exactly 4 GBP photo captions with specific photo subjects relevant to the practice.\n\nRules:\n- Never use the word journey\n- No medical claims — use language like targets, designed to, may help\n- No exclamation points\n- Warm & Approachable voice: conversational, like a trusted friend who is an expert\n- GBP posts: no hashtags, no emojis, professional tone, maximum 100 words each\n- GBP photo captions: no hashtags, 1-2 sentences, professional tone\n- Reactivation emails: maximum 100 words each, no bullet points, flowing prose only\n- Promo email: maximum 120 words, no bullet points, flowing prose only\n- Referral email: maximum 100 words, no bullet points, flowing prose only\n- FAQ posts: base questions on the actual services listed\n- SMS captions: under 160 characters each, no hashtags, conversational tone\n- Strategy note: do not mention any month name, season name, or specific time period\n- Use [PATIENT NAME] and [BOOKING LINK] as placeholders\n- Create a compelling seasonal offer since no promo focus was provided\n\nReturn ONLY raw JSON. No markdown. No backticks. No \`\`\`json wrapper. Start with { and end with }. Nothing else.`
        }]
      })
    })

    if (!claudeResponse.ok) {
      const err = await claudeResponse.text()
      console.error('Claude error:', err)
      return res.status(500).json({ error: 'Content generation failed' })
    }

    const claudeData = await claudeResponse.json()
    const rawContent = claudeData.content[0].text

    let fullPack
    try {
      const cleaned = rawContent.replace(/```json|```/g, '').trim()
      fullPack = JSON.parse(cleaned)
    } catch (e) {
      console.error('Failed to parse Claude JSON:', e.message)
      return res.status(500).json({ error: 'Failed to parse content', details: e.message })
    }

    // Strip month/season from strategy note
    const rawStrategyNote = fullPack.strategy_note || ''
    const monthNamesArr = ['January','February','March','April','May','June','July','August','September','October','November','December']
    const seasonNamesArr = ['Spring','Summer','Fall','Autumn','Winter','spring','summer','fall','autumn','winter']
    let strategy_note = rawStrategyNote
    monthNamesArr.forEach(m => { strategy_note = strategy_note.replace(new RegExp(m, 'gi'), '') })
    seasonNamesArr.forEach(s => { strategy_note = strategy_note.replace(new RegExp(`\\b${s}\\b`, 'g'), '') })
    strategy_note = strategy_note.replace(/\s{2,}/g, ' ').trim()

    const social_captions = fullPack.social_captions || []
    const reactivation_sequence = fullPack.reactivation_sequence || []
    const promo_email = fullPack.promo_email || {}
    const gbp_posts = fullPack.gbp_posts || []
    const referral_email = fullPack.referral_email || {}
    const sms_captions = fullPack.sms_captions || []
    const gbp_photo_captions = fullPack.gbp_photo_captions || []
    const faq_posts = fullPack.faq_posts || []
    const seasonal_offer_copy = fullPack.seasonal_offer_copy || {}

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

    const gbpTypeStyle = (type) => {
      const map = { 'Offer': 'background:rgba(212,165,160,0.2); color:#b87a74;', 'Educational': 'background:rgba(92,122,94,0.12); color:#5C7A5E;', 'Seasonal': 'background:rgba(184,148,90,0.15); color:#b8945a;', 'Review Request': 'background:rgba(61,84,64,0.1); color:#3D5440;' }
      return map[type] || map['Offer']
    }

    const gbpHtml = gbp_posts.reduce((rows, p, i) => {
      if (i % 2 === 0) rows.push('<tr>')
      rows[rows.length - 1] += `<td style="width:50%; vertical-align:top; padding:6px;"><div style="border:1px solid #F0E9DC; border-radius:4px; overflow:hidden; page-break-inside:avoid;"><div style="background:#F0E9DC; padding:8px 14px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-size:7.5pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269;">Week ${p.week}</td><td style="text-align:right;"><span style="font-size:7pt; font-weight:500; padding:1px 7px; border-radius:20px; text-transform:uppercase; letter-spacing:0.06em; ${gbpTypeStyle(p.type)}">${p.type}</span></td></tr></table></div><div style="padding:12px 14px; background:#F9F5EE;"><div style="font-size:9pt; font-weight:300; line-height:1.65; color:#2C2C2C;">${p.post.replace(/\n/g, '<br/>')}</div></div></div></td>`
      if (i % 2 === 1) rows[rows.length - 1] += '</tr>'
      if (i === gbp_posts.length - 1 && i % 2 === 0) rows[rows.length - 1] += '<td></td></tr>'
      return rows
    }, []).join('')

    const smsCaptionsHtml = sms_captions.reduce((rows, s, i) => {
      if (i % 2 === 0) rows.push('<tr>')
      rows[rows.length - 1] += `<td style="width:50%; vertical-align:top; padding:6px;"><div style="border:1px solid #F0E9DC; border-radius:4px; overflow:hidden; page-break-inside:avoid;"><div style="background:#F0E9DC; padding:7px 12px;"><span style="font-size:7.5pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269;">Caption ${s.caption_number} of 12</span></div><div style="padding:12px;"><div style="font-size:9pt; font-weight:300; line-height:1.65; color:#2C2C2C;">${s.sms}</div><div style="font-size:7pt; color:#7A7269; margin-top:8px; padding-top:6px; border-top:1px solid #F0E9DC;">${s.sms ? s.sms.length : 0} / 160 characters</div></div></div></td>`
      if (i % 2 === 1) rows[rows.length - 1] += '</tr>'
      if (i === sms_captions.length - 1 && i % 2 === 0) rows[rows.length - 1] += '<td></td></tr>'
      return rows
    }, []).join('')

    const faqHtml = faq_posts.map((f, i) => `
      <div style="border:1px solid #F0E9DC; border-radius:4px; overflow:hidden; margin-bottom:16px; page-break-inside:avoid;">
        <div style="background:#F0E9DC; padding:10px 18px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-size:7.5pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269;">FAQ ${i + 1} of 3</td><td style="text-align:right;"><span style="font-size:7pt; font-weight:500; color:#5C7A5E; background:rgba(92,122,94,0.12); padding:1px 7px; border-radius:20px; text-transform:uppercase; letter-spacing:0.06em;">Q&amp;A Post</span></td></tr></table></div>
        <div style="padding:18px;">
          <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Question</div>
          <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:14pt; font-weight:500; color:#3D5440; margin-bottom:12px; line-height:1.3;">${f.question}</div>
          <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Answer</div>
          <div style="font-size:9.5pt; font-weight:300; line-height:1.8; color:#2C2C2C; margin-bottom:10px;">${f.answer}</div>
          <div style="font-size:8pt; color:#D4A5A0; line-height:1.5; margin-bottom:6px;">${f.hashtags}</div>
          <div style="font-size:7pt; color:#7A7269; font-style:italic; padding-top:6px; border-top:1px solid #F0E9DC;">📸 ${f.image_suggestion}</div>
        </div>
      </div>
    `).join('')

    const gbpPhotoCaptionsHtml = gbp_photo_captions.reduce((rows, p, i) => {
      if (i % 2 === 0) rows.push('<tr>')
      rows[rows.length - 1] += `<td style="width:50%; vertical-align:top; padding:6px;"><div style="border:1px solid #F0E9DC; border-radius:4px; overflow:hidden; page-break-inside:avoid;"><div style="background:#F0E9DC; padding:8px 14px;"><span style="font-size:7.5pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269;">Photo ${p.photo_number} of 4</span></div><div style="padding:12px 14px; background:#F9F5EE;"><div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#5C7A5E; margin-bottom:4px;">Take This Photo</div><div style="font-size:8.5pt; font-weight:500; color:#3D5440; margin-bottom:10px; line-height:1.4;">${p.subject}</div><div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Caption to Post</div><div style="font-size:9pt; font-weight:300; line-height:1.65; color:#2C2C2C;">${p.caption}</div></div></div></td>`
      if (i % 2 === 1) rows[rows.length - 1] += '</tr>'
      if (i === gbp_photo_captions.length - 1 && i % 2 === 0) rows[rows.length - 1] += '<td></td></tr>'
      return rows
    }, []).join('')

    // Build HTML — same template as generate-pdf.js
    const pack_month = current_month
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${business_name} — Sample Content Pack</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', Arial, sans-serif; background: #fff; color: #2C2C2C; font-size: 11pt; line-height: 1.5; width: 794px; }
  </style>
</head>
<body>

  <!-- COVER -->
  <div style="background:#3D5440; padding:72px 72px 56px; page-break-after:always; min-height:100vh;">
    <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:30pt; font-weight:400; color:#fff; letter-spacing:0.02em; margin-bottom:6px;">Flourish<span style="color:#D4A5A0;">Glow</span></div>
    <div style="font-size:8.5pt; letter-spacing:0.16em; text-transform:uppercase; color:rgba(255,255,255,0.4); margin-bottom:180px;">Done-for-you content for wellness practices</div>
    <div style="font-size:9pt; font-weight:500; letter-spacing:0.16em; text-transform:uppercase; color:#8AAD8C; margin-bottom:18px;">Sample Content Pack</div>
    <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:48pt; font-weight:300; line-height:1.05; color:#fff; margin-bottom:20px;">Your content,<br/><em style="font-style:italic; color:#D4A5A0;">ready to post.</em></div>
    <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:18pt; font-weight:400; color:rgba(255,255,255,0.7); margin-bottom:6px;">${business_name}</div>
    <div style="font-size:9.5pt; font-weight:300; letter-spacing:0.08em; color:rgba(255,255,255,0.4); margin-bottom:56px;">Sample prepared by FlourishGlow · ${pack_month}</div>
    <div style="border-top:1px solid rgba(255,255,255,0.15); padding-top:28px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="text-align:center;"><div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#fff; line-height:1; display:block; margin-bottom:4px;">12</div><div style="font-size:7.5pt; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.35);">Social Captions</div></td>
        <td style="text-align:center;"><div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#fff; line-height:1; display:block; margin-bottom:4px;">3</div><div style="font-size:7.5pt; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.35);">Reactivation Emails</div></td>
        <td style="text-align:center;"><div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#fff; line-height:1; display:block; margin-bottom:4px;">1</div><div style="font-size:7.5pt; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.35);">Promo Email</div></td>
        <td style="text-align:center;"><div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#fff; line-height:1; display:block; margin-bottom:4px;">4</div><div style="font-size:7.5pt; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.35);">Google Posts</div></td>
      </tr><tr>
        <td style="text-align:center; padding-top:20px;"><div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#fff; line-height:1; display:block; margin-bottom:4px;">12</div><div style="font-size:7.5pt; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.35);">SMS Captions</div></td>
        <td style="text-align:center; padding-top:20px;"><div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#fff; line-height:1; display:block; margin-bottom:4px;">3</div><div style="font-size:7.5pt; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.35);">FAQ Posts</div></td>
        <td style="text-align:center; padding-top:20px;"><div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#fff; line-height:1; display:block; margin-bottom:4px;">1</div><div style="font-size:7.5pt; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.35);">Referral Email</div></td>
        <td style="text-align:center; padding-top:20px;"><div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#fff; line-height:1; display:block; margin-bottom:4px;">1</div><div style="font-size:7.5pt; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.35);">Seasonal Offer</div></td>
      </tr></table>
    </div>
  </div>

  <!-- STRATEGY NOTE -->
  <div style="padding:48px 64px 40px;">
    <div style="font-size:8pt; font-weight:500; letter-spacing:0.16em; text-transform:uppercase; color:#5C7A5E; margin-bottom:8px;">Content strategy</div>
    <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#3D5440; line-height:1.1; margin-bottom:6px;">Your <em style="font-style:italic; color:#D4A5A0;">strategy note.</em></div>
    <div style="font-size:9.5pt; font-weight:300; color:#7A7269; margin-bottom:24px; line-height:1.6;">A brief overview of the content angles we chose for this pack and why.</div>
    <div style="background:#3D5440; padding:24px 28px; border-radius:4px; margin-bottom:24px;">
      <div style="font-size:8pt; font-weight:500; letter-spacing:0.14em; text-transform:uppercase; color:#8AAD8C; margin-bottom:10px;">From the FlourishGlow team</div>
      <div style="font-size:10.5pt; font-weight:300; line-height:1.8; color:rgba(255,255,255,0.85); font-style:italic;">${strategy_note}</div>
    </div>
    <div style="background:#F9F5EE; border:1px solid #F0E9DC; border-radius:4px; padding:20px 24px;">
      <div style="font-size:8pt; font-weight:500; letter-spacing:0.12em; text-transform:uppercase; color:#5C7A5E; margin-bottom:8px;">This is a sample pack</div>
      <div style="font-size:9pt; font-weight:300; color:#7A7269; line-height:1.7;">This pack was generated based on the basic information you provided. When you become a client your pack is tailored with your full practice profile, brand voice, ideal patient, current promotions, and monthly updates — making every piece of content feel like it was written by someone who truly knows your practice.</div>
      <div style="margin-top:14px;"><a href="https://flourishglow.com/onboarding" style="font-size:8.5pt; font-weight:500; color:#3D5440; text-decoration:none; border-bottom:1px solid #3D5440;">Get started at flourishglow.com →</a></div>
    </div>
  </div>

  <!-- CONTENT CALENDAR -->
  <div style="padding:48px 64px 16px; page-break-before:always;">
    <div style="font-size:8pt; font-weight:500; letter-spacing:0.16em; text-transform:uppercase; color:#5C7A5E; margin-bottom:8px;">Section 01</div>
    <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#3D5440; line-height:1.1; margin-bottom:6px;">Monthly Content <em style="font-style:italic; color:#D4A5A0;">Calendar.</em></div>
    <div style="font-size:9.5pt; font-weight:300; color:#7A7269; margin-bottom:16px; line-height:1.6;">Your complete posting and sending schedule for the month.</div>
    <div style="margin-bottom:16px;"><table cellpadding="0" cellspacing="0"><tr>
      <td style="width:12px; height:12px; background:#5C7A5E; border-radius:2px; vertical-align:middle;"></td><td style="font-size:7.5pt; color:#5C7A5E; font-weight:500; padding-left:5px; padding-right:14px; vertical-align:middle;">Social Post</td>
      <td style="width:12px; height:12px; background:rgba(92,122,94,0.2); border:1px solid #5C7A5E; border-radius:2px; vertical-align:middle;"></td><td style="font-size:7.5pt; color:#5C7A5E; font-weight:500; padding-left:5px; padding-right:14px; vertical-align:middle;">SMS Caption</td>
      <td style="width:12px; height:12px; background:#4A7C8E; border-radius:2px; vertical-align:middle;"></td><td style="font-size:7.5pt; color:#4A7C8E; font-weight:500; padding-left:5px; padding-right:14px; vertical-align:middle;">GBP + Photo</td>
      <td style="width:12px; height:12px; background:#7A6EA0; border-radius:2px; vertical-align:middle;"></td><td style="font-size:7.5pt; color:#7A6EA0; font-weight:500; padding-left:5px; padding-right:14px; vertical-align:middle;">Reactivation</td>
      <td style="width:12px; height:12px; background:#D4A5A0; border-radius:2px; vertical-align:middle;"></td><td style="font-size:7.5pt; color:#b87a74; font-weight:500; padding-left:5px; padding-right:14px; vertical-align:middle;">Promo Email</td>
      <td style="width:12px; height:12px; background:#b8945a; border-radius:2px; vertical-align:middle;"></td><td style="font-size:7.5pt; color:#b8945a; font-weight:500; padding-left:5px; vertical-align:middle;">Referral Email</td>
    </tr></table></div>

    ${['Week 1','Week 2','Week 3','Week 4'].map((wk, wi) => {
      const captions = [wi*3+1, wi*3+2, wi*3+3]
      const tuePill = wi < 3 ? `<div style="font-size:7.5pt; font-weight:400; color:#fff; background:#7A6EA0; padding:2px 6px; border-radius:3px; line-height:1.4; margin-bottom:3px;">React. ${wi+1}</div><div style="font-size:7.5pt; font-weight:400; color:#fff; background:#5C7A5E; padding:2px 6px; border-radius:3px; line-height:1.4;">FAQ Post ${wi+1}</div>` : `<div style="font-size:8pt; color:#aaa; font-style:italic;">—</div>`
      const satPill = wi === 0 ? `<div style="font-size:7.5pt; font-weight:400; color:#fff; background:#D4A5A0; padding:2px 6px; border-radius:3px; line-height:1.4;">Promo Email</div>` : wi === 2 ? `<div style="font-size:7.5pt; font-weight:400; color:#fff; background:#b8945a; padding:2px 6px; border-radius:3px; line-height:1.4;">Referral Email</div>` : `<div style="font-size:8pt; color:#aaa; font-style:italic;">—</div>`
      return `<div style="border:1px solid #F0E9DC; border-radius:4px; overflow:hidden; margin-bottom:8px; page-break-inside:avoid;"><div style="background:#3D5440; padding:7px 16px;"><span style="font-size:8pt; font-weight:500; letter-spacing:0.12em; text-transform:uppercase; color:rgba(255,255,255,0.8);">${wk}</span></div><table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="width:16.66%; padding:9px 10px; border-right:1px solid #F0E9DC; vertical-align:top; background:#F9F5EE;"><div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Mon</div><div style="font-size:7.5pt; font-weight:400; color:#fff; background:#5C7A5E; padding:2px 6px; border-radius:3px; line-height:1.4; margin-bottom:3px;">Caption ${captions[0]}</div><div style="font-size:7pt; font-weight:400; color:#5C7A5E; background:rgba(92,122,94,0.1); padding:2px 6px; border-radius:3px; line-height:1.4;">SMS ${captions[0]}</div></td>
        <td style="width:16.66%; padding:9px 10px; border-right:1px solid #F0E9DC; vertical-align:top;">${tuePill}</td>
        <td style="width:16.66%; padding:9px 10px; border-right:1px solid #F0E9DC; vertical-align:top; background:#F9F5EE;"><div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Wed</div><div style="font-size:7.5pt; font-weight:400; color:#fff; background:#5C7A5E; padding:2px 6px; border-radius:3px; line-height:1.4; margin-bottom:3px;">Caption ${captions[1]}</div><div style="font-size:7pt; font-weight:400; color:#5C7A5E; background:rgba(92,122,94,0.1); padding:2px 6px; border-radius:3px; line-height:1.4;">SMS ${captions[1]}</div></td>
        <td style="width:16.66%; padding:9px 10px; border-right:1px solid #F0E9DC; vertical-align:top;"><div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Thu</div><div style="font-size:7.5pt; font-weight:400; color:#fff; background:#4A7C8E; padding:2px 6px; border-radius:3px; line-height:1.4;">GBP + Photo ${wi+1}</div></td>
        <td style="width:16.66%; padding:9px 10px; border-right:1px solid #F0E9DC; vertical-align:top; background:#F9F5EE;"><div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:4px;">Fri</div><div style="font-size:7.5pt; font-weight:400; color:#fff; background:#5C7A5E; padding:2px 6px; border-radius:3px; line-height:1.4; margin-bottom:3px;">Caption ${captions[2]}</div><div style="font-size:7pt; font-weight:400; color:#5C7A5E; background:rgba(92,122,94,0.1); padding:2px 6px; border-radius:3px; line-height:1.4;">SMS ${captions[2]}</div></td>
        <td style="width:16.66%; padding:9px 10px; vertical-align:top;">${satPill}</td>
      </tr></table></div>`
    }).join('')}

    <div style="border-top:1px solid #F0E9DC; padding-top:16px;">
      <div style="font-size:8pt; font-weight:300; color:#7A7269; line-height:1.8;">
        <strong style="font-weight:500; color:#3D5440;">This takes about 3 hours a month.</strong> Load your captions into a scheduling platform like <span style="color:#3D5440; font-weight:500;">Buffer</span> or <span style="color:#3D5440; font-weight:500;">Vista Social</span>, and your emails into a platform like <span style="color:#3D5440; font-weight:500;">MailerLite</span> or <span style="color:#3D5440; font-weight:500;">ActiveCampaign</span> — then let automation handle the rest.
      </div>
    </div>
  </div>

  <!-- SOCIAL CAPTIONS -->
  <div style="padding:48px 64px 16px; page-break-before:always;">
    <div style="font-size:8pt; font-weight:500; letter-spacing:0.16em; text-transform:uppercase; color:#5C7A5E; margin-bottom:8px;">Section 02</div>
    <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#3D5440; line-height:1.1; margin-bottom:6px;">Social Captions <em style="font-style:italic; color:#D4A5A0;">+ Images.</em></div>
    <div style="font-size:9.5pt; font-weight:300; color:#7A7269; margin-bottom:24px; line-height:1.6;">12 ready-to-post captions with image suggestions.</div>
    <table width="100%" cellpadding="0" cellspacing="0">${captionsHtml}</table>
  </div>

  <!-- SMS CAPTIONS -->
  <div style="padding:48px 64px 16px; page-break-before:always;">
    <div style="font-size:8pt; font-weight:500; letter-spacing:0.16em; text-transform:uppercase; color:#5C7A5E; margin-bottom:8px;">Section 03</div>
    <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#3D5440; line-height:1.1; margin-bottom:6px;">SMS <em style="font-style:italic; color:#D4A5A0;">Captions.</em></div>
    <div style="font-size:9.5pt; font-weight:300; color:#7A7269; margin-bottom:24px; line-height:1.6;">12 short-form versions for SMS platforms. Under 160 characters, no hashtags needed.</div>
    <table width="100%" cellpadding="0" cellspacing="0">${smsCaptionsHtml}</table>
  </div>

  <!-- GBP POSTS -->
  <div style="padding:48px 64px 16px; page-break-before:always;">
    <div style="font-size:8pt; font-weight:500; letter-spacing:0.16em; text-transform:uppercase; color:#5C7A5E; margin-bottom:8px;">Section 04</div>
    <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#3D5440; line-height:1.1; margin-bottom:6px;">Google Business <em style="font-style:italic; color:#D4A5A0;">Profile Posts.</em></div>
    <div style="font-size:9.5pt; font-weight:300; color:#7A7269; margin-bottom:24px; line-height:1.6;">Post one per week to keep your Google listing active.</div>
    <table width="100%" cellpadding="0" cellspacing="0">${gbpHtml}</table>
  </div>

  <!-- GBP PHOTO CAPTIONS -->
  <div style="padding:48px 64px 16px; page-break-before:always;">
    <div style="font-size:8pt; font-weight:500; letter-spacing:0.16em; text-transform:uppercase; color:#5C7A5E; margin-bottom:8px;">Section 05</div>
    <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#3D5440; line-height:1.1; margin-bottom:6px;">GBP Photo <em style="font-style:italic; color:#D4A5A0;">Captions.</em></div>
    <div style="font-size:9.5pt; font-weight:300; color:#7A7269; margin-bottom:24px; line-height:1.6;">4 photo prompts with ready-to-post captions for your Google Business Profile.</div>
    <table width="100%" cellpadding="0" cellspacing="0">${gbpPhotoCaptionsHtml}</table>
  </div>

  <!-- FAQ POSTS -->
  <div style="padding:48px 64px 16px; page-break-before:always;">
    <div style="font-size:8pt; font-weight:500; letter-spacing:0.16em; text-transform:uppercase; color:#5C7A5E; margin-bottom:8px;">Section 06</div>
    <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#3D5440; line-height:1.1; margin-bottom:6px;">FAQ <em style="font-style:italic; color:#D4A5A0;">Posts.</em></div>
    <div style="font-size:9.5pt; font-weight:300; color:#7A7269; margin-bottom:24px; line-height:1.6;">3 question-and-answer posts based on common patient questions.</div>
    ${faqHtml}
  </div>

  <!-- SEASONAL OFFER COPY -->
  <div style="padding:48px 64px 16px; page-break-before:always;">
    <div style="font-size:8pt; font-weight:500; letter-spacing:0.16em; text-transform:uppercase; color:#5C7A5E; margin-bottom:8px;">Section 07</div>
    <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#3D5440; line-height:1.1; margin-bottom:6px;">Seasonal Offer <em style="font-style:italic; color:#D4A5A0;">Copy.</em></div>
    <div style="font-size:9.5pt; font-weight:300; color:#7A7269; margin-bottom:24px; line-height:1.6;">Ready-to-use copy for your website, booking software, or front desk screen.</div>
    <div style="border:1px solid #F0E9DC; border-radius:4px; overflow:hidden; page-break-inside:avoid;">
      <div style="background:#3D5440; padding:24px 28px; text-align:center;">
        <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:24pt; font-weight:300; color:#fff; line-height:1.2; margin-bottom:8px;">${seasonal_offer_copy.headline || ''}</div>
        <div style="font-size:11pt; font-weight:300; color:rgba(255,255,255,0.75); line-height:1.6;">${seasonal_offer_copy.subheadline || ''}</div>
      </div>
      <div style="padding:24px 28px; background:#F9F5EE;">
        <div style="font-size:9.5pt; font-weight:300; line-height:1.8; color:#2C2C2C; margin-bottom:16px;">${seasonal_offer_copy.body || ''}</div>
        <div style="display:inline-block; background:#3D5440; color:#fff; font-size:9pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; padding:10px 24px; border-radius:3px;">${seasonal_offer_copy.cta || ''}</div>
      </div>
    </div>
  </div>

  <!-- REACTIVATION EMAILS -->
  <div style="padding:48px 64px 16px; page-break-before:always;">
    <div style="font-size:8pt; font-weight:500; letter-spacing:0.16em; text-transform:uppercase; color:#5C7A5E; margin-bottom:8px;">Section 08</div>
    <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#3D5440; line-height:1.1; margin-bottom:6px;">Reactivation <em style="font-style:italic; color:#D4A5A0;">Email Sequence.</em></div>
    <div style="font-size:9.5pt; font-weight:300; color:#7A7269; margin-bottom:24px; line-height:1.6;">3 emails to re-engage patients inactive 60–90 days. Send on the first 3 Tuesdays.</div>
    ${reactivationHtml}
  </div>

  <!-- PROMO EMAIL -->
  <div style="padding:48px 64px 16px; page-break-before:always;">
    <div style="font-size:8pt; font-weight:500; letter-spacing:0.16em; text-transform:uppercase; color:#5C7A5E; margin-bottom:8px;">Section 09</div>
    <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#3D5440; line-height:1.1; margin-bottom:6px;">Monthly <em style="font-style:italic; color:#D4A5A0;">Promo Email.</em></div>
    <div style="font-size:9.5pt; font-weight:300; color:#7A7269; margin-bottom:24px; line-height:1.6;">Send to your full patient list on Week 1 Saturday.</div>
    <div style="border:1px solid #F0E9DC; border-radius:4px; overflow:hidden; margin-bottom:16px; page-break-inside:avoid;">
      <div style="background:#F0E9DC; padding:10px 18px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-size:7.5pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269;">Promotional Email — Full List</td><td style="text-align:right;"><span style="font-size:7.5pt; font-weight:500; color:#b87a74; background:rgba(212,165,160,0.2); padding:2px 10px; border-radius:20px;">Send Week 1 Saturday</span></td></tr></table></div>
      <div style="padding:18px;">
        <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:3px;">Subject Line</div>
        <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:15pt; font-weight:500; color:#3D5440; margin-bottom:3px; line-height:1.2;">${promo_email.subject || ''}</div>
        <div style="font-size:8.5pt; font-style:italic; color:#7A7269; margin-bottom:14px; padding-bottom:14px; border-bottom:1px solid #F0E9DC;">Preview text: ${promo_email.preview_text || ''}</div>
        <div style="font-size:9.5pt; font-weight:300; line-height:1.8; color:#2C2C2C;">${(promo_email.body || '').replace(/\n/g, '<br/>')}</div>
      </div>
    </div>
  </div>

  <!-- REFERRAL EMAIL -->
  <div style="padding:48px 64px 16px; page-break-before:always;">
    <div style="font-size:8pt; font-weight:500; letter-spacing:0.16em; text-transform:uppercase; color:#5C7A5E; margin-bottom:8px;">Section 10</div>
    <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:26pt; font-weight:300; color:#3D5440; line-height:1.1; margin-bottom:6px;">Monthly <em style="font-style:italic; color:#D4A5A0;">Referral Email.</em></div>
    <div style="font-size:9.5pt; font-weight:300; color:#7A7269; margin-bottom:24px; line-height:1.6;">Send to your full patient list on Week 3 Saturday.</div>
    <div style="border:1px solid #F0E9DC; border-radius:4px; overflow:hidden; margin-bottom:16px; page-break-inside:avoid;">
      <div style="background:#F0E9DC; padding:10px 18px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-size:7.5pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269;">Referral Email — Full List</td><td style="text-align:right;"><span style="font-size:7.5pt; font-weight:500; color:#b8945a; background:rgba(184,148,90,0.15); padding:2px 10px; border-radius:20px;">Send Week 3 Saturday</span></td></tr></table></div>
      <div style="padding:18px;">
        <div style="font-size:7pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#7A7269; margin-bottom:3px;">Subject Line</div>
        <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:15pt; font-weight:500; color:#3D5440; margin-bottom:3px; line-height:1.2;">${referral_email.subject || ''}</div>
        <div style="font-size:8.5pt; font-style:italic; color:#7A7269; margin-bottom:14px; padding-bottom:14px; border-bottom:1px solid #F0E9DC;">Preview text: ${referral_email.preview_text || ''}</div>
        <div style="font-size:9.5pt; font-weight:300; line-height:1.8; color:#2C2C2C;">${(referral_email.body || '').replace(/\n/g, '<br/>')}</div>
      </div>
    </div>
  </div>

  <!-- BACK COVER -->
  <div style="background:#F0E9DC; padding:64px 72px; page-break-before:always; min-height:100vh;">
    <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:32pt; font-weight:300; color:#3D5440; line-height:1.1; margin-bottom:16px;">Ready to get your<br/><em style="font-style:italic; color:#D4A5A0;">first pack?</em></div>
    <div style="font-size:10.5pt; font-weight:300; color:#7A7269; line-height:1.8; max-width:480px; margin-bottom:32px;">This sample was built from just a few pieces of information. Imagine what we can create when we know your full practice profile, your brand voice, your ideal patient, and your monthly promotions.</div>
    <div style="background:#3D5440; display:inline-block; padding:14px 32px; border-radius:4px; margin-bottom:48px;">
      <div style="font-size:9pt; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#fff;">Get started at flourishglow.com</div>
    </div>
    <div style="border-top:1px solid rgba(92,122,94,0.2); padding-top:24px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="vertical-align:top;">
          <div style="font-family:'Cormorant Garamond',Georgia,serif; font-size:20pt; font-weight:400; color:#3D5440;">Flourish<span style="color:#D4A5A0;">Glow</span></div>
          <div style="font-size:8.5pt; color:#7A7269; margin-top:4px; letter-spacing:0.06em;">Done-for-you content for wellness practices</div>
        </td>
        <td style="text-align:right; vertical-align:top; font-size:8.5pt; color:#7A7269; line-height:1.8;">
          flourishglow.com<br/>hello@flourishglow.com<br/>
          <span style="font-size:7.5pt; color:rgba(122,114,105,0.6);">Questions? Just reply to this email.</span>
        </td>
      </tr></table>
    </div>
  </div>

</body>
</html>`

    // Step 2 — Convert to PDF via PDFShift
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

    const pdfBuffer = await pdfResponse.arrayBuffer()

    // Step 3 — Upload to Supabase Storage
    const fileName = `sample-${Date.now()}.pdf`
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
      console.error('Storage upload error:', error)
      return res.status(500).json({ error: 'Storage upload failed', details: error })
    }

    const pdfUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/packs/${fileName}`

    console.log('Sample PDF generated:', pdfUrl)

    return res.status(200).json({
      success: true,
      pdf_url: pdfUrl,
      file_name: fileName
    })

  } catch (err) {
    console.error('Generate sample error:', err)
    return res.status(500).json({ error: 'Something went wrong', details: err.message })
  }
}
