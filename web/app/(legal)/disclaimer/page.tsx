export const dynamic = "force-dynamic";
import React from "react";
import Link from "next/link";
import OrganizationSchema from "../../../src/components/legal/OrganizationSchema";
import LegalContactBlock from "../../../src/components/legal/LegalContactBlock";
import { createLegalMetadata } from "../../../src/components/legal/legal-metadata";
import {
  LEGAL_LAST_UPDATED,
  LEGAL_POLICY_VERSION,
  LEGAL_OPERATOR,
} from "../../../src/components/legal/legal-constants";

export const metadata = createLegalMetadata({
  title: "Platform Disclaimer",
  description:
    "Zeniva Travel acts solely as a technology intermediary. Travel services are provided by third-party suppliers.",
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return (
    <div className="legal-container">
      <OrganizationSchema />
      <div>
        <span className="legal-badge">Disclaimer</span>
        <h1 className="legal-title">Platform Disclaimer</h1>
        <p className="legal-subtitle">
          Zeniva Travel acts solely as a technology intermediary. Travel
          services are provided by independent third-party suppliers.
        </p>
        <div className="legal-meta">
          <span>Last updated: {LEGAL_LAST_UPDATED}</span>
          <span>Policy version: {LEGAL_POLICY_VERSION}</span>
        </div>
      </div>

      <div className="info-card">
        <h3>Key points</h3>
        <ul>
          <li>
            Zeniva is an AI-powered <strong>technology platform</strong> — not a
            travel supplier.
          </li>
          <li>
            The platform is operated by {LEGAL_OPERATOR}, a Delaware company.
          </li>
          <li>
            Flights, hotels, yachts, villas, cruises, transfers, activities and
            insurance are provided, fulfilled and operated by independent
            third-party suppliers.
          </li>
          <li>
            Each supplier is solely responsible for delivering its services to
            you and is bound by its own terms and conditions.
          </li>
        </ul>
      </div>

      <div className="legal-toc">
        <strong>Table of contents</strong>
        <ul>
          <li><a href="#role">Our role</a></li>
          <li><a href="#suppliers">Third-party suppliers</a></li>
          <li><a href="#no-agency">Independent contractor relationship</a></li>
          <li><a href="#information">Information accuracy</a></li>
          <li><a href="#ai">AI-generated content</a></li>
          <li><a href="#payments">Payments and pass-through funds</a></li>
          <li><a href="#liability">Limitation of liability</a></li>
          <li><a href="#regulatory">Regulatory status</a></li>
          <li><a href="#changes">Changes to this disclaimer</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </div>

      <section id="role" className="legal-section">
        <h2>Our role</h2>
        <p>
          <strong>Zeniva Travel acts solely as a technology intermediary.</strong>{" "}
          The Zeniva platform — including the Lina AI concierge, search, proposal,
          checkout and document workflows — provides software tools that help
          travelers discover, compare, and request travel arrangements offered by
          independent third-party suppliers. The platform is operated by{" "}
          {LEGAL_OPERATOR}, a company incorporated in Delaware, USA.
        </p>
        <p>
          Zeniva does not operate aircraft, hotels, vessels, villas, ground
          transportation, tours, cruises or any other underlying travel service.
          Zeniva does not employ pilots, captains, drivers, hoteliers, tour
          guides or other travel-service personnel.
        </p>
      </section>

      <section id="suppliers" className="legal-section">
        <h2>Third-party suppliers</h2>
        <p>
          Every booking facilitated through the Zeniva platform is provided by
          an independent supplier — for example, an airline, hotel, hotel-bedbank
          aggregator, yacht charter operator, villa or short-term-rental operator,
          cruise line, ground-transport operator, activity provider or travel
          insurer. The supplier is identified in your proposal, checkout and
          confirmation documents.
        </p>
        <p>
          Each supplier is solely responsible for the operation, quality, safety,
          legality and delivery of its services. Each supplier is bound by its
          own terms and conditions, cancellation and refund policies, fare rules,
          baggage rules, age and identification requirements, insurance
          requirements, safety procedures and applicable consumer-protection
          regimes. By accepting a booking through the Zeniva platform, you also
          agree to be bound by the relevant supplier's terms.
        </p>
      </section>

      <section id="no-agency" className="legal-section">
        <h2>Independent contractor relationship</h2>
        <p>
          Suppliers listed or accessible through the Zeniva platform are
          independent contractors. They are not agents, employees, partners,
          joint venturers or franchisees of {LEGAL_OPERATOR}.
          Nothing on the platform should be interpreted as Zeniva providing,
          operating, managing, marketing-as-its-own, sponsoring or endorsing any
          underlying travel service, except where Zeniva expressly states a
          first-party offering in writing.
        </p>
      </section>

      <section id="information" className="legal-section">
        <h2>Information accuracy</h2>
        <p>
          Pricing, inventory, availability, schedules, photos, descriptions,
          ratings, amenities and policy summaries are provided by suppliers or
          their distributors and may change at any time. Zeniva uses commercially
          reasonable efforts to surface accurate information but does not warrant
          that supplier-provided content is current, complete or error-free. You
          should always confirm booking-critical details directly in the
          supplier's own confirmation document before traveling.
        </p>
      </section>

      <section id="ai" className="legal-section">
        <h2>AI-generated content</h2>
        <p>
          The Zeniva platform uses AI assistants — including Lina — to help you
          research and structure trips. AI-generated recommendations, itineraries,
          summaries and chat responses are informational and may be incomplete,
          outdated or incorrect. They do not constitute binding offers. See our{" "}
          <Link href="/ai-terms">AI Terms of Use</Link> for details.
        </p>
      </section>

      <section id="payments" className="legal-section">
        <h2>Payments and pass-through funds</h2>
        <p>
          Payments collected at checkout are processed through third-party payment
          processors. Funds collected on behalf of suppliers are held and remitted
          as pass-through amounts and are governed by the supplier's terms. Any
          platform-level fee charged by Zeniva is identified separately on your
          invoice. Refund eligibility is determined by the supplier's policy.
        </p>
      </section>

      <section id="liability" className="legal-section">
        <h2>Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, {LEGAL_OPERATOR}{" "}
          is not liable for the acts, omissions, defaults, breaches, injuries,
          losses, delays, cancellations or damages caused by any third-party
          supplier or by force-majeure events beyond reasonable control. Any
          aggregate liability of Zeniva is limited to the platform fees paid
          directly to Zeniva for the services at issue, excluding pass-through
          amounts paid to suppliers. See our{" "}
          <Link href="/terms">Terms of Service</Link> for the full liability
          framework.
        </p>
      </section>

      <section id="regulatory" className="legal-section">
        <h2>Regulatory status</h2>
        <p>
          Zeniva operates as a technology platform. Where local regulations
          require seller-of-travel registration, OPC accreditation, IATA
          accreditation or similar credentials, the underlying booking is
          fulfilled through suppliers or partners that hold the relevant
          credentials in their own jurisdiction. Specific registrations are
          disclosed in the applicable supplier confirmation.
        </p>
      </section>

      <section id="changes" className="legal-section">
        <h2>Changes to this disclaimer</h2>
        <p>
          We may update this disclaimer to reflect changes in our platform,
          partnerships or applicable law. Material changes will be flagged on
          this page; the &ldquo;Last updated&rdquo; date will indicate when the
          most recent revision became effective.
        </p>
      </section>

      <section id="contact" className="legal-section">
        <h2>Contact</h2>
        <LegalContactBlock />
      </section>
    </div>
  );
}
