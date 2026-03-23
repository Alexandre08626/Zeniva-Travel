"use client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zeniva Agents",
  description: "Explore our AI agents—Lina and friends—on a clean white background.",
  alternates: {
    canonical: "https://zenivatravel.com/ai-agents",
    languages: {
      "en-CA": "https://zenivatravel.com/ai-agents",
      "fr-CA": "https://zenivatravel.com/fr/ai-agents",
    },
  },
};

// blank page per request
export default function AIAgentsPage() {
  return null;
}
