import React from "react";
import {
  LEGAL_BASE_URL,
  LEGAL_BRAND,
  LEGAL_EFFECTIVE_DATE,
  LEGAL_LAST_UPDATED,
} from "./legal-constants";

type PrivacyPolicySchemaProps = {
  title: string;
  path: string;
};

export default function PrivacyPolicySchema({
  title,
  path,
}: PrivacyPolicySchemaProps) {
  const url = `${LEGAL_BASE_URL}${path}`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "PrivacyPolicy",
        name: title,
        url,
        datePublished: LEGAL_EFFECTIVE_DATE,
        dateModified: LEGAL_LAST_UPDATED,
        publisher: {
          "@type": "Organization",
          name: LEGAL_BRAND,
          url: LEGAL_BASE_URL,
        },
      },
      {
        "@type": "LegalService",
        name: "Zeniva Travel Privacy Program",
        serviceType: "Privacy compliance and data protection",
        provider: {
          "@type": "Organization",
          name: LEGAL_BRAND,
          url: LEGAL_BASE_URL,
        },
        areaServed: ["US", "CA"],
        url: LEGAL_BASE_URL,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
