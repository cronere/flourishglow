import Head from 'next/head'
import Link from 'next/link'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import styles from '../styles/Thankyou.module.css'

export default function ThankYou() {
  return (
    <>
      <Head>
        <title>Welcome to Flourish Glow!</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Nav variant="simple" />
      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.icon}>🌿</div>
          <h1>You&apos;re in.</h1>
          <p className={styles.sub}>Welcome to FlourishGlow. Your first content pack is being built right now and will land in your inbox within 48 hours.</p>
          <div className={styles.nextSteps}>
            <div className={styles.nextStepsLabel}>What happens next</div>
            <div className={styles.step}><span className={styles.stepNum}>1</span><span>Check your inbox — a welcome email is on its way with everything you need to know.</span></div>
            <div className={styles.step}><span className={styles.stepNum}>2</span><span>We&apos;re building your first content pack based on your intake. No action needed from you.</span></div>
            <div className={styles.step}><span className={styles.stepNum}>3</span><span>Your branded PDF will arrive within 48 hours. Review, copy, paste, and post.</span></div>
            <div className={styles.step}><span className={styles.stepNum}>4</span><span>Three days before your next monthly pack, we&apos;ll send a quick 3-question update form.</span></div>
          </div>
          <p className={styles.contact}>Questions? Email us at <a href="mailto:hello@flourishglow.com">hello@flourishglow.com</a> — we&apos;re here.</p>
        </div>
      </div>
      <Footer variant="simple" />
    </>
  )
}
