import Head from 'next/head'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms of Service — Flourish Glow</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Nav variant="simple" />
      <div className="legal-wrap">
        <div className="legal-header">
          <div className="legal-eyebrow">Legal</div>
          <h1>Terms of Service</h1>
          <div className="legal-meta">Last updated: June 1, 2025 · Inboxx Digital, LLC d/b/a FlourishGlow</div>
        </div>
        <div className="legal-body">
          <h2>1. Agreement to Terms</h2>
          <p>These Terms of Service ("Terms") constitute a legally binding agreement between you ("Client," "you," or "your") and Inboxx Digital, LLC, doing business as FlourishGlow ("FlourishGlow," "we," "us," or "our"), governing your access to and use of our marketing content delivery services, website at flourishglow.com, and all related services (collectively, the "Service").</p>
          <p>By completing the onboarding form, submitting payment, or otherwise using the Service, you agree to be bound by these Terms. If you do not agree, do not use the Service.</p>

          <h2>2. Description of Service</h2>
          <p>FlourishGlow provides a monthly done-for-you content service for wellness practices, including but not limited to med spas, chiropractic offices, physical therapy clinics, and massage therapy practices. Each month, we deliver a branded PDF containing:</p>
          <ul>
            <li>Social media captions (quantity per plan)</li>
            <li>Email marketing campaigns (reactivation sequences and/or promotional emails)</li>
            <li>Google Business Profile post copy</li>
            <li>A monthly strategy note</li>
            <li>Additional deliverables as specified in your selected plan</li>
          </ul>
          <p>Content is generated using artificial intelligence tools and reviewed by a human team member before delivery. Delivery is targeted within 48 hours of your monthly generation date (24 hours for Growth plan clients), though occasional delays may occur.</p>

          <h2>3. Subscription Plans and Billing</h2>
          <p><strong>Setup Fee:</strong> A one-time, non-refundable setup fee of $197 is charged at the time of onboarding to cover account configuration, intake processing, and first-pack preparation.</p>
          <p><strong>Monthly Subscription:</strong> After the setup fee, you will be charged your selected plan rate (Core: $397/month; Growth: $597/month) on a recurring monthly basis beginning on your first content delivery date. Billing is processed through Stripe.</p>
          <p><strong>Price Changes:</strong> We reserve the right to modify pricing with 30 days' written notice to your registered email address. Continued use of the Service after a price change constitutes acceptance of the new pricing.</p>
          <p><strong>Failed Payments:</strong> If a payment fails, we will attempt to retry the charge. If payment is not resolved within 7 days, your account may be suspended until payment is received.</p>

          <h2>4. Cancellation Policy</h2>
          <p>You may cancel your subscription at any time by emailing us at <a href="mailto:hello@flourishglow.com">hello@flourishglow.com</a>. Cancellations must be received at least 5 business days before your next scheduled billing date to avoid being charged for the following month. There are no long-term contracts or cancellation fees.</p>
          <p>Upon cancellation, you retain full ownership of all content already delivered to you. No refunds are issued for partial months or for the one-time setup fee.</p>

          <h2>5. Monthly Update Requirement</h2>
          <p>Three days before your scheduled monthly delivery date, we will send you a brief 3-question update form via email. This form allows you to provide promotional focus, new services, or other context for that month's content. If you do not complete the form, we will generate your content based on your intake profile and seasonal relevance. We are not responsible for content that does not reflect promotions or information you did not provide.</p>

          <h2>6. Intellectual Property and Content Ownership</h2>
          <p><strong>Your Content:</strong> Upon delivery and receipt of full payment for a given month, you own all marketing content delivered to you in that month's pack. You may use, modify, publish, and distribute the content in any manner related to your business.</p>
          <p><strong>Our Systems:</strong> FlourishGlow retains all rights to its proprietary workflows, prompts, templates, processes, and systems used to generate your content. You receive the output, not the methodology.</p>
          <p><strong>Accuracy:</strong> You are responsible for reviewing all delivered content for accuracy, compliance with applicable regulations, and brand appropriateness before publishing.</p>

          <h2>7. Compliance with Healthcare and Advertising Regulations</h2>
          <p>Content related to medical or aesthetic services may be subject to regulations from the Federal Trade Commission (FTC), state medical boards, and other regulatory bodies. You are solely responsible for ensuring that any content you publish complies with applicable laws. FlourishGlow does not provide legal or compliance advice.</p>

          <h2>8. Revisions</h2>
          <p>Each monthly pack includes one round of revisions requested within 7 days of delivery. Revisions are limited to adjustments of tone, specific wording, or factual corrections. Requests to fully regenerate content due to incomplete or inaccurate intake information may be subject to an additional fee.</p>

          <h2>9. Disclaimer of Warranties</h2>
          <p>THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT WARRANT THAT CONTENT DELIVERED WILL RESULT IN ANY PARTICULAR BUSINESS OUTCOME, REVENUE INCREASE, OR CLIENT ACQUISITION. RESULTS ARE NOT GUARANTEED.</p>

          <h2>10. Limitation of Liability</h2>
          <p>TO THE FULLEST EXTENT PERMITTED BY LAW, INBOXX DIGITAL, LLC SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU IN THE THREE MONTHS PRECEDING THE CLAIM.</p>

          <h2>11. Indemnification</h2>
          <p>You agree to indemnify and hold harmless FlourishGlow, its members, officers, and employees from any claims arising from your use or publication of content we deliver, your violation of these Terms, or your violation of any applicable law.</p>

          <h2>12. Governing Law and Dispute Resolution</h2>
          <p>These Terms are governed by the laws of the State of Arizona. Any disputes shall be resolved through binding arbitration in Maricopa County, Arizona, under the rules of the American Arbitration Association.</p>

          <h2>13. Changes to Terms</h2>
          <p>We may update these Terms from time to time with 14 days' notice by email. Continued use of the Service constitutes acceptance of updated Terms.</p>

          <h2>14. Contact</h2>
          <p><strong>Inboxx Digital, LLC d/b/a FlourishGlow</strong><br />Email: <a href="mailto:hello@flourishglow.com">hello@flourishglow.com</a><br />Phoenix, Arizona</p>
        </div>
      </div>
      <Footer variant="simple" />
    </>
  )
}
