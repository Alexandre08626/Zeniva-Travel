import type { Metadata } from "next";
import AgentRoleSection from "../../components/careers/AgentRoleSection";
import { AGENT_ROLE_DICT_EN } from "../../components/careers/agentRoleDict";

export const metadata: Metadata = {
  title: "Become a Zeniva Agent — Join the Future of Travel",
  description:
    "Join Zeniva as a travel agent. Earn 70% commission, get full tech setup, AI assistant Lina, and access to 200+ destinations worldwide. No experience required.",
  keywords: ["travel agent", "work from home", "commission", "AI assistant", "travel business", "Zeniva agent"],
};

export default function AgentsPage() {
  return (
    <main className="min-h-screen bg-white">
      <AgentRoleSection dict={AGENT_ROLE_DICT_EN} />
    </main>
  );
}
