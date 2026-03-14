import React from "react";
import OrganizationSchema from "../../../src/components/legal/OrganizationSchema";
import PrivacyPolicySchema from "../../../src/components/legal/PrivacyPolicySchema";
import LegalContactBlock from "../../../src/components/legal/LegalContactBlock";
import { createLegalMetadata } from "../../../src/components/legal/legal-metadata";
import {
  LEGAL_EFFECTIVE_DATE,
  LEGAL_LAST_UPDATED,
  LEGAL_POLICY_VERSION,
  LEGAL_OPERATOR,
} from "../../../src/components/legal/legal-constants";

export const metadata = createLegalMetadata({
  title: "Privacy Policy – Partners | Zeniva Travel",
  description:
    "Privacy policy for Zeniva Travel Partner Mode, covering supplier data protection and US/Canada compliance.",
  path: "/privacy-partners",
});

export default function PrivacyPartnersPage() {
  return (
    <div className="legal-container">
      <OrganizationSchema />
      <PrivacyPolicySchema title="Privacy Policy - Partner Mode" path="/privacy-partners" />
      <div>
        <span className="legal-badge">Policy</span>
        <h1 className="legal-title">Privacy Policy - Partner Mode</h1>
        <p className="legal-subtitle">
          This Privacy Policy applies to Partner Mode users, including hosts,
          suppliers, and service providers operating on Zeniva Travel.
        </p>
        <div className="legal-meta">
          <span>Effective date: {LEGAL_EFFECTIVE_DATE}</span>
          <span>Last updated: {LEGAL_LAST_UPDATED}</span>
          <span>Version: {LEGAL_POLICY_VERSION}</span>
        </div>
      </div>

      <div className="legal-toc">
        <strong>Table of contents</strong>
        <ul>
          <li><a href="#introduction">Introduction</a></li>
          <li><a href="#information-collected">Information collected</a></li>
          <li><a href="#booking-shared">Booking information shared</a></li>
          <li><a href="#use">Use of partner information</a></li>
          <li><a href="#ai">AI and marketplace algorithms</a></li>
          <li><a href="#payments">Payments and financial processing</a></li>
          <li><a href="#sharing">Data sharing</a></li>
          <li><a href="#obligations">Partner obligations</a></li>
          <li><a href="#retention">Data retention</a></li>
          <li><a href="#transfers">International transfers</a></li>
          <li><a href="#ccpa">U.S. privacy rights (CCPA)</a></li>
          <li><a href="#pipeda">Canadian privacy rights (PIPEDA)</a></li>
          <li><a href="#contact">Contact information</a></li>
        </ul>
      </div>

      <section id="introduction" className="legal-section">
        <h2>Introduction</h2>
        <p>
          Zeniva Travel is an AI-powered travel agency platform operated by {LEGAL_OPERATOR}.
          Partner Mode is designed for independent contractors such as property
          hosts, yacht providers, tour operators, and luxury service suppliers.
        </p>
      </section>

      <section id="information-collected" className="legal-section">
        <h2>Information collected</h2>
        <h3>Business data</h3>
        <ul>
          <li>Legal name, trade name, business address, and contact information.</li>
          <li>Tax ID, banking details, registration documents, and insurance records.</li>
        </ul>
        <h3>Technical data</h3>
        <ul>
          <li>Platform usage, listing analytics, and communication logs.</li>
        </ul>
      </section>

      <section id="booking-shared" className="legal-section">
        <h2>Booking information shared with partners</h2>
        <p>
          To fulfill bookings, partners receive limited traveler data such as
          traveler name, booking dates, limited contact details, and special
          requests. Access is provided on a need-to-know basis.
        </p>
      </section>

      <section id="use" className="legal-section">
        <h2>Use of partner information</h2>
        <ul>
          <li>Listing management, availability, and service fulfillment.</li>
          <li>Payouts and financial reconciliation.</li>
          <li>Fraud detection, compliance, and platform security.</li>
          <li>Ranking and marketplace quality controls.</li>
        </ul>
      </section>

      <section id="ai" className="legal-section">
        <h2>AI and marketplace algorithms</h2>
        <p>
          Zeniva uses AI systems for listing ranking, pricing optimization
          suggestions, risk detection, and demand forecasting. No guarantee of
          ranking priority is provided.
        </p>
      </section>

      <section id="payments" className="legal-section">
        <h2>Payments and financial processing</h2>
        <p>
          We use secure payment processors and encrypt banking details where
          appropriate. Zeniva does not store full payment card numbers. Payout
          schedules are defined in partner agreements and dashboards.
        </p>
      </section>

      <section id="sharing" className="legal-section">
        <h2>Data sharing</h2>
        <p>We may share partner information with:</p>
        <ul>
          <li>Payment providers and financial institutions.</li>
          <li>Insurance partners and compliance auditors.</li>
          <li>Legal authorities when required by law.</li>
          <li>Cloud infrastructure and operational vendors.</li>
        </ul>
        <p>We do not resell partner personal data.</p>
      </section>

      <section id="obligations" className="legal-section">
        <h2>Partner obligations</h2>
        <ul>
          <li>Use traveler data only for service fulfillment.</li>
          <li>Do not market to travelers without consent.</li>
          <li>Do not retain data longer than necessary.</li>
          <li>Secure systems and credentials.</li>
          <li>Comply with GDPR/CCPA/PIPEDA where applicable.</li>
        </ul>
      </section>

      <section id="retention" className="legal-section">
        <h2>Data retention</h2>
        <p>We retain partner records for seven years for financial compliance.</p>
      </section>

      <section id="transfers" className="legal-section">
        <h2>International transfers</h2>
        <p>
          Data may be processed in Canada, the United States, or other jurisdictions
          with appropriate safeguards.
        </p>
      </section>

      <section id="ccpa" className="legal-section">
        <h2>U.S. privacy rights (CCPA)</h2>
        <ul>
          <li>Right to know what personal data is collected and disclosed.</li>
          <li>Right to delete and correct personal data.</li>
          <li>Right to non-discrimination for exercising privacy rights.</li>
          <li>We do not sell personal data.</li>
        </ul>
      </section>

      <section id="pipeda" className="legal-section">
        <h2>Canadian privacy rights (PIPEDA)</h2>
        <ul>
          <li>Access to your personal information.</li>
          <li>Correction of inaccurate or incomplete data.</li>
          <li>Withdrawal of consent where applicable.</li>
        </ul>
      </section>

      <section id="contact" className="legal-section">
        <h2>Contact information</h2>
        <p>Privacy contact: Alexandre Blais</p>
        <LegalContactBlock />
      </section>
    </div>
  );
}
