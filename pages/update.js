import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import styles from '../styles/update.module.css' 

export default function Update() {
  const router = useRouter()
  const { client_id, name, business } = router.query

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [skipped, setSkipped] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.target)
    const payload = {
      client_id: client_id || '',
      business_name: business || '',
      promo_focus: formData.get('promo_focus') || '',
      new_services: formData.get('new_services') || '',
      other_notes: formData.get('other_notes') || '',
      submitted_at: new Date().toISOString()
    }

    try {
      await fetch('/api/monthly-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } catch (_) {}

    setSubmitted(true)
    setLoading(false)
  }

  async function handleSkip() {
    setSkipped(true)
    // POST with empty fields so we know they saw it
    try {
      await fetch('/api/monthly-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: client_id || '',
          business_name: business || '',
          promo_focus: '',
          new_services: '',
          other_notes: '',
          skipped: true,
          submitted_at: new Date().toISOString()
        })
      })
    } catch (_) {}
  }

  return (
    <>
      <Head>
        <title>Monthly Update — Flourish Glow</title>
        <meta name="robots" content="noindex" />
      </Head>

      <Nav variant="simple" />

      <div className={styles.wrap}>
        {submitted || skipped ? (
          <div className={styles.successCard}>
            <div className={styles.successIcon}>🌿</div>
            <h1 className={styles.successTitle}>
              {skipped ? "Got it — we'll handle it." : "You're all set."}
            </h1>
            <p className={styles.successSub}>
              {skipped
                ? `We'll build ${business ? `${business}'s` : 'your'} content pack based on your profile and the current season. It'll land in your inbox within 48 hours.`
                : `Thanks for the update. We'll build ${business ? `${business}'s` : 'your'} content pack around your focus this month. Look for it in your inbox within 48 hours.`
              }
            </p>
            <div className={styles.successNote}>
              Questions? Reply to any email from us or reach out at{' '}
              <a href="mailto:hello@flourishglow.com">hello@flourishglow.com</a>
            </div>
          </div>
        ) : (
          <div className={styles.formWrap}>
            <div className={styles.header}>
              <div className={styles.eyebrow}>Monthly content update</div>
              <h1>
                {name ? `Hey ${name} —` : 'Hey —'}<br />
                <em>2 minutes, that&apos;s all.</em>
              </h1>
              <p>
                Your next content pack generates in 3 days.
                Tell us what&apos;s happening this month so we can tailor everything to your practice.
                Leave anything blank and we&apos;ll handle it creatively.
              </p>
            </div>

            <div className={styles.card}>
              <form onSubmit={handleSubmit}>

                {/* Q1 */}
                <div className={styles.question}>
                  <div className={styles.questionNum}>01</div>
                  <div className={styles.questionContent}>
                    <label className={styles.questionLabel}>
                      Any promotions or special offers this month?
                    </label>
                    <p className={styles.questionHint}>
                      Discounts, seasonal specials, new service launches, events — anything you want to push.
                    </p>
                    <textarea
                      className={styles.textarea}
                      name="promo_focus"
                      placeholder="e.g. 20% off HydraFacials through the end of the month, pushing our new PRF service, summer body contouring special..."
                      rows={4}
                    />
                  </div>
                </div>

                {/* Q2 */}
                <div className={styles.question}>
                  <div className={styles.questionNum}>02</div>
                  <div className={styles.questionContent}>
                    <label className={styles.questionLabel}>
                      Any new services or changes to what you offer?
                    </label>
                    <p className={styles.questionHint}>
                      New treatments, equipment, staff, hours, or anything that changed since last month.
                    </p>
                    <textarea
                      className={styles.textarea}
                      name="new_services"
                      placeholder="e.g. Just added Sculptra, new laser device arriving next week, extended hours on Saturdays..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Q3 */}
                <div className={styles.question} style={{borderBottom: 'none', paddingBottom: 0}}>
                  <div className={styles.questionNum}>03</div>
                  <div className={styles.questionContent}>
                    <label className={styles.questionLabel}>
                      Anything else we should know or avoid this month?
                    </label>
                    <p className={styles.questionHint}>
                      Upcoming events, things going on in your community, topics to steer clear of — anything that helps us write better content for you.
                    </p>
                    <textarea
                      className={styles.textarea}
                      name="other_notes"
                      placeholder="e.g. Big local event coming up we can reference, avoid mentioning competitor by name, focusing on mature clientele this month..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className={styles.actions}>
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit My Update →'}
                  </button>
                  <button
                    type="button"
                    className={styles.skipBtn}
                    onClick={handleSkip}
                  >
                    Nothing new this month — use my profile
                  </button>
                </div>

              </form>
            </div>

            <div className={styles.footer}>
              <p>
                You&apos;ll receive your content pack within 48 hours of your scheduled generation date.
                Need to update your billing or plan?{' '}
                <a href="https://pay.flourishglow.com/p/login/7sY4gzdRs96WdMQ29haVa00">
                  Manage your account →
                </a>
              </p>
            </div>
          </div>
        )}
      </div>

      <Footer variant="simple" />
    </>
  )
}
