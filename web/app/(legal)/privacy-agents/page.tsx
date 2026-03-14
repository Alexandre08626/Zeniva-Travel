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
  title: "Privacy Policy – Agents | Zeniva Travel",
  description:
    "Privacy policy for Zeniva Travel Agent Mode, covering AI-powered travel agency data protection and US/Canada compliance.",
  path: "/privacy-agents",
});

export default function PrivacyAgentsPage() {
  return (
    <div className="legal-container">
      <OrganizationSchema />
      <PrivacyPolicySchema title="Privacy Policy - Agent Mode" path="/privacy-agents" />
      <div>
        <span className="legal-badge">Policy</span>
        <h1 className="legal-title">Privacy Policy - Agent Mode</h1>
        <p className="legal-subtitle">
          This Privacy Policy applies to travel agents and agency representatives
          using Zeniva Travel's Agent Mode tools.
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
          <li><a href="#scope">Scope</a></li>
          <li><a href="#information-collected">Information we collect from agents</a></li>
          <li><a href="#traveler-data">Traveler data accessed by agents</a></li>
          <li><a href="#legal-basis">Legal basis for processing</a></li>
          <li><a href="#ai-processing">AI and automated processing</a></li>
          <li><a href="#data-sharing">Data sharing</a></li>
          <li><a href="#payment">Payment and PCI compliance</a></li>
          <li><a href="#retention">Data retention</a></li>
          <li><a href="#security">Security measures</a></li>
          <li><a href="#responsibilities">Agent responsibilities</a></li>
          <li><a href="#ccpa">U.S. privacy rights (CCPA)</a></li>
          <li><a href="#pipeda">Canadian privacy rights (PIPEDA)</a></li>
          <li><a href="#transfers">International transfers</a></li>
          <li><a href="#contact">Contact information</a></li>
        </ul>
      </div>

      <section id="introduction" className="legal-section">
        <h2>Introduction</h2>
        <p>
          Zeniva Travel is an AI-powered travel agency platform operated by {LEGAL_OPERATOR}
          with operations in Canada and the United States. This policy applies only
          to Agent Mode users and does not replace the Traveler or Partner privacy
          notices.
        </p>
      </section>

      <section id="scope" className="legal-section">
        <h2>Scope</h2>
        <p>This policy applies to:</p>
        <ul>
          <li>Travel agents and agency representatives.</li>
          <li>Sub-agents and contractors operating under an agency account.</li>
          <li>Corporate travel managers using Agent Mode tools.</li>
        </ul>
        <p>
          Your relationship with Zeniva is governed by your commercial agreement
          and these privacy terms.
        </p>
      </section>

      <section id="information-collected" className="legal-section">
        <h2>Information we collect from agents</h2>
        <h3>Identity data</h3>
        <ul>
          <li>Full legal name, business name, and address.</li>
          <li>Email, phone number, and professional license numbers.</li>
        </ul>
        <h3>Financial data</h3>
        <ul>
          <li>EIN or Tax ID, banking details for commissions, and W-9 forms.</li>
          <li>Tax documentation required for compliance.</li>
        </ul>
        <h3>Compliance data</h3>
        <ul>
          <li>Government-issued ID for KYC verification.</li>
          <li>AML checks and background verification where required.</li>
        </ul>
        <h3>Technical data</h3>
        <ul>
          <li>IP address, device information, login history, and usage logs.</li>
          <li>Booking behavior analytics and platform activity.</li>
        </ul>
      </section>

      <section id="traveler-data" className="legal-section">
        <h2>Traveler data accessed by agents</h2>
        <p>
          Agents may access traveler data needed to fulfill bookings, including
          traveler names, passport details, itineraries, booking references, and
          limited payment confirmations. Agents act as data processors when
          accessing traveler data, and Zeniva acts as the platform operator and
          data controller.
        </p>
      </section>

      <section id="legal-basis" className="legal-section">
        <h2>Legal basis for processing</h2>
        <ul>
          <li>Contractual necessity to provide Agent Mode services.</li>
          <li>Legitimate interests in operating and improving the platform.</li>
          <li>Legal compliance for tax, AML, and regulatory obligations.</li>
          <li>Fraud prevention and platform security.</li>
        </ul>
      </section>

      <section id="ai-processing" className="legal-section">
        <h2>AI and automated processing</h2>
        <p>Zeniva uses AI and automation to support Agent Mode operations, including:</p>
        <ul>
          <li>AI-generated itinerary assistance.</li>
          <li>AI fraud detection and risk scoring.</li>
          <li>Commission anomaly detection.</li>
          <li>Automated booking optimization.</li>
        </ul>
        <p>
          No legally significant decisions are made solely by automated systems
          without human oversight where required by law.
        </p>
      </section>

      <section id="data-sharing" className="legal-section">
        <h2>Data sharing</h2>
        <p>We may share agent data with:</p>
        <ul>
          <li>Payment processors and banking institutions.</li>
          <li>Fraud prevention and compliance services.</li>
          <li>Travel suppliers to fulfill bookings.</li>
          <li>Cloud infrastructure and service providers.</li>
          <li>Legal authorities when required by law.</li>
        </ul>
        <p>Zeniva does not sell agent personal data.</p>
      </section>

      <section id="payment" className="legal-section">
        <h2>Payment and PCI compliance</h2>
        <p>
          Zeniva does not store full credit card numbers. We use PCI-compliant
          third-party payment processors, and financial data is encrypted in
          transit and at rest where appropriate.
        </p>
      </section>

      <section id="retention" className="legal-section">
        <h2>Data retention</h2>
        <ul>
          <li>While your agent contract remains active.</li>
          <li>Seven years after termination for financial compliance.</li>
          <li>Longer retention if required by law or litigation holds.</li>
        </ul>
      </section>

      <section id="security" className="legal-section">
        <h2>Security measures</h2>
        <ul>
          <li>SSL/TLS encryption and secure communications.</li>
          <li>Role-based access control and audit logs.</li>
          <li>Data minimization and access reviews.</li>
          <li>Two-factor authentication where implemented.</li>
          <li>Incident response and breach notification protocols.</li>
        </ul>
      </section>

      <section id="responsibilities" className="legal-section">
        <h2>Agent responsibilities</h2>
        <ul>
          <li>Use traveler data only for booking fulfillment.</li>
          <li>Do not export, resell, or disclose traveler data.</li>
          <li>Secure your credentials and notify Zeniva of any breaches.</li>
          <li>Comply with applicable data protection laws and contracts.</li>
        </ul>
        <p>
          You agree to indemnify Zeniva for losses caused by unauthorized use or
          disclosure of traveler data.
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

      <section id="transfers" className="legal-section">
        <h2>International transfers</h2>
        <p>
          Your data may be processed in Canada, the United States, or other
          jurisdictions with appropriate safeguards.
        </p>
      </section>

      <section id="contact" className="legal-section">
        <h2>Contact information</h2>
        <p>Privacy contact: Alexandre Blais</p>
        <LegalContactBlock />
      </section>
    </div>
  );
}
