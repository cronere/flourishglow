import { useState } from 'react'
import Link from 'next/link'

export default function Nav({ variant = 'main' }) {
  const [menuOpen, setMenuOpen] = useState(false)

  if (variant === 'simple') {
    return (
      <nav className="legal-nav">
        <Link href="/" className="nav-logo">
          Flourish<span>Glow</span>
        </Link>
        <Link href="/" className="nav-back">
          ← Back to Home
        </Link>
      </nav>
    )
  }

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-logo">
          Flourish<span>Glow</span>
        </Link>
        <ul className="nav-center">
          <li><Link href="/#how-it-works">How It Works</Link></li>
          <li><Link href="/#deliverables">What You Get</Link></li>
          <li><Link href="/#pricing">Pricing</Link></li>
          <li><Link href="/#sample">Sample</Link></li>
          <li><Link href="/#faq">FAQ</Link></li>
          <li><Link href="/blog">Blog</Link></li>
        </ul>
        <div className="nav-right">
          <Link href="/onboarding" className="nav-cta">Get Started</Link>
          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <Link href="/#how-it-works" onClick={() => setMenuOpen(false)}>How It Works</Link>
        <Link href="/#deliverables" onClick={() => setMenuOpen(false)}>What You Get</Link>
        <Link href="/#pricing" onClick={() => setMenuOpen(false)}>Pricing</Link>
        <Link href="/#sample" onClick={() => setMenuOpen(false)}>Sample</Link>
        <Link href="/#faq" onClick={() => setMenuOpen(false)}>FAQ</Link>
        <Link href="/blog" onClick={() => setMenuOpen(false)}>Blog</Link>
        <Link href="/onboarding" className="mobile-cta-btn" onClick={() => setMenuOpen(false)}>
          Get Started
        </Link>
      </div>
    </>
  )
}
