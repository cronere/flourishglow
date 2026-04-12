import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import styles from '../styles/Home.module.css'

export default function Home() {
  const [sampleSubmitted, setSampleSubmitted] = useState(false)
  const [sampleLoading, setSampleLoading] = useState(false)

  async function handleSampleRequest(e) {
    e.preventDefault()
    setSampleLoading(true)
    const data = Object.fromEntries(new FormData(e.target))
    try {
      await fetch('/api/sample-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
    } catch (_) {}
    setSampleSubmitted(true)
    setSampleLoading(false)
  }

  return (
    <>
      <Head>
        <title>FlourishGlow — Done-for-You Content for Wellness Practices</title>
        <meta name="description" content="Your practice, in front of patients every week. Monthly content packs — social captions, emails, Google posts, and more — created for your specific practice and delivered to your inbox." />
        <meta property="og:title" content="FlourishGlow — Done-for-You Content for Wellness Practices" />
        <meta property="og:description" content="Your practice, in front of patients every week. Without you writing a single word." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Nav />

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <svg className={styles.botanicalSvg} viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M200 380 C200 380 80 300 60 200 C40 100 120 40 200 20 C280 40 360 100 340 200 C320 300 200 380 200 380Z" stroke="#5C7A5E" strokeWidth="1.5" fill="none"/>
          <path d="M200 380 C200 380 140 280 160 180 C180 80 200 20 200 20" stroke="#5C7A5E" strokeWidth="1" fill="none"/>
          <path d="M200 200 C200 200 120 160 100 120" stroke="#5C7A5E" strokeWidth="0.8" fill="none"/>
          <path d="M200 240 C200 240 280 200 300 160" stroke="#5C7A5E" strokeWidth="0.8" fill="none"/>
          <path d="M200 300 C200 300 140 280 110 260" stroke="#5C7A5E" strokeWidth="0.8" fill="none"/>
          <circle cx="200" cy="200" r="80" stroke="#D4A5A0" strokeWidth="0.5" fill="none" strokeDasharray="4 6"/>
          <circle cx="200" cy="200" r="140" stroke="#5C7A5E" strokeWidth="0.5" fill="none" strokeDasharray="2 8"/>
        </svg>
        <div className={styles.heroContent}>
          <div className={styles.heroEyebrow}>Done-for-you content for wellness practices</div>
          <h1>Your practice,<br />in front of patients<br /><em>every week.</em></h1>
          <p className={styles.heroSub}>Most practices lose patients to silence — not competition. FlourishGlow keeps you visible, consistent, and top of mind every single month. Without you writing a single word.</p>
          <div className={styles.heroActions}>
            <Link href="/onboarding" className="btn-primary">Get Started</Link>
            <a href="#pricing" className="btn-ghost">View Plans</a>
          </div>
        </div>
        <div className={styles.heroStatBar}>
          {[
            { number: '12', label: 'Social captions monthly' },
            { number: '5', label: 'Email campaigns monthly' },
            { number: '4', label: 'Google posts monthly' },
            { number: '3hrs', label: 'Your time per month' },
          ].map(s => (
            <div className={styles.heroStat} key={s.label}>
              <div className={styles.heroStatNumber}>{s.number}</div>
              <div className={styles.heroStatLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PAIN */}
      <section className={styles.pain}>
        <div className={styles.painBg} />
        <div className={styles.painInner}>
          <div>
            <h2>You didn&apos;t open a<br /><em>content studio.</em><br />So why does it feel<br />like you&apos;re running one?</h2>
            <p className={styles.painIntro}>Most wellness practice owners are brilliant clinicians who never signed up to be content creators. Yet here you are, staring at a blank caption box at 10pm wondering what to post tomorrow.</p>
          </div>
          <ul className={styles.painList}>
            {[
              { icon: '📱', title: 'Your feed has gone quiet', body: " It's been weeks since you posted. You know consistency matters, but you never have the words when you have the time." },
              { icon: '📧', title: 'Past patients are forgetting you exist', body: " Your list hasn't heard from you in months. Those patients are booking with someone else — not because they left, but because you went quiet." },
              { icon: '🗺️', title: 'Your Google listing is gathering dust', body: " A dormant profile tells Google — and potential patients — that you're not paying attention. Regular posts change that." },
              { icon: '💸', title: 'Agencies cost too much for what you actually need', body: " You don't need a full agency. You need the content — written and ready to post every single month." },
            ].map(p => (
              <li className={styles.painItem} key={p.title}>
                <span className={styles.painIcon}>{p.icon}</span>
                <span className={styles.painItemText}><strong>{p.title}</strong>{p.body}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.how} id="how-it-works">
        <div className={styles.howInner}>
          <div className="section-label">How it works</div>
          <h2 className="section-title">Simple by <em>design.</em></h2>
          <p className="section-sub">Your only job is a 2-minute update once a month. Everything else is handled.</p>
          <div className={styles.steps}>
            {[
              { n: '01', title: 'You onboard once', desc: 'Fill out our intake form — your services, brand voice, ideal client, and promotions. Takes about 10 minutes. We store everything so you never repeat yourself.' },
              { n: '02', title: 'Monthly 2-min update', desc: 'Three days before your pack generates, we send a short 3-question form. Any new promos? Seasonal focus? That\'s it.' },
              { n: '03', title: 'We build your pack', desc: 'We generate all of your content tailored to your practice, your voice, and this month\'s focus. A human reviews before anything ships.' },
              { n: '04', title: 'You receive & publish', desc: 'Your branded content pack lands in your inbox each month. Copy, paste, and post — or load it into a scheduling tool in one session. Done until next month.' },
            ].map(s => (
              <div className={styles.step} key={s.n}>
                <div className={styles.stepNumber}>{s.n}</div>
                <div className={styles.stepTitle}>{s.title}</div>
                <div className={styles.stepDesc}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DELIVERABLES */}
      <section className={styles.deliverables} id="deliverables">
        <div className={styles.deliverablesInner}>
          <div className="section-label">What&apos;s included</div>
          <h2 className="section-title">Everything your practice<br />needs to <em>stay visible.</em></h2>
          <p className="section-sub">Every plan includes these deliverables, created for your specific practice every single month.</p>
          <div className={styles.deliverablesGrid}>
            {[
              { icon: '📸', title: 'Social Captions + Images', count: '12 per month', desc: 'Ready-to-post captions across 12 proven content angles — educational, promotional, before & after, FAQ, and more. Each with hashtags and image guidance.' },
              { icon: '💬', title: 'SMS Captions', count: '12 per month', desc: 'Short-form versions of every social caption formatted for SMS platforms like Podium or Birdeye. Under 160 characters, no hashtags needed.' },
              { icon: '🗺️', title: 'Google Business Posts', count: '4 per month', desc: 'One post per week keeping your profile active and visible in local search. A mix of offers, educational content, and seasonal updates.' },
              { icon: '📷', title: 'GBP Photo Captions', count: '4 per month', desc: 'Specific photo prompts with ready-to-post captions for your Google Business Profile. Take the photo, paste the caption, upload.' },
              { icon: '❓', title: 'FAQ Posts', count: '3 per month', desc: 'Question-and-answer posts based on common patient questions about your services. High-engagement content that builds trust and authority.' },
              { icon: '🎯', title: 'Seasonal Offer Copy', count: '1 per month', desc: 'Plug-and-play headline, subheadline, body, and CTA for your current offer. Use it on your website, booking software, or front desk screen.' },
              { icon: '💌', title: 'Reactivation Email Sequence', count: '3 emails', desc: 'Re-engage patients who haven\'t booked in 60–90 days. A warm check-in, a specific offer, and a gentle close. Drop it into any email platform and send.' },
              { icon: '📣', title: 'Monthly Promo Email', count: '1 per month', desc: 'A polished email built around your current offer or seasonal push. Subject line, preview text, and full body copy — ready to send to your full patient list.' },
              { icon: '🤝', title: 'Referral Email', count: '1 per month', desc: 'A warm email asking current patients to refer a friend — with a compelling incentive tied to your current promotion. Sent to your full patient list.' },
              { icon: '📅', title: 'Monthly Content Calendar', count: '1 per month', desc: 'A complete week-by-week posting and sending schedule so you know exactly what to post, when to send each email, and what to upload to GBP.' },
            ].map(d => (
              <div className={styles.deliverableCard} key={d.title}>
                <div className={styles.deliverableIcon}>{d.icon}</div>
                <div className={styles.deliverableTitle}>{d.title}</div>
                <div className={styles.deliverableCount}>{d.count}</div>
                <p className={styles.deliverableDesc}>{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className={styles.pricing} id="pricing">
        <div className={styles.pricingInner}>
          <div className="section-label">Pricing</div>
          <h2 className="section-title">Straightforward.<br /><em>No surprises.</em></h2>
          <p className="section-sub">One setup fee. One monthly rate. Cancel anytime.</p>
          <div className={styles.pricingGrid}>

            <div className={styles.pricingCard}>
              <div className={styles.pricingTier}>Core</div>
              <div className={styles.pricingPrice}><sup>$</sup>397</div>
              <div className={styles.pricingPeriod}>per month</div>
              <div className={styles.pricingSetup}>+ $197 one-time setup fee</div>
              <ul className={styles.pricingFeatures}>
                {[
                  '12 social captions + image guidance',
                  '12 SMS captions',
                  '4 Google Business Profile posts',
                  '4 GBP photo captions',
                  '3 FAQ posts',
                  '1 seasonal offer copy block',
                  '3-email reactivation sequence',
                  '1 monthly promo email',
                  '1 referral email',
                  'Monthly content calendar',
                  'Branded PDF delivery',
                  '48-hour turnaround',
                ].map(f => (
                  <li className={styles.pricingFeature} key={f}>{f}</li>
                ))}
              </ul>
              <Link href="/onboarding?plan=core" className={styles.btnPricingOutline}>Get Started</Link>
            </div>

            <div className={`${styles.pricingCard} ${styles.featured}`}>
              <div className={styles.pricingBadge}>Most Popular</div>
              <div className={styles.pricingTier}>Growth</div>
              <div className={styles.pricingPrice}><sup>$</sup>597</div>
              <div className={styles.pricingPeriod}>per month</div>
              <div className={styles.pricingSetup}>+ $197 one-time setup fee</div>
              <ul className={styles.pricingFeatures}>
                {['Everything in Core'].map(f => (
                  <li className={styles.pricingFeature} key={f}>{f}</li>
                ))}
                {['Automated review request sequence', 'New patient welcome sequence'].map(f => (
                  <li className={`${styles.pricingFeature} ${styles.addon}`} key={f}>{f}</li>
                ))}
                {['Priority 24-hour turnaround', 'Quarterly promo calendar'].map(f => (
                  <li className={styles.pricingFeature} key={f}>{f}</li>
                ))}
              </ul>
              <Link href="/onboarding?plan=growth" className={styles.btnPricingSolid}>Get Started</Link>
            </div>

          </div>
        </div>
      </section>

      {/* SAMPLE */}
      <section className={styles.sample} id="sample">
        <div className={styles.sampleInner}>
          <div className={styles.samplePreview}>
            <div className={styles.samplePreviewHeader}>
              <div className={styles.sampleDots}>
                <div className={styles.sampleDot}/><div className={styles.sampleDot}/><div className={styles.sampleDot}/>
              </div>
              <div className={styles.samplePreviewTitle}>Glow Aesthetic Studio — Content Pack.pdf</div>
            </div>
            <div className={styles.samplePreviewBody}>
              <div className={styles.sampleDocTitle}>Glow Aesthetic Studio</div>
              <div className={styles.sampleDocSub}>Monthly Content Pack · Prepared by FlourishGlow</div>
              <div className={styles.sampleSectionLabel}>Social Captions + Images (3 of 12)</div>
              <div className={styles.sampleCaption}>
                <div className={styles.sampleCaptionText}>Your skin works hard all year. A HydraFacial doesn&apos;t just cleanse — it targets congestion, uneven tone, and the kind of dullness that builds up quietly over months. One appointment, visible results. Book yours this month.</div>
                <div className={styles.sampleCaptionTag}>#hydrafacial #medspaphoenix #skinglow</div>
              </div>
              <div className={styles.sampleCaption}>
                <div className={styles.sampleCaptionText}>Botox results typically last 3–4 months. If it&apos;s been a while since your last visit, your muscles are already working overtime again. Now&apos;s the time to come back in — link in bio to book.</div>
                <div className={styles.sampleCaptionTag}>#botox #aesthetics #naturalresults</div>
              </div>
              <div className={`${styles.sampleCaption} ${styles.blurred}`}>
                <div className={styles.sampleCaptionText}>The best version of you isn&apos;t a dramatic change. It&apos;s the version that walks in confident and leaves feeling exactly like herself — just refreshed.</div>
              </div>
              <div className={`${styles.sampleEmailPreview} ${styles.blurred}`}>
                <div className={styles.sampleSectionLabel} style={{marginTop:'20px'}}>Reactivation Email — 1 of 3</div>
                <div className={styles.sampleCaption}><div className={styles.sampleCaptionText}>Subject: We&apos;ve been thinking about you...</div></div>
              </div>
            </div>
            <div className={styles.sampleOverlay}>
              <a href="#sample-form" className="btn-primary" style={{fontSize:'12px',padding:'12px 28px'}}>Request Your Free Sample Pack</a>
            </div>
          </div>

          <div className={styles.sampleFormWrap} id="sample-form">
            <div className="section-label">Free sample pack</div>
            <h3 className={styles.sampleFormTitle}>See exactly what<br />we&apos;d build <em>for you.</em></h3>
            <p className={styles.sampleFormDesc}>Tell us about your practice and we&apos;ll send you a real sample content pack — built around your actual services, in your brand voice. No obligation, no credit card.</p>

            {sampleSubmitted ? (
              <div className={styles.sampleSuccess}>
                <div className={styles.sampleSuccessIcon}>✓</div>
                <div className={styles.sampleSuccessTitle}>Sample request received!</div>
                <p>We&apos;ll have your custom sample pack in your inbox within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSampleRequest}>
                <div className="form-group"><label className="form-label">Your Name</label><input className="form-input" type="text" name="name" placeholder="Dr. Sarah Mitchell" required /></div>
                <div className="form-group"><label className="form-label">Email Address</label><input className="form-input" type="email" name="email" placeholder="sarah@glowstudio.com" required /></div>
                <div className="form-group"><label className="form-label">Practice Name</label><input className="form-input" type="text" name="business_name" placeholder="Glow Aesthetic Studio" required /></div>
                <div className="form-group">
                  <label className="form-label">Practice Type</label>
                  <select className="form-input" name="practice_type" required defaultValue="">
                    <option value="" disabled>Select your practice type</option>
                    <option>Med Spa / Aesthetic Clinic</option>
                    <option>Chiropractic</option>
                    <option>Physical Therapy</option>
                    <option>Massage Therapy</option>
                    <option>Other Wellness Practice</option>
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Top 2–3 Services You Offer</label><input className="form-input" type="text" name="services" placeholder="Botox, HydraFacial, Laser Hair Removal" required /></div>
                <button type="submit" className="btn-primary" style={{width:'100%',marginTop:'8px'}} disabled={sampleLoading}>
                  {sampleLoading ? 'Sending...' : 'Send Me the Sample Pack →'}
                </button>
                <p className="form-hint" style={{textAlign:'center',marginTop:'12px'}}>We&apos;ll send your sample within 24 hours. No spam, ever.</p>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

  return (
    <>
      <Head>
        <title>Flourish Glow — Done-for-You Content for Wellness Practices</title>
        <meta name="description" content="Stop going quiet between appointments. Monthly social captions, branded images, emails, and Google posts — created for your wellness practice and delivered to your inbox every month." />
        <meta property="og:title" content="Flourish Glow — Done-for-You Content for Wellness Practices" />
        <meta property="og:description" content="Stop going quiet between appointments. Monthly content packs created for your practice, in your voice." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Nav />

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <svg className={styles.botanicalSvg} viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M200 380 C200 380 80 300 60 200 C40 100 120 40 200 20 C280 40 360 100 340 200 C320 300 200 380 200 380Z" stroke="#5C7A5E" strokeWidth="1.5" fill="none"/>
          <path d="M200 380 C200 380 140 280 160 180 C180 80 200 20 200 20" stroke="#5C7A5E" strokeWidth="1" fill="none"/>
          <path d="M200 200 C200 200 120 160 100 120" stroke="#5C7A5E" strokeWidth="0.8" fill="none"/>
          <path d="M200 240 C200 240 280 200 300 160" stroke="#5C7A5E" strokeWidth="0.8" fill="none"/>
          <path d="M200 300 C200 300 140 280 110 260" stroke="#5C7A5E" strokeWidth="0.8" fill="none"/>
          <circle cx="200" cy="200" r="80" stroke="#D4A5A0" strokeWidth="0.5" fill="none" strokeDasharray="4 6"/>
          <circle cx="200" cy="200" r="140" stroke="#5C7A5E" strokeWidth="0.5" fill="none" strokeDasharray="2 8"/>
        </svg>
        <div className={styles.heroContent}>
          <div className={styles.heroEyebrow}>Done-for-you content for wellness practices</div>
          <h1>Stop going quiet<br />between<br /><em>appointments.</em></h1>
          <p className={styles.heroSub}>Every month we deliver ready-to-use social captions, branded images, email campaigns, and Google posts — all created for your specific services, in your voice. You stay focused on patients. We handle the content.</p>
          <div className={styles.heroActions}>
            <Link href="/onboarding" className="btn-primary">View Plans</Link>
            <a href="#sample" className="btn-ghost">See a sample pack</a>
          </div>
        </div>
        <div className={styles.heroStatBar}>
          {[
            { number: '12+', label: 'Captions + images monthly' },
            { number: '2', label: 'Email campaigns monthly' },
            { number: '0', label: 'Hours of your time' },
            { number: '∞', label: 'Wellness verticals served' },
          ].map(s => (
            <div className={styles.heroStat} key={s.label}>
              <div className={styles.heroStatNumber}>{s.number}</div>
              <div className={styles.heroStatLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PAIN */}
      <section className={styles.pain}>
        <div className={styles.painBg} />
        <div className={styles.painInner}>
          <div>
            <h2>You didn&apos;t open a<br /><em>content studio.</em><br />So why does it feel<br />like you&apos;re running one?</h2>
            <p className={styles.painIntro}>Most wellness practice owners are brilliant clinicians who never signed up to be content creators. Yet here you are, staring at a blank caption box at 10pm wondering what to post tomorrow.</p>
          </div>
          <ul className={styles.painList}>
            {[
              { icon: '📱', title: 'Your feed has gone quiet', body: "It's been weeks since you posted. You know consistency matters, but you never have the words when you have the time." },
              { icon: '📧', title: 'Past patients are forgetting you exist', body: "Your list hasn't heard from you in months. Those patients are booking with someone else — not because they left, but because you went quiet." },
              { icon: '🗺️', title: 'Your Google listing is gathering dust', body: "A dormant profile tells Google — and potential patients — that you're not paying attention. Regular posts change that." },
              { icon: '💸', title: 'Agencies cost too much for what you actually need', body: "You don't need a full agency. You need the content — written, designed, and ready to post every single month." },
            ].map(p => (
              <li className={styles.painItem} key={p.title}>
                <span className={styles.painIcon}>{p.icon}</span>
                <span className={styles.painItemText}><strong>{p.title}</strong>{p.body}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.how} id="how-it-works">
        <div className={styles.howInner}>
          <div className="section-label">How it works</div>
          <h2 className="section-title">Simple by <em>design.</em></h2>
          <p className="section-sub">Your only job is a 2-minute update once a month. Everything else is handled.</p>
          <div className={styles.steps}>
            {[
              { n: '01', title: 'You onboard once', desc: 'Fill out our intake form — your services, brand voice, ideal client, and promotions. Takes about 10 minutes. We store everything.' },
              { n: '02', title: 'Monthly 2-min update', desc: 'Three days before your pack generates, we send a short 3-question form. Any new promos? Seasonal focus? That\'s it.' },
              { n: '03', title: 'We build your pack', desc: 'Our team generates all of your content and images tailored to your practice, your voice, and this month\'s focus (if applicable). A human reviews before anything ships.' },
              { n: '04', title: 'You receive & publish', desc: 'Your branded PDF lands in your inbox each month. Copy, paste, and post. Done until next month.' },
            ].map(s => (
              <div className={styles.step} key={s.n}>
                <div className={styles.stepNumber}>{s.n}</div>
                <div className={styles.stepTitle}>{s.title}</div>
                <div className={styles.stepDesc}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DELIVERABLES */}
      <section className={styles.deliverables} id="deliverables">
        <div className={styles.deliverablesInner}>
          <div className="section-label">What&apos;s included</div>
          <h2 className="section-title">Everything you need.<br /><em>Nothing you don&apos;t.</em></h2>
          <p className="section-sub">Every Core plan includes these deliverables, created for your practice every single month.</p>
          <div className={styles.deliverablesGrid}>
            {[
              { icon: '📸', title: 'Social Captions + Images', count: '12 per month', desc: 'Branded images paired with ready-to-post captions — a mix of educational, promotional, and social proof angles. Each with a call to action. Copy, paste, post.' },
              { icon: '💌', title: 'Reactivation Email Sequence', count: '3 emails', desc: 'Re-engage patients who haven\'t booked in 60–90 days. A warm check-in, a specific offer, and a gentle close. Drop it into any email platform and send.' },
              { icon: '📣', title: 'Monthly Promo Email', count: '1 per month', desc: 'A polished email built around your current offer, a new service, or the season. Subject line and full body copy — ready to send to your list.' },
              { icon: '🗺️', title: 'Google Business Posts', count: '4 per month', desc: 'One post per week keeping your profile active and visible in local search. A mix of offers, educational content, and seasonal updates.' },
              { icon: '🧭', title: 'Monthly Strategy Note', count: '1 per month', desc: 'A brief note explaining the angles we chose this month and why — so you understand the thinking behind your content.' },
              { icon: '📄', title: 'Branded PDF Delivery', count: 'Every month', desc: 'Everything packaged in a clean, branded PDF with your practice name. Professional enough to share with your front desk team.' },
            ].map(d => (
              <div className={styles.deliverableCard} key={d.title}>
                <div className={styles.deliverableIcon}>{d.icon}</div>
                <div className={styles.deliverableTitle}>{d.title}</div>
                <div className={styles.deliverableCount}>{d.count}</div>
                <p className={styles.deliverableDesc}>{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className={styles.pricing} id="pricing">
        <div className={styles.pricingInner}>
          <div className="section-label">Pricing</div>
          <h2 className="section-title">Straightforward.<br /><em>No surprises.</em></h2>
          <p className="section-sub">One setup fee. One monthly rate. Cancel anytime.</p>
          <div className={styles.pricingGrid}>

            <div className={styles.pricingCard}>
              <div className={styles.pricingTier}>Core</div>
              <div className={styles.pricingPrice}><sup>$</sup>397</div>
              <div className={styles.pricingPeriod}>per month</div>
              <div className={styles.pricingSetup}>+ $197 one-time setup fee</div>
              <ul className={styles.pricingFeatures}>
                {['12 social captions + branded images','3-email reactivation sequence','1 monthly promo email','4 Google Business Profile posts','Monthly strategy note','Branded PDF delivery','48-hour turnaround'].map(f => (
                  <li className={styles.pricingFeature} key={f}>{f}</li>
                ))}
              </ul>
              <Link href="/onboarding?plan=core" className={styles.btnPricingOutline}>Get Started</Link>
            </div>

            <div className={`${styles.pricingCard} ${styles.featured}`}>
              <div className={styles.pricingBadge}>Most Popular</div>
              <div className={styles.pricingTier}>Growth</div>
              <div className={styles.pricingPrice}><sup>$</sup>597</div>
              <div className={styles.pricingPeriod}>per month</div>
              <div className={styles.pricingSetup}>+ $197 one-time setup fee</div>
              <ul className={styles.pricingFeatures}>
                {['Everything in Core'].map(f => (
                  <li className={styles.pricingFeature} key={f}>{f}</li>
                ))}
                {['Automated review request sequence','New patient welcome sequence'].map(f => (
                  <li className={`${styles.pricingFeature} ${styles.addon}`} key={f}>{f}</li>
                ))}
                {['Priority 24-hour turnaround','Quarterly promo calendar'].map(f => (
                  <li className={styles.pricingFeature} key={f}>{f}</li>
                ))}
              </ul>
              <Link href="/onboarding?plan=growth" className={styles.btnPricingSolid}>Get Started</Link>
            </div>

          </div>
        </div>
      </section>

      {/* SAMPLE */}
      <section className={styles.sample} id="sample">
        <div className={styles.sampleInner}>
          <div className={styles.samplePreview}>
            <div className={styles.samplePreviewHeader}>
              <div className={styles.sampleDots}>
                <div className={styles.sampleDot}/><div className={styles.sampleDot}/><div className={styles.sampleDot}/>
              </div>
              <div className={styles.samplePreviewTitle}>Glow Aesthetic Studio — June 2025 Content Pack.pdf</div>
            </div>
            <div className={styles.samplePreviewBody}>
              <div className={styles.sampleDocTitle}>Glow Aesthetic Studio</div>
              <div className={styles.sampleDocSub}>Monthly Content Pack · June 2025</div>
              <div className={styles.sampleSectionLabel}>Social Captions + Images (3 of 12)</div>
              <div className={styles.sampleCaption}>
                <div className={styles.sampleImagePlaceholder}><span>Branded Image</span></div>
                <div className={styles.sampleCaptionText}>Summer is the perfect time to refresh more than just your wardrobe. Our HydraFacial targets winter dullness and gives your skin the deep cleanse it&apos;s been craving. ✨ Book your appointment this month and glow into summer.</div>
                <div className={styles.sampleCaptionTag}>#wellness #hydrafacial #skinglow</div>
              </div>
              <div className={styles.sampleCaption}>
                <div className={styles.sampleImagePlaceholder}><span>Branded Image</span></div>
                <div className={styles.sampleCaptionText}>Did you know Botox results last 3–4 months? If it&apos;s been a while since your last visit, now&apos;s the perfect time to come back in. We have openings this week — link in bio to book. 💉</div>
                <div className={styles.sampleCaptionTag}>#botox #aesthetics #medspaphoenix</div>
              </div>
              <div className={`${styles.sampleCaption} ${styles.blurred}`}>
                <div className={styles.sampleCaptionText}>Your confidence deserves to be cared for. Whether it&apos;s your first visit or your fiftieth, we&apos;re here to make sure you leave feeling like the best version of yourself.</div>
              </div>
              <div className={`${styles.sampleEmailPreview} ${styles.blurred}`}>
                <div className={styles.sampleSectionLabel} style={{marginTop:'20px'}}>Reactivation Email — 1 of 3</div>
                <div className={styles.sampleCaption}><div className={styles.sampleCaptionText}>Subject: We&apos;ve been thinking about you...</div></div>
              </div>
            </div>
            <div className={styles.sampleOverlay}>
              <a href="#sample-form" className="btn-primary" style={{fontSize:'12px',padding:'12px 28px'}}>Request Your Free Sample</a>
            </div>
          </div>

          <div className={styles.sampleFormWrap} id="sample-form">
            <div className="section-label">Free sample</div>
            <h3 className={styles.sampleFormTitle}>See what we&apos;d build <em>for you.</em></h3>
            <p className={styles.sampleFormDesc}>Tell us about your practice and we&apos;ll put together a partial sample pack — real captions and content built around your actual services. No obligation, no credit card.</p>

            {sampleSubmitted ? (
              <div className={styles.sampleSuccess}>
                <div className={styles.sampleSuccessIcon}>✓</div>
                <div className={styles.sampleSuccessTitle}>Sample request received!</div>
                <p>We&apos;ll have your custom sample in your inbox within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSampleRequest}>
                <div className="form-group"><label className="form-label">Your Name</label><input className="form-input" type="text" name="name" placeholder="Dr. Sarah Mitchell" required /></div>
                <div className="form-group"><label className="form-label">Email Address</label><input className="form-input" type="email" name="email" placeholder="sarah@glowstudio.com" required /></div>
                <div className="form-group"><label className="form-label">Practice Name</label><input className="form-input" type="text" name="business_name" placeholder="Glow Aesthetic Studio" required /></div>
                <div className="form-group">
                  <label className="form-label">Practice Type</label>
                  <select className="form-input" name="practice_type" required defaultValue="">
                    <option value="" disabled>Select your practice type</option>
                    <option>Med Spa / Aesthetic Clinic</option>
                    <option>Chiropractic</option>
                    <option>Physical Therapy</option>
                    <option>Massage Therapy</option>
                    <option>Other Wellness Practice</option>
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Top 2–3 Services You Offer</label><input className="form-input" type="text" name="services" placeholder="Botox, HydraFacial, Laser Hair Removal" required /></div>
                <button type="submit" className="btn-primary" style={{width:'100%',marginTop:'8px'}} disabled={sampleLoading}>
                  {sampleLoading ? 'Sending...' : 'Send Me the Sample Pack →'}
                </button>
                <p className="form-hint" style={{textAlign:'center',marginTop:'12px'}}>We&apos;ll send your sample within 24 hours. No spam, ever.</p>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
