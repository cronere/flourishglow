import Head from 'next/head'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — Flourish Glow</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Nav variant="simple" />
      <div className="legal-wrap">
        <div className="legal-header">
          <div className="legal-eyebrow">Legal</div>
          <h1>Privacy Policy</h1>
          <div className="legal-meta">Last updated: June 1, 2025 · Inboxx Digital, LLC d/b/a FlourishGlow</div>
        </div>
        <div className="legal-body">
          <h2>1. Introduction</h2>
          <p>Inboxx Digital, LLC, doing business as FlourishGlow ("FlourishGlow," "we," "us," or "our"), respects your privacy and is committed to protecting your personal information. This Privacy Policy explains what information we collect, how we use it, and your rights with respect to it.</p>

          <h2>2. Information We Collect</h2>
          <p><strong>Information you provide directly:</strong></p>
          <ul>
            <li>Contact information: name, email address, phone number</li>
            <li>Business information: practice name, location, website, Instagram handle, practice type</li>
            <li>Service details: services offered, promotional information, brand voice preferences</li>
            <li>Payment information: processed and stored securely by Stripe; we do not store payment card numbers</li>
            <li>Monthly update form responses: promotional focus and content preferences</li>
            <li>Sample request information: name, email, practice name, and services</li>
          </ul>
          <p><strong>Information collected automatically:</strong></p>
          <ul>
            <li>Website usage data via standard web analytics</li>
            <li>IP address and approximate geographic location</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to deliver and personalize your monthly content packs, process payments, send service communications, respond to inquiries, improve our service, and comply with legal obligations. We do not sell your personal information.</p>

          <h2>4. How We Share Your Information</h2>
          <p>We share your information only with service providers necessary to operate the Service, including Stripe (payment processing), Supabase (data storage), Make.com (workflow automation), Anthropic (AI content generation), and email delivery providers. We do not share, sell, rent, or trade your personal information with third parties for their promotional purposes.</p>

          <h2>5. Data Retention</h2>
          <p>We retain your account information for as long as your subscription is active and for up to 2 years after cancellation. Monthly update responses are retained for 12 months. You may request deletion at any time.</p>

          <h2>6. Data Security</h2>
          <p>We implement industry-standard security measures including encrypted data storage via Supabase, HTTPS on all web pages, and limited access controls. No method of transmission is 100% secure.</p>

          <h2>7. Cookies</h2>
          <p>Our website uses essential cookies required for site function and analytics cookies to understand visitor behavior. You may disable cookies in your browser settings, though this may affect site functionality.</p>

          <h2>8. Your Rights</h2>
          <p>You have the right to access, correct, delete, and receive a portable copy of your personal information. You may opt out of marketing emails at any time. To exercise these rights, contact us at <a href="mailto:hello@flourishglow.com">hello@flourishglow.com</a>. We will respond within 30 days.</p>

          <h2>9. Children's Privacy</h2>
          <p>Our Service is intended for business owners and is not directed at individuals under 18. We do not knowingly collect personal information from children.</p>

          <h2>10. AI-Generated Content and Your Data</h2>
          <p>Your business information and monthly update responses are sent to Anthropic's Claude API to generate your content, in accordance with Anthropic's privacy policy. You should never include patient or client personal information in any form you submit to us.</p>

          <h2>11. Changes to This Policy</h2>
          <p>We may update this Privacy Policy periodically with notice by email or website posting. Continued use of the Service constitutes acceptance of the revised policy.</p>

          <h2>12. Contact Us</h2>
          <p><strong>Inboxx Digital, LLC d/b/a FlourishGlow</strong><br />Email: <a href="mailto:hello@flourishglow.com">hello@flourishglow.com</a><br />Phoenix, Arizona</p>
        </div>
      </div>
      <Footer variant="simple" />
    </>
  )
}
