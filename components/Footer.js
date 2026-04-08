import Link from 'next/link'

export default function Footer({ variant = 'main' }) {
  if (variant === 'simple') {
    return (
      <footer className="footer">
        <Link href="/" className="footer-logo">Flourish<span>Glow</span></Link>
        <div className="footer-copy">© {new Date().getFullYear()} FlourishGlow · Inboxx Digital, LLC</div>
      </footer>
    )
  }

  return (
    <footer className="footer">
      <div>
        <Link href="/" className="footer-logo">Flourish<span>Glow</span></Link>
        <div className="footer-tagline">Done-for-you content for wellness practices</div>
      </div>
      <ul className="footer-links">
        <li><Link href="/#how-it-works">How It Works</Link></li>
        <li><Link href="/#pricing">Pricing</Link></li>
        <li><Link href="/#sample">Sample</Link></li>
        <li><Link href="/terms">Terms of Service</Link></li>
        <li><Link href="/privacy">Privacy Policy</Link></li>
        <li><a href="mailto:hello@flourishglow.com">hello@flourishglow.com</a></li>
      </ul>
    </footer>
  )
}
