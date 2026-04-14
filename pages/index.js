import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import styles from '../styles/Home.module.css'

export default function Home() {
  const [sampleSubmitted, setSampleSubmitted] = useState(false)
  const [sampleLoading, setSampleLoading] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

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

  const faqs = [
    { q: 'Is the content compliant with medical advertising guidelines?', a: 'Yes. Every piece of content we produce avoids medical claims and language that could trigger FTC scrutiny or conflict with medical board advertising rules. We use language like "targets," "designed to," and "may help" rather than outcome guarantees. You\'re always welcome to edit anything before posting.' },
    { q: 'How customized is it really — will it sound like me?', a: 'Every pack is built from scratch using your specific practice profile — your services, your brand voice, your ideal patient, your current promotions, and your monthly update. We don\'t use templates that get swapped with your name. The content is written for your practice specifically, every single month.' },
    { q: 'What if I want changes to the content?', a: 'Everything we send is yours to edit. Most clients use the content as-is or with minor tweaks. If something doesn\'t sound right, change it — the goal is content that feels like you wrote it on your best day.' },
    { q: 'How does the monthly update work?', a: 'Three days before your pack generates, we send a short 3-question form. What promotions are you running this month? Any new services or updates? Anything specific you want us to focus on? Takes about 2 minutes. If you skip it, we create a compelling strategy based on your services and the current season.' },
    { q: 'What email and scheduling platforms does this work with?', a: 'Any of them. Your content arrives as a branded PDF with copy ready to paste. For email we recommend MailerLite or ActiveCampaign. For social scheduling, Buffer or Vista Social work well. For SMS, Podium and Birdeye are popular with wellness practices. You\'re not locked into anything.' },
    { q: 'Can I cancel anytime?', a: 'Yes, anytime, no questions asked, no cancellation fees. We don\'t believe in locking people into contracts. If FlourishGlow isn\'t working for your practice, you shouldn\'t be paying for it.' },
    { q: 'How is this different from hiring a social media manager?', a: 'A social media manager typically costs $1,500–$3,000 per month and handles posting for you. FlourishGlow delivers all the content — written, organized, and ready to deploy — for a fraction of that cost. You spend about 3 hours a month loading it into scheduling tools.' },
    { q: 'What\'s the setup fee for?', a: 'The one-time $197 setup fee covers your full practice onboarding — building out your practice profile, brand voice library, service list, and content preferences so every pack we generate is tailored from day one. You only pay it once.' }
  ]

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
              { n: '02', title: 'Monthly 2-min update', desc: "Three days before your pack generates, we send a short 3-question form. Any new promos? Seasonal focus? That's it." },
              { n: '03', title: 'We build your pack', desc: 'AI-powered personalization generates content tailored to your specific practice, voice, and monthly focus. A human reviews every pack before anything ships — ensuring compliance, tone, and zero repetition.' },
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

      {/* SOCIAL PROOF STATS */}
      <section className={styles.statsSection}>
        <div className={styles.statsInner}>
          <div className="section-label" style={{color:'var(--sage-light)'}}>Why it works</div>
          <h2 className="section-title" style={{color:'var(--cream)'}}>The numbers behind<br /><em style={{color:'var(--blush)'}}>consistent visibility.</em></h2>
          <p className="section-sub" style={{color:'rgba(249,245,238,0.6)'}}>You don&apos;t need more motivation. You need a system that makes consistency inevitable.</p>
          <div className={styles.statsGrid}>
            {[
              { number: '8–12hrs', label: 'Saved per month', desc: "The average wellness practice owner spends 8–12 hours per month on content creation when doing it manually. FlourishGlow reduces that to about 3 hours of deployment." },
              { number: '$1,500+', label: 'vs. hiring an agency', desc: "A social media manager or content agency typically charges $1,500–$3,000 per month for comparable output. FlourishGlow delivers the same content at a fraction of that cost." },
              { number: '60–90', label: 'Days before patients drift', desc: "Research shows patients who don't hear from a practice within 60–90 days are significantly more likely to book elsewhere. The reactivation sequence targets this window directly." },
              { number: '1', label: 'Appointment to break even', desc: "At an average appointment value of $200–$400, a single reactivation from one email pays for your entire month of content. Most practices see multiple bookings from the first send." },
            ].map(s => (
              <div key={s.label} className={styles.statCard}>
                <div className={styles.statNumber}>{s.number}</div>
                <div className={styles.statLabel}>{s.label}</div>
                <div className={styles.statDesc}>{s.desc}</div>
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
              { icon: '📸', title: 'Social Captions', count: '12 per month', desc: 'Ready-to-post captions across 12 proven content angles — educational, promotional, before & after, FAQ, and more. Each with hashtags and image guidance.' },
              { icon: '💬', title: 'SMS Captions', count: '12 per month', desc: 'Short-form versions of every social caption formatted for SMS platforms like Podium or Birdeye. Under 160 characters, no hashtags needed.' },
              { icon: '🗺️', title: 'Google Business Posts', count: '4 per month', desc: 'One post per week keeping your profile active and visible in local search. A mix of offers, educational content, and seasonal updates.' },
              { icon: '📷', title: 'GBP Photo Captions', count: '4 per month', desc: 'Specific photo prompts with ready-to-post captions for your Google Business Profile. Take the photo, paste the caption, upload.' },
              { icon: '❓', title: 'FAQ Posts', count: '3 per month', desc: 'Question-and-answer posts based on common patient questions about your services. High-engagement content that builds trust and authority.' },
              { icon: '🎯', title: 'Seasonal Offer Copy', count: '1 per month', desc: 'Plug-and-play headline, subheadline, body, and CTA for your current offer. Use it on your website, booking software, or front desk screen.' },
              { icon: '💌', title: 'Reactivation Email Sequence', count: '3 emails', desc: "Re-engage patients who haven't booked in 60–90 days. A warm check-in, a specific offer, and a gentle close. Drop it into any email platform and send." },
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
            <div className={`${styles.pricingCard} ${styles.featured}`}>
              <div>
                <div className={styles.pricingTier}>Core Plan</div>
                <div className={styles.pricingPrice}><sup>$</sup>397</div>
                <div className={styles.pricingPeriod}>per month</div>
                <div className={styles.pricingSetup}>+ $197 one-time setup fee (includes full custom onboarding)</div>
                <div className={styles.pricingGuarantee}>Cancel anytime · No contracts · No cancellation fees</div>
                <Link href="/onboarding?plan=core" className={styles.btnPricingSolid}>Get Started</Link>
                <div className={styles.pricingRisk}>If your first pack doesn&apos;t feel right for your practice, we&apos;ll make it right or refund your setup fee.</div>
              </div>
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
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDER */}
      <section className={styles.founder}>
        <div className={styles.founderInner}>
          <div className={styles.founderImage}>
            <img src="/Jacob.png" alt="Jacob Merkley, Founder of FlourishGlow" className={styles.founderPhoto} />
          </div>
          <div className={styles.founderContent}>
            <div className="section-label">Built by a practice owner</div>
            <h2 className={styles.founderTitle}>The system I wished<br /><em>existed years ago.</em></h2>
            <p className={styles.founderBio}>I have a background in accounting, an MBA, and years of experience running a service business. As a practice owner myself, I watched great clinicians struggle with the same marketing problem over and over — not because they didn&apos;t care, but because generating consistent, quality content on top of running a practice is genuinely hard.</p>
            <p className={styles.founderBio}>FlourishGlow is the system I built to solve that problem. Not a generic content service. A done-for-you content engine that knows your practice, speaks in your voice, and shows up in your inbox every month without you having to think about it.</p>
            <div className={styles.founderSig}>
              <div className={styles.founderName}>Jacob Merkley</div>
              <div className={styles.founderRole}>Founder, FlourishGlow</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.faq} id="faq">
        <div className={styles.faqInner}>
          <div className="section-label">Common questions</div>
          <h2 className="section-title">Everything you need<br />to <em>know.</em></h2>
          <div className={styles.faqList}>
            {faqs.map((faq, i) => (
              <div key={i} className={`${styles.faqItem} ${openFaq === i ? styles.faqOpen : ''}`}>
                <button className={styles.faqQuestion} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <span className={styles.faqIcon}>{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div className={styles.faqAnswer}>{faq.a}</div>
                )}
              </div>
            ))}
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
              <div className={styles.sampleSectionLabel}>Social Captions (3 of 12)</div>
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
                <p>We&apos;ll have your custom sample pack in your inbox within a few hours.</p>
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
                <p className="form-hint" style={{textAlign:'center',marginTop:'12px'}}>We&apos;ll send your sample within a few hours. No spam, ever.</p>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
