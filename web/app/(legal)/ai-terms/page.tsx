import React from "react";
import OrganizationSchema from "../../../src/components/legal/OrganizationSchema";
import LegalContactBlock from "../../../src/components/legal/LegalContactBlock";
import { createLegalMetadata } from "../../../src/components/legal/legal-metadata";
import {
  LEGAL_LAST_UPDATED,
  LEGAL_POLICY_VERSION,
} from "../../../src/components/legal/legal-constants";

export const metadata = createLegalMetadata({
  title: "AI Terms of Use",
  description:
    "Terms governing Zeniva Travel AI features, including accuracy limits, human oversight, and acceptable use.",
  path: "/ai-terms",
});

export default function AiTermsPage() {
  return (
    <div className="legal-container">
      <OrganizationSchema />
      <div>
        <span className="legal-badge">Terms</span>
        <h1 className="legal-title">AI Terms of Use</h1>
        <p className="legal-subtitle">
          These AI Terms apply to Lina AI and any automated assistance provided
          by Zeniva Travel.
        </p>
        <div className="legal-meta">
          <span>Last updated: {LEGAL_LAST_UPDATED}</span>
          <span>Policy version: {LEGAL_POLICY_VERSION}</span>
        </div>
      </div>

      <div className="info-card">
        <h3>Summary</h3>
        <ul>
          <li>AI outputs are informational and not binding offers.</li>
          <li>Human oversight is available on request.</li>
          <li>Do not misuse the AI system or submit harmful content.</li>
        </ul>
      </div>

      <div className="legal-toc">
        <strong>Table of contents</strong>
        <ul>
          <li><a href="#scope">Scope</a></li>
          <li><a href="#accuracy">Accuracy and verification</a></li>
          <li><a href="#human">Human oversight</a></li>
          <li><a href="#acceptable-use">Acceptable use</a></li>
          <li><a href="#liability">Liability limitations</a></li>
          <li><a href="#changes">Modifications and suspension</a></li>
          <li><a href="#governing-law">Governing law</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </div>

      <section id="scope" className="legal-section">
        <h2>Scope</h2>
        <p>
          Lina AI provides informational travel assistance and draft proposals.
          AI outputs do not create a booking or binding offer.
        </p>
      </section>

      <section id="accuracy" className="legal-section">
        <h2>Accuracy and verification</h2>
        <p>
          AI outputs can be inaccurate or outdated. You should verify critical
          details such as pricing, availability, and policies before relying on
          them.
        </p>
      </section>

      <section id="human" className="legal-section">
        <h2>Human oversight</h2>
        <p>
          Our concierge team reviews requests and can validate AI outputs. You
          may request human assistance at any time.
        </p>
      </section>

      <section id="acceptable-use" className="legal-section">
        <h2>Acceptable use</h2>
        <ul>
          <li>Do not abuse, harass, or submit unlawful or harmful content.</li>
          <li>Do not reverse engineer or attempt to extract model parameters.</li>
          <li>Do not submit malicious inputs or attempt to bypass safeguards.</li>
        </ul>
      </section>

      <section id="liability" className="legal-section">
        <h2>Liability limitations</h2>
        <p>
          AI features are provided as-is. To the maximum extent permitted by law,
          Zeniva is not liable for reliance on AI outputs or for indirect or
          consequential damages.
        </p>
      </section>

      <section id="changes" className="legal-section">
        <h2>Modifications and suspension</h2>
        <p>
          We may modify, limit, or suspend AI features to improve quality,
          security, or compliance.
        </p>
      </section>

      <section id="governing-law" className="legal-section">
        <h2>Governing law</h2>
        <p>
          These AI Terms are governed by Delaware law, and disputes will be
          brought in Delaware courts unless consumer protection laws require
          otherwise.
        </p>
      </section>

      <section id="contact" className="legal-section">
        <h2>Contact</h2>
        <LegalContactBlock />
      </section>
    </div>
  );
}
