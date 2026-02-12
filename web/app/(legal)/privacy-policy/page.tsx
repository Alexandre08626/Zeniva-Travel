import React from "react";
import Link from "next/link";
import OrganizationSchema from "../../../src/components/legal/OrganizationSchema";
import LegalContactBlock from "../../../src/components/legal/LegalContactBlock";
import { createLegalMetadata } from "../../../src/components/legal/legal-metadata";
import {
  LEGAL_LAST_UPDATED,
  LEGAL_POLICY_VERSION,
  LEGAL_OPERATOR,
  LEGAL_EMAIL,
} from "../../../src/components/legal/legal-constants";

export const metadata = createLegalMetadata({
  title: "Privacy Policy",
  description:
    "Enterprise privacy disclosures for Zeniva Travel, including how we collect, use, and share personal information.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <div className="legal-container">
      <OrganizationSchema />
      <div>
        <span className="legal-badge">Policy</span>
        <h1 className="legal-title">Privacy Policy</h1>
        <p className="legal-subtitle">
          This Privacy Policy explains how Zeniva Travel ("Zeniva", "we", "us")
          collects, uses, and discloses information when you use our services or
          communicate with our concierge team.
        </p>
        <div className="legal-meta">
          <span>Last updated: {LEGAL_LAST_UPDATED}</span>
          <span>Policy version: {LEGAL_POLICY_VERSION}</span>
        </div>
      </div>

      <div className="info-card">
        <h3>Overview and key points</h3>
        <ul>
          <li>We collect information you provide, data from devices, and partner data.</li>
          <li>We use information to deliver travel services, support, and compliance.</li>
          <li>We do not sell personal information or share it for others' advertising.</li>
          <li>You can access, correct, delete, or restrict your data at any time.</li>
        </ul>
      </div>

      <div className="info-card">
        <h3>Additional privacy notices</h3>
        <p>
          If you use Zeniva in a different role, review the policies below:
        </p>
        <ul>
          <li>
            <Link href="/privacy-agents">Privacy Policy - Agent Mode</Link>
          </li>
          <li>
            <Link href="/privacy-partners">Privacy Policy - Partner Mode</Link>
          </li>
        </ul>
      </div>

      <div className="legal-toc">
        <strong>Table of contents</strong>
        <ul>
          <li><a href="#who-we-are">Who we are</a></li>
          <li><a href="#scope">Scope</a></li>
          <li><a href="#information-we-collect">Information we collect</a></li>
          <li><a href="#how-we-use">How we use information</a></li>
          <li><a href="#ai-concierge">AI concierge and human review</a></li>
          <li><a href="#messaging-platforms">Messaging platforms</a></li>
          <li><a href="#sharing">Sharing and disclosure</a></li>
          <li><a href="#international">International transfers</a></li>
          <li><a href="#retention">Retention</a></li>
          <li><a href="#security">Security</a></li>
          <li><a href="#rights">Your rights and choices</a></li>
          <li><a href="#california">California notice</a></li>
          <li><a href="#gdpr">EEA and UK</a></li>
          <li><a href="#cookies">Cookies</a></li>
          <li><a href="#children">Children</a></li>
          <li><a href="#changes">Changes</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </div>

      <section id="who-we-are" className="legal-section">
        <h2>Who we are</h2>
        <p>
          Zeniva Travel is operated by {LEGAL_OPERATOR}. We provide concierge travel
          planning, trip proposals, and booking coordination, including human
          support and the Lina AI concierge.
        </p>
      </section>

      <section id="scope" className="legal-section">
        <h2>Scope</h2>
        <p>
          This policy applies to our websites, applications, communications, and
          services. If you provide information about other travelers, you confirm
          you have permission to share their information with us.
        </p>
      </section>

      <section id="information-we-collect" className="legal-section">
        <h2>Information we collect</h2>
        <h3>Information you provide</h3>
        <ul>
          <li>Identity and contact details (name, email, phone, passport data).</li>
          <li>Trip details, preferences, and special requests.</li>
          <li>Communications with our team or Lina AI.</li>
          <li>Booking details and confirmations.</li>
          <li>Payment information. We do not store full card numbers.</li>
        </ul>
        <h3>Information collected automatically</h3>
        <ul>
          <li>Device and usage data, such as IP address, browser, and pages viewed.</li>
          <li>Cookie and analytics data to understand performance and engagement.</li>
        </ul>
        <h3>Information from partners</h3>
        <ul>
          <li>Travel providers (airlines, hotels, yacht operators, insurers).</li>
          <li>Service vendors such as CRM, hosting, and analytics platforms.</li>
        </ul>
      </section>

      <section id="how-we-use" className="legal-section">
        <h2>How we use information</h2>
        <ul>
          <li>Deliver, manage, and personalize travel services.</li>
          <li>Provide support, updates, and service communications.</li>
          <li>Improve our services, operations, and product quality.</li>
          <li>Send marketing communications where you have a choice to opt out.</li>
          <li>Comply with legal obligations and prevent fraud or abuse.</li>
        </ul>
      </section>

      <section id="ai-concierge" className="legal-section">
        <h2>AI concierge and human review</h2>
        <p>
          Lina AI may assist in drafting suggestions and itineraries. AI outputs can
          be inaccurate or outdated and are not binding offers. We maintain human
          oversight, escalation to a concierge agent on request, and quality review
          processes. Conversation logs may be used for quality assurance, and we do
          not sell AI conversation data.
        </p>
      </section>

      <section id="messaging-platforms" className="legal-section">
        <h2>Messaging platforms</h2>
        <p>
          If you contact us via WhatsApp, Instagram, or Messenger through Meta
          Business APIs, we store conversation history and may use automated
          replies. You can request a human at any time. Reply STOP to opt out of
          automation, but essential service messages may still be sent.
        </p>
      </section>

      <section id="sharing" className="legal-section">
        <h2>Sharing and disclosure</h2>
        <ul>
          <li>Travel providers and suppliers to fulfill your bookings.</li>
          <li>Vendors that support hosting, CRM, analytics, and AI tooling.</li>
          <li>Payment processors and financial institutions.</li>
          <li>Legal, safety, or regulatory disclosures when required.</li>
        </ul>
        <p>
          We do not sell personal information and do not share it for third-party
          advertising purposes.
        </p>
      </section>

      <section id="international" className="legal-section">
        <h2>International transfers</h2>
        <p>
          We may process information in the United States and other countries.
          Where required, we use appropriate safeguards for cross-border data
          transfers.
        </p>
      </section>

      <section id="retention" className="legal-section">
        <h2>Retention</h2>
        <p>
          We retain records for 3 to 7 years for tax, accounting, and regulatory
          purposes. Operational data is kept for active services, and deletion
          requests are processed within 30 days unless a legal hold applies.
        </p>
      </section>

      <section id="security" className="legal-section">
        <h2>Security</h2>
        <p>
          We apply reasonable safeguards such as TLS, access controls, and
          encryption where appropriate. Do not send full card numbers or sensitive
          data through messaging channels.
        </p>
      </section>

      <section id="rights" className="legal-section">
        <h2>Your rights and choices</h2>
        <p>
          Depending on your location, you may have rights to access, correct,
          delete, restrict, object to processing, or withdraw consent. You can also
          request portability in a structured format.
        </p>
      </section>

      <section id="california" className="legal-section">
        <h2>California notice (CCPA/CPRA)</h2>
        <p>
          California residents can request access, deletion, and correction of
          their data. We do not sell or share personal information as defined by
          law. Learn more on our <Link href="/do-not-sell">Do Not Sell or Share</Link>
          page.
        </p>
      </section>

      <section id="gdpr" className="legal-section">
        <h2>EEA and UK</h2>
        <p>
          For users in the EEA or UK, our legal bases include contract performance,
          legitimate interests, consent where applicable, and legal obligations.
          Contact our data protection contact at {LEGAL_EMAIL}.
        </p>
      </section>

      <section id="cookies" className="legal-section">
        <h2>Cookies</h2>
        <p>
          We use cookies and similar technologies. Review the categories and
          manage your preferences in our <Link href="/cookie-policy">Cookie Policy</Link>.
        </p>
      </section>

      <section id="children" className="legal-section">
        <h2>Children</h2>
        <p>
          Our services are not directed to individuals under 18. We do not
          knowingly collect personal information from minors.
        </p>
      </section>

      <section id="changes" className="legal-section">
        <h2>Changes</h2>
        <p>
          We may update this policy from time to time. We will post the updated
          version with a new effective date.
        </p>
      </section>

      <section id="contact" className="legal-section">
        <h2>Contact</h2>
        <LegalContactBlock />
      </section>
    </div>
  );
}
