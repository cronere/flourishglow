import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import styles from '../styles/Onboarding.module.css'

const VOICE_OPTIONS = [
  'Warm & Approachable','Luxury & Premium','Clinical & Trustworthy',
  'Fun & Playful','Empowering & Bold','Educational & Expert',
  'Calm & Minimalist','Friendly & Conversational'
]

const SERVICES = [
  'Botox / Dysport','Dermal Fillers','HydraFacial','Laser Treatments',
  'Chemical Peels','Body Contouring','IV Therapy','Microneedling',
  'PRF / PRP','Weight Loss Programs','Massage Therapy','Chiropractic Care'
]

export default function Onboarding() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState('')
  const [selectedVoices, setSelectedVoices] = useState([])
  const [selectedServices, setSelectedServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  useEffect(() => {
    if (router.query.plan) setSelectedPlan(router.query.plan)
  }, [router.query.plan])

  function toggleVoice(v) {
    if (selectedVoices.includes(v)) {
      setSelectedVoices(selectedVoices.filter(x => x !== v))
    } else if (selectedVoices.length < 3) {
      setSelectedVoices([...selectedVoices, v])
    }
  }

  function toggleService(s) {
    if (selectedServices.includes(s)) {
      setSelectedServices(selectedServices.filter(x => x !== s))
    } else {
      setSelectedServices([...selectedServices, s])
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!selectedPlan) { alert('Please select a plan.'); return }
    if (selectedVoices.length === 0) { alert('Please select at least one brand voice.'); return }
    setLoading(true)

    const formData = new FormData(e.target)
    const payload = Object.fromEntries(formData.entries())
    payload.plan = selectedPlan
    payload.brand_voice = selectedVoices.join(', ')
    payload.services = selectedServices

    try {
      await fetch('/api/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } catch (_) {}

    // Redirect to Stripe based on plan
    const stripeUrl = payload.plan === 'growth'
      ? 'https://buy.stripe.com/5kQ14n9Bc3MC38c8xFaVa01'
      : 'https://buy.stripe.com/7sY4gzdRs96WdMQ29haVa00'

    window.location.href = stripeUrl
    setLoading(false)
  }

  return (
    <>
      <Head>
        <title>Get Started — Flourish Glow</title>
        <meta name="description" content="Start your FlourishGlow subscription. Done-for-you monthly content for wellness practices." />
        <meta name="robots" content="noindex" />
      </Head>

      <Nav variant="simple" />

      <div className={styles.pageWrap}>
        <div className={styles.pageHeader}>
          <div className={styles.pageEyebrow}>Getting started</div>
          <h1>Let&apos;s build your<br /><em>first pack.</em></h1>
          <p>Complete the form below and we&apos;ll build your first content pack within 48 hours of your payment clearing. Takes about 10 minutes — you&apos;ll only do this once.</p>
        </div>

        <div className={styles.progressBar}>
          {['Your Info','Services','Brand Voice','Payment'].map((label, i) => (
            <div key={label} style={{display:'flex',alignItems:'center'}}>
              <div className={styles.progressStep}>
                <div className={`${styles.progressCircle} ${step > i ? styles.done : step === i + 1 ? styles.active : ''}`}>
                  {step > i ? '✓' : i + 1}
                </div>
                <div className={`${styles.progressLabel} ${step === i + 1 ? styles.activeLabel : ''}`}>{label}</div>
              </div>
              {i < 3 && <div className={`${styles.progressConnector} ${step > i + 1 ? styles.connectorDone : ''}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.formCard}>

            {/* PLAN */}
            <div className={styles.cardSection}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionNum}>1</div>
                <div>
                  <div className={styles.sectionTitle}>Choose Your Plan</div>
                  <div className={styles.sectionSub}>Both plans include a one-time $197 setup fee</div>
                </div>
              </div>
              <div className={styles.planCards}>
                {[
                  {
                    id: 'core', name: 'Core', price: '397',
                    features: ['12 social captions + branded images','3-email reactivation sequence','Monthly promo email','4 Google Business Profile posts','Monthly strategy note','Branded PDF delivery'],
                    addons: []
                  },
                  {
                    id: 'growth', name: 'Growth', price: '597', badge: 'Most Popular',
                    features: ['Everything in Core','Priority 24hr turnaround','Quarterly promo calendar'],
                    addons: ['Review request sequence','New patient welcome sequence']
                  }
                ].map(plan => (
                  <div
                    key={plan.id}
                    className={`${styles.planCard} ${selectedPlan === plan.id ? styles.planSelected : ''}`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.badge && <div className={styles.planBadge}>{plan.badge}</div>}
                    <div className={`${styles.planCheck} ${selectedPlan === plan.id ? styles.planCheckActive : ''}`}>
                      {selectedPlan === plan.id && '✓'}
                    </div>
                    <div className={styles.planName}>{plan.name}</div>
                    <div className={styles.planPrice}><sup>$</sup>{plan.price}</div>
                    <div className={styles.planPeriod}>per month</div>
                    <ul className={styles.planFeatures}>
                      {plan.features.map(f => <li key={f} className={styles.planFeature}>{f}</li>)}
                      {plan.addons.map(f => <li key={f} className={`${styles.planFeature} ${styles.planAddon}`}>{f}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* PRACTICE INFO */}
            <div className={styles.cardSection}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionNum}>2</div>
                <div>
                  <div className={styles.sectionTitle}>About Your Practice</div>
                  <div className={styles.sectionSub}>How we address your pack and reach you</div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">First Name</label><input className="form-input" type="text" name="first_name" placeholder="Sarah" required /></div>
                <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" type="text" name="last_name" placeholder="Mitchell" required /></div>
              </div>
              <div className="form-group"><label className="form-label">Practice Name</label><input className="form-input" type="text" name="business_name" placeholder="Glow Aesthetic Studio" required /></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Email Address</label><input className="form-input" type="email" name="email" placeholder="sarah@glowstudio.com" required /></div>
                <div className="form-group"><label className="form-label">Phone <span className="optional">optional</span></label><input className="form-input" type="tel" name="phone" placeholder="(602) 555-0192" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">City &amp; State</label><input className="form-input" type="text" name="location" placeholder="Phoenix, AZ" required /></div>
                <div className="form-group"><label className="form-label">Website <span className="optional">optional</span></label><input className="form-input" type="url" name="website" placeholder="https://glowstudio.com" /></div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Practice Type</label>
                  <select className="form-input" name="practice_type" required defaultValue="">
                    <option value="" disabled>Select type</option>
                    <option>Med Spa / Aesthetic Clinic</option>
                    <option>Chiropractic</option>
                    <option>Physical Therapy</option>
                    <option>Massage Therapy</option>
                    <option>Other Wellness Practice</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Platform <span className="optional">optional</span></label>
                  <select className="form-input" name="email_platform" defaultValue="">
                    <option value="" disabled>Select platform</option>
                    <option>Mailchimp</option><option>Klaviyo</option>
                    <option>Constant Contact</option><option>ActiveCampaign</option>
                    <option>I don&apos;t have one yet</option><option>Other</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label className="form-label">Instagram Handle <span className="optional">optional</span></label><input className="form-input" type="text" name="instagram" placeholder="@glowstudio" /></div>
            </div>

            {/* SERVICES */}
            <div className={styles.cardSection}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionNum}>3</div>
                <div>
                  <div className={styles.sectionTitle}>Your Services</div>
                  <div className={styles.sectionSub}>Check everything you offer — we&apos;ll rotate through them each month</div>
                </div>
              </div>
              <div className={styles.checkGrid}>
                {SERVICES.map(s => (
                  <div
                    key={s}
                    className={`${styles.checkItem} ${selectedServices.includes(s) ? styles.checkSelected : ''}`}
                    onClick={() => toggleService(s)}
                  >
                    <div className={styles.checkBox}>{selectedServices.includes(s) && '✓'}</div>
                    <span className={styles.checkLabel}>{s}</span>
                  </div>
                ))}
              </div>
              <div className="form-group" style={{marginTop:'16px'}}>
                <label className="form-label">Other Services <span className="optional">optional</span></label>
                <input className="form-input" type="text" name="other_services" placeholder="Kybella, skin tightening, vitamin injections..." />
              </div>
            </div>

            {/* BRAND VOICE */}
            <div className={styles.cardSection}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionNum}>4</div>
                <div>
                  <div className={styles.sectionTitle}>Your Brand Voice</div>
                  <div className={styles.sectionSub}>This shapes every word we write for you</div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Describe Your Ideal Client</label>
                <textarea className="form-input" name="ideal_client" placeholder="e.g. Women 35–55, busy professionals, value natural-looking results, willing to invest in themselves..." required />
              </div>
              <div className="form-group">
                <label className="form-label">Brand Voice — Select up to 3</label>
                <div className={styles.voicePills}>
                  {VOICE_OPTIONS.map(v => (
                    <div
                      key={v}
                      className={`${styles.voicePill} ${selectedVoices.includes(v) ? styles.voiceSelected : ''}`}
                      onClick={() => toggleVoice(v)}
                    >{v}</div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Anything We Should Never Write or Do <span className="optional">optional</span></label>
                <textarea className="form-input" name="avoid" style={{minHeight:'80px'}} placeholder="e.g. Don't mention competitor names, avoid aggressive sales language..." />
              </div>
            </div>

            {/* FIRST MONTH */}
            <div className={styles.cardSection}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionNum}>5</div>
                <div>
                  <div className={styles.sectionTitle}>Your First Month&apos;s Focus</div>
                  <div className={styles.sectionSub}>Every month after this, we&apos;ll send you a quick 3-question update</div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Any Current Promotions or Seasonal Push?</label>
                <textarea className="form-input" name="first_month_promo" placeholder="e.g. 20% off HydraFacials this month, summer body prep campaign..." />
                <p className="form-hint">Leave blank and we&apos;ll create a strategy based on your services and the current season.</p>
              </div>
              <div className="form-group">
                <label className="form-label">Anything Else for Month One? <span className="optional">optional</span></label>
                <textarea className="form-input" name="first_month_notes" style={{minHeight:'80px'}} placeholder="New services launching, recent rebrand, upcoming events..." />
              </div>
            </div>

            {/* SUBMIT */}
            <div className={styles.submitSection}>
              <p className={styles.submitAgreement}>
                By submitting you agree to our <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link>. You&apos;ll be redirected to Stripe to complete your one-time $197 setup fee. Monthly charges begin on your first delivery date.
              </p>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Saving your details...' : 'Complete Setup & Proceed to Payment →'}
              </button>
              <p className={styles.submitNote}>Redirects to <strong>Stripe</strong> · Secured by 256-bit SSL · Cancel anytime · No long-term contracts</p>
            </div>

          </div>

          <div className={styles.trustBar}>
            {['🔒 Secure Stripe payment','📄 First pack in 48 hours','✉️ Cancel anytime','🤝 No long-term contracts'].map(t => (
              <div className={styles.trustItem} key={t}>{t}</div>
            ))}
          </div>
        </form>
      </div>

      <Footer variant="simple" />
    </>
  )
}
