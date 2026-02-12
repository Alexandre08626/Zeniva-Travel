import React from "react";
import OrganizationSchema from "../../../src/components/legal/OrganizationSchema";
import LegalContactBlock from "../../../src/components/legal/LegalContactBlock";
import { createLegalMetadata } from "../../../src/components/legal/legal-metadata";
import {
  LEGAL_LAST_UPDATED,
  LEGAL_POLICY_VERSION,
} from "../../../src/components/legal/legal-constants";
import DsarForm from "../../../src/components/legal/DsarForm.client";

export const metadata = createLegalMetadata({
  title: "Data Requests",
  description:
    "Submit a data access, deletion, correction, or portability request to Zeniva Travel.",
  path: "/data-requests",
});

export default function DataRequestsPage() {
  return (
    <div className="legal-container">
      <OrganizationSchema />
      <div>
        <span className="legal-badge">DSAR</span>
        <h1 className="legal-title">Data Requests</h1>
        <p className="legal-subtitle">
          Use this form to request access, deletion, correction, or portability
          of your personal information.
        </p>
        <div className="legal-meta">
          <span>Last updated: {LEGAL_LAST_UPDATED}</span>
          <span>Policy version: {LEGAL_POLICY_VERSION}</span>
        </div>
      </div>

      <section className="legal-section">
        <h2>Request options</h2>
        <p>
          We respond within 30 days and may request identity verification to
          protect your data.
        </p>
        <DsarForm />
      </section>

      <section className="legal-section">
        <h2>Contact</h2>
        <LegalContactBlock />
      </section>
    </div>
  );
}
