import type { PublicUser } from "../authStore";
import { listAgents } from "./agents";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function normalizeAgentId(input: string) {
  const value = (input || "").trim();
  const normalized = value.toLowerCase().startsWith("agent-") ? value.slice(6) : value;
  const clean = slugify(normalized);
  return clean ? `agent-${clean}` : "";
}

function emailPrefix(email?: string) {
  if (!email) return "";
  return (email.split("@")[0] || "").trim();
}

export function resolveAgentIdFromSlug(slug: string) {
  const normalized = slugify(slug || "");
  if (!normalized) return "";
  const candidates = listAgents();
  const direct = candidates.find((agent) => {
    const agentId = agent.id.toLowerCase();
    const stripped = agentId.startsWith("agent-") ? agentId.slice(6) : agentId;
    return agentId === normalized || stripped === normalized;
  });
  if (direct) return direct.id;
  const byName = candidates.find((agent) => slugify(agent.name) === normalized);
  if (byName) return byName.id;
  const byEmail = candidates.find((agent) => slugify(emailPrefix(agent.email)) === normalized);
  if (byEmail) return byEmail.id;
  return normalizeAgentId(normalized);
}

export function toAgentWorkspaceId(user?: PublicUser | null) {
  const email = user?.email || "";
  if (!email) return "";
  const agents = listAgents();
  const match = agents.find((agent) => agent.email.toLowerCase() === email.toLowerCase());
  if (match) return match.id;
  return normalizeAgentId(emailPrefix(email));
}
