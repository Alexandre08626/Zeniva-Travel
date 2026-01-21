import dynamicImport from "next/dynamic";

export const dynamic = "force-dynamic";

const AgentChatClient = dynamicImport(() => import("./AgentChat.client"), { ssr: false });

export default function AgentChatPage() {
  return <AgentChatClient />;
}
