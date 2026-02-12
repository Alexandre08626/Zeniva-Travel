import React from "react";
import "./legal.css";
import LegalHeader from "../../src/components/legal/LegalHeader";
import LegalFooter from "../../src/components/legal/LegalFooter";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="legal-page">
      <LegalHeader />
      <main className="legal-shell">{children}</main>
      <LegalFooter />
    </div>
  );
}
