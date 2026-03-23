export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import AIAgentsPageClient from "./page.client";

export const metadata: Metadata = {
  title: "Zeniva AI Agents",
  description: "Explore our AI agents—Lina and friends—on a clean white background.",
  alternates: {
    canonical: "https://zenivatravel.com/ai-agents",
    languages: {
      "en-CA": "https://zenivatravel.com/ai-agents",
      "fr-CA": "https://zenivatravel.com/fr/ai-agents",
    },
  },
};

export default function AIAgentsPage() {
  return <AIAgentsPageClient />;
}
