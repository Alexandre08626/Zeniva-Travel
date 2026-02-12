import React from "react";
import {
  LEGAL_EMAIL,
  LEGAL_OPERATOR,
  LEGAL_OPERATIONAL_OFFICE,
  LEGAL_PRIVACY_OFFICER,
  LEGAL_REGISTERED_OFFICE,
  LEGAL_WEBSITE,
} from "./legal-constants";

export default function LegalContactBlock() {
  return (
    <div className="legal-contact">
      <p>Operator: {LEGAL_OPERATOR}</p>
      <p>Registered Office: {LEGAL_REGISTERED_OFFICE}</p>
      <p>Operational Office: {LEGAL_OPERATIONAL_OFFICE}</p>
      <p>
        Email: <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>
      </p>
      <p>
        Website: <a href={LEGAL_WEBSITE}>{LEGAL_WEBSITE}</a>
      </p>
      <p>
        Privacy Officer: {LEGAL_PRIVACY_OFFICER} ({LEGAL_EMAIL})
      </p>
    </div>
  );
}
