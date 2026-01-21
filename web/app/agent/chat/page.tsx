import dynamic from "next/dynamic";

export const dynamic = "force-dynamic";

const AgentChatClient = dynamic(() => import("./AgentChat.client"), { ssr: false });

export default function AgentChatPage() {
  return <AgentChatClient />;
}
