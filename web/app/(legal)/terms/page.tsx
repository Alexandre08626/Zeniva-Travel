import React from "react";
import Link from "next/link";
import OrganizationSchema from "../../../src/components/legal/OrganizationSchema";
import LegalContactBlock from "../../../src/components/legal/LegalContactBlock";
import { createLegalMetadata } from "../../../src/components/legal/legal-metadata";
import {
  LEGAL_LAST_UPDATED,
  LEGAL_POLICY_VERSION,
} from "../../../src/components/legal/legal-constants";

export const metadata = createLegalMetadata({
  title: "Terms of Service",
  description:
    "Terms governing Zeniva Travel concierge services, bookings, payments, and liability limits.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="legal-container">
      <OrganizationSchema />
      <div>
        <span className="legal-badge">Terms</span>
        <h1 className="legal-title">Terms of Service</h1>
        <p className="legal-subtitle">
          These Terms of Service govern your use of Zeniva Travel and our concierge
          services. By using our services, you agree to these terms.
        </p>
        <div className="legal-meta">
          <span>Last updated: {LEGAL_LAST_UPDATED}</span>
          <span>Policy version: {LEGAL_POLICY_VERSION}</span>
        </div>
      </div>

      <div className="info-card">
        <h3>Key points</h3>
        <ul>
          <li>We act as a concierge and intermediary, not as the provider.</li>
          <li>Quotes are not binding until confirmed in writing with payment.</li>
          <li>Liability is limited to fees paid directly to Zeniva.</li>
        </ul>
      </div>

      <div className="legal-toc">
        <strong>Table of contents</strong>
        <ul>
          <li><a href="#services">Services and scope</a></li>
          <li><a href="#quotes">Quotes and availability</a></li>
          <li><a href="#bookings">Bookings and confirmation</a></li>
          <li><a href="#payments">Payments</a></li>
          <li><a href="#cancellations">Cancellations and changes</a></li>
          <li><a href="#responsibilities">Traveler responsibilities</a></li>
          <li><a href="#acceptable-use">Acceptable use</a></li>
          <li><a href="#ai">AI disclaimer</a></li>
          <li><a href="#risk">Risk allocation</a></li>
          <li><a href="#liability">Limitation of liability</a></li>
          <li><a href="#governing-law">Governing law</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </div>

      <section id="services" className="legal-section">
        <h2>Services and scope</h2>
        <p>
          Zeniva Travel provides travel planning, concierge support, and booking
          coordination. We are not the owner or operator of airlines, hotels,
          cruise lines, yacht operators, or other travel providers.
        </p>
      </section>

      <section id="quotes" className="legal-section">
        <h2>Quotes and availability</h2>
        <p>
          Quotes and recommendations are estimates and are subject to availability
          and change. Pricing and availability are controlled by providers.
        </p>
      </section>

      <section id="bookings" className="legal-section">
        <h2>Bookings and confirmation</h2>
        <p>
          A booking is confirmed only after you receive written confirmation and
          any required payment or deposit has been received.
        </p>
      </section>

      <section id="payments" className="legal-section">
        <h2>Payments</h2>
        <p>
          Payments are processed by third-party payment processors. We do not
          store full payment card numbers. Pass-through amounts paid to providers
          are governed by their terms.
        </p>
      </section>

      <section id="cancellations" className="legal-section">
        <h2>Cancellations and changes</h2>
        <p>
          Cancellation and change policies are set by each provider and may be
          non-refundable. We will communicate these terms at booking time.
        </p>
      </section>

      <section id="responsibilities" className="legal-section">
        <h2>Traveler responsibilities</h2>
        <p>
          Travelers are responsible for passports, visas, health requirements,
          and compliance with laws and carrier policies. We strongly recommend
          travel insurance.
        </p>
      </section>

      <section id="acceptable-use" className="legal-section">
        <h2>Acceptable use</h2>
        <p>
          You agree not to misuse the services, interfere with security, or
          engage in unlawful, abusive, or harmful behavior.
        </p>
      </section>

      <section id="ai" className="legal-section">
        <h2>AI disclaimer</h2>
        <p>
          AI-assisted recommendations are informational and may be inaccurate or
          outdated. They do not constitute binding offers. Review our
          <Link href="/ai-terms"> AI Terms of Use</Link> for details.
        </p>
      </section>

      <section id="risk" className="legal-section">
        <h2>Risk allocation</h2>
        <p>
          We are not liable for provider failures, injuries, maritime risks,
          regulatory requirements, lost documents, delays, or force majeure
          events beyond our reasonable control.
        </p>
      </section>

      <section id="liability" className="legal-section">
        <h2>Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, Zeniva's total aggregate
          liability is limited to the fees paid directly to Zeniva for the
          services at issue, excluding pass-through amounts paid to providers.
        </p>
      </section>

      <section id="governing-law" className="legal-section">
        <h2>Governing law</h2>
        <p>
          These Terms are governed by Delaware law, and disputes will be brought
          in Delaware courts unless consumer protection laws require otherwise.
        </p>
      </section>

      <section id="contact" className="legal-section">
        <h2>Contact</h2>
        <LegalContactBlock />
      </section>
    </div>
  );
}
