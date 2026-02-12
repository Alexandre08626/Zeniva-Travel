import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function LegalHeader() {
  return (
    <header className="legal-header">
      <div className="legal-container legal-header-inner">
        <Link href="/" className="legal-logo">
          <Image src="/branding/logo.png" alt="Zeniva Travel" width={44} height={44} />
          <span>Zeniva Travel</span>
        </Link>
        <Link href="/" className="legal-back">
          Back to Home
        </Link>
      </div>
    </header>
  );
}
