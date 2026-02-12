import Link from "next/link";
import React from "react";
import CookieSettingsLink from "./CookieSettingsLink.client";

export default function LegalFooter() {
  return (
    <footer className="legal-footer">
      <div className="legal-container legal-footer-inner">
        <div className="legal-footer-links">
          <Link href="/">Home</Link>
          <Link href="/privacy-policy">Privacy</Link>
          <Link href="/cookie-policy">Cookies</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/ai-terms">AI Terms</Link>
          <Link href="/data-requests">Data Requests</Link>
          <Link href="/chat">Talk to Lina</Link>
          <CookieSettingsLink className="legal-link-button" />
        </div>
        <div className="legal-footer-note">
          Zeniva Travel is operated by Zeniva LLC. For privacy questions, email
          info@zeniva.ca.
        </div>
      </div>
    </footer>
  );
}
