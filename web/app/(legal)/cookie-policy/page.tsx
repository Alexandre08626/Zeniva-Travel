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
  title: "Cookie Policy",
  description:
    "Details on how Zeniva Travel uses cookies, pixels, and SDKs, including categories and consent choices.",
  path: "/cookie-policy",
});

export default function CookiePolicyPage() {
  return (
    <div className="legal-container">
      <OrganizationSchema />
      <div>
        <span className="legal-badge">Policy</span>
        <h1 className="legal-title">Cookie Policy</h1>
        <p className="legal-subtitle">
          This Cookie Policy explains how Zeniva Travel uses cookies, pixels, and
          SDKs, and how you can manage your preferences.
        </p>
        <div className="legal-meta">
          <span>Last updated: {LEGAL_LAST_UPDATED}</span>
          <span>Policy version: {LEGAL_POLICY_VERSION}</span>
        </div>
      </div>

      <div className="info-card">
        <h3>Key points</h3>
        <ul>
          <li>Essential cookies are always on to keep the site secure and functional.</li>
          <li>Analytics and marketing cookies are optional and require consent.</li>
          <li>You can update choices anytime using the Cookie Settings link.</li>
        </ul>
      </div>

      <div className="legal-toc">
        <strong>Table of contents</strong>
        <ul>
          <li><a href="#what-are-cookies">What are cookies and SDKs</a></li>
          <li><a href="#categories">Categories</a></li>
          <li><a href="#vendors">Vendors</a></li>
          <li><a href="#consent">Consent management</a></li>
          <li><a href="#retention">Retention of choices</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </div>

      <section id="what-are-cookies" className="legal-section">
        <h2>What are cookies, pixels, and SDKs</h2>
        <p>
          Cookies are small files stored on your device. Pixels and SDKs are
          similar technologies that collect usage data or enable features such as
          analytics, fraud prevention, and marketing measurement.
        </p>
      </section>

      <section id="categories" className="legal-section">
        <h2>Categories</h2>
        <table className="legal-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Purpose</th>
              <th>Default</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Essential</td>
              <td>Security, network management, accessibility, and core features.</td>
              <td>Always on</td>
            </tr>
            <tr>
              <td>Preferences</td>
              <td>Remember settings and language choices.</td>
              <td>Optional</td>
            </tr>
            <tr>
              <td>Analytics</td>
              <td>Usage analytics, performance monitoring, and reporting.</td>
              <td>Optional</td>
            </tr>
            <tr>
              <td>Marketing</td>
              <td>Campaign measurement and advertising performance.</td>
              <td>Optional</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section id="vendors" className="legal-section">
        <h2>Vendors</h2>
        <p>
          When enabled, we may use vendors such as Google Analytics 4 (GA4), Meta
          Pixel, or Hotjar to understand how our site is used or to measure
          marketing performance. We only activate these tools after consent.
        </p>
      </section>

      <section id="consent" className="legal-section">
        <h2>Consent management</h2>
        <p>
          You can accept, reject, or manage optional cookies from our banner. You
          can also control cookies through your browser settings. For more detail,
          open the Cookie Settings link in the footer.
        </p>
      </section>

      <section id="retention" className="legal-section">
        <h2>Retention of choices</h2>
        <p>
          We store your consent choices in local storage and a cookie to respect
          your preferences across visits. You can update your selections at any
          time.
        </p>
      </section>

      <section id="contact" className="legal-section">
        <h2>Contact</h2>
        <p>
          If you have questions about cookies, review our
          <Link href="/privacy-policy"> Privacy Policy</Link> or contact us below.
        </p>
        <LegalContactBlock />
      </section>
    </div>
  );
}
