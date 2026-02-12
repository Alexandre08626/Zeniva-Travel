import React from "react";
import {
  LEGAL_BASE_URL,
  LEGAL_BRAND,
  LEGAL_EMAIL,
  LEGAL_OPERATOR,
  LEGAL_OPERATIONAL_OFFICE,
  LEGAL_REGISTERED_OFFICE,
} from "./legal-constants";

export default function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: LEGAL_BRAND,
    legalName: LEGAL_OPERATOR,
    url: LEGAL_BASE_URL,
    logo: `${LEGAL_BASE_URL}/branding/logo.png`,
    email: LEGAL_EMAIL,
    address: [
      {
        "@type": "PostalAddress",
        streetAddress: "8 The Green, Suite A",
        addressLocality: "Dover",
        addressRegion: "Delaware",
        postalCode: "19901",
        addressCountry: "US",
      },
      {
        "@type": "PostalAddress",
        streetAddress: "780 Lynnhaven Pkwy #400",
        addressLocality: "Virginia Beach",
        addressRegion: "VA",
        postalCode: "23452",
        addressCountry: "US",
      },
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "privacy",
      email: LEGAL_EMAIL,
      areaServed: "US",
    },
    description:
      "Zeniva Travel provides concierge travel planning, proposals, and booking coordination powered by Lina AI.",
    location: [LEGAL_REGISTERED_OFFICE, LEGAL_OPERATIONAL_OFFICE],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
