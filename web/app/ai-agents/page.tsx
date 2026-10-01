export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import AIAgentsPageClient from "./page.client";

export const metadata: Metadata = {
  title: "Zeniva Agents",
  description: "Explore our AI agents on a clean white background.",
  alternates: {
    canonical: "https://www.zenivatravel.com/ai-agents",
    languages: {
      "en-CA": "https://www.zenivatravel.com/ai-agents",
      "fr-CA": "https://www.zenivatravel.com/fr/ai-agents",
    },
  },
};

export default function AIAgentsPage() {
  return <AIAgentsPageClient />;
}
