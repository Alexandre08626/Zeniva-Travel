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
  title: "Do Not Sell or Share",
  description:
    "California privacy notice for Do Not Sell or Share and limiting use of sensitive personal information.",
  path: "/do-not-sell",
});

export default function DoNotSellPage() {
  return (
    <div className="legal-container">
      <OrganizationSchema />
      <div>
        <span className="legal-badge">California</span>
        <h1 className="legal-title">Do Not Sell or Share</h1>
        <p className="legal-subtitle">
          Zeniva Travel does not sell or share personal information as defined by
          the California Consumer Privacy Act (CCPA/CPRA).
        </p>
        <div className="legal-meta">
          <span>Last updated: {LEGAL_LAST_UPDATED}</span>
          <span>Policy version: {LEGAL_POLICY_VERSION}</span>
        </div>
      </div>

      <section className="legal-section">
        <h2>Cookie controls</h2>
        <p>
          You can opt out of marketing cookies at any time using the Cookie
          Settings link in the footer or by visiting our
          <Link href="/cookie-policy"> Cookie Policy</Link>.
        </p>
        <p>
          We do not use or disclose sensitive personal information beyond what is
          reasonably necessary to provide our services.
        </p>
      </section>

      <section className="legal-section">
        <h2>Contact for requests</h2>
        <p>
          To submit a request, visit the
          <Link href="/data-requests"> Data Requests</Link> page or contact us
          below.
        </p>
        <LegalContactBlock />
      </section>
    </div>
  );
}
