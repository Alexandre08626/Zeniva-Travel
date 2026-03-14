import React from "react";
import fs from "fs";
import path from "path";
import { marked } from "marked";
import OrganizationSchema from "../../../src/components/legal/OrganizationSchema";
import LegalContactBlock from "../../../src/components/legal/LegalContactBlock";
import { createLegalMetadata } from "../../../src/components/legal/legal-metadata";
import {
  LEGAL_EFFECTIVE_DATE,
  LEGAL_LAST_UPDATED,
  LEGAL_POLICY_VERSION,
} from "../../../src/components/legal/legal-constants";

export const metadata = createLegalMetadata({
  title: "Privacy Policy | Zeniva Travel",
  description:
    "How Zeniva Travel collects, uses and protects personal information across our website, Lina AI concierge, WhatsApp, Instagram and Messenger.",
  path: "/privacy-policy",
});

const markdownPath = path.join(process.cwd(), "docs", "zeniva-privacy-policy.md");

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const markdown = fs.readFileSync(markdownPath, "utf8");
const tokens = marked.lexer(markdown);
const tocItems = tokens
  .filter((token) => token.type === "heading" && token.depth === 2)
  .map((token: any) => ({
    text: token.text,
    id: slugify(token.text),
  }));

const renderer = new marked.Renderer();
renderer.heading = (text, level) => {
  const id = slugify(text);
  return `<h${level} id="${id}">${text}</h${level}>`;
};

const html = marked.parse(markdown, { renderer });

export default function PrivacyPolicyPage() {
  const toc = [...tocItems, { text: "Contact", id: "contact" }];

  return (
    <div className="legal-container">
      <OrganizationSchema />
      <div>
        <span className="legal-badge">Policy</span>
        <h1 className="legal-title">Privacy Policy</h1>
        <p className="legal-subtitle">
          This Privacy Policy explains how Zeniva Travel collects, uses, and protects
          personal information across our website, Lina AI concierge, and messaging
          platforms.
        </p>
        <div className="legal-meta">
          <span>Effective date: {LEGAL_EFFECTIVE_DATE}</span>
          <span>Last updated: {LEGAL_LAST_UPDATED}</span>
          <span>Policy version: {LEGAL_POLICY_VERSION}</span>
        </div>
      </div>

      <div className="legal-toc">
        <strong>Table of contents</strong>
        <ul>
          {toc.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`}>{item.text}</a>
            </li>
          ))}
        </ul>
      </div>

      <div className="legal-markdown" dangerouslySetInnerHTML={{ __html: html }} />

      <section id="contact" className="legal-section">
        <h2>Contact</h2>
        <LegalContactBlock />
      </section>
    </div>
  );
}
