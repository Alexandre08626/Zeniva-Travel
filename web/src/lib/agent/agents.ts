import { Division, type Role } from "../authStore";
import { normalizeRbacRole } from "../rbac";

export type AgentStatus = "active" | "inactive" | "suspended";
export type AgentRoleLabel = "Travel Agent" | "Yacht Broker" | "HQ" | "Admin" | "Partner" | "Traveler" | "Influencer";

export type AgentDirectoryEntry = {
  id: string;
  name: string;
  email: string;
  roleLabel: AgentRoleLabel;
  roleKey: "hq" | "admin" | "travel_agent" | "yacht_broker" | "influencer" | "partner" | "traveler";
  status: AgentStatus;
  code: string;
  avatar: string;
  divisions: Division[];
  createdAt: string;
  linkedToYacht?: boolean;
  linkedToTravel?: boolean;
  metrics: {
    activeClients: number;
    openFiles: number;
    inProgressSales: number;
    revenue: number;
    commission: number;
    lastActivity: string;
  };
};

const STORAGE_KEY = "zeniva_agents_dir_v1";
const IS_PROD = process.env.NODE_ENV === "production";

let agents: AgentDirectoryEntry[] = IS_PROD ? [] : [
  {
    id: "agent-hq",
    name: "Zeniva HQ",
    email: "info@zenivatravel.com",
    roleLabel: "HQ",
    roleKey: "hq",
    status: "active",
    code: "Z-HQ-001",
    avatar: "/branding/lina-avatar.png",
    divisions: ["TRAVEL", "YACHT", "VILLAS", "GROUPS", "RESORTS"],
    createdAt: "2023-01-10T00:00:00Z",
    linkedToTravel: true,
    linkedToYacht: true,
    metrics: {
      activeClients: 42,
      openFiles: 18,
      inProgressSales: 9,
      revenue: 620000,
      commission: 0,
      lastActivity: "2024-12-20T14:00:00Z",
    },
  },
  {
    id: "agent-jason-j6",
    name: "Jason J",
    email: "jasonj6@gmail.com",
    roleLabel: "Yacht Broker",
    roleKey: "yacht_broker",
    status: "active",
    code: "ZY-106",
    avatar: "/branding/lina-avatar.png",
    divisions: ["YACHT"],
    createdAt: "2024-12-01T00:00:00Z",
    linkedToTravel: false,
    linkedToYacht: true,
    metrics: {
      activeClients: 0,
      openFiles: 0,
      inProgressSales: 0,
      revenue: 0,
      commission: 0,
      lastActivity: "2024-12-20T14:00:00Z",
    },
  },
  {
    id: "agent-justine",
    name: "Justine Caron",
    email: "agent@zenivatravel.com",
    roleLabel: "Travel Agent",
    roleKey: "travel_agent",
    status: "active",
    code: "ZT-104",
    avatar: "/branding/lina-avatar.png",
    divisions: ["TRAVEL"],
    createdAt: "2024-03-01T00:00:00Z",
    linkedToTravel: true,
    linkedToYacht: false,
    metrics: {
      activeClients: 18,
      openFiles: 7,
      inProgressSales: 5,
      revenue: 126000,
      commission: 9800,
      lastActivity: "2024-12-18T10:30:00Z",
    },
  },
];

function persistAgents() {
  if (IS_PROD || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
  } catch {
    // ignore persistence errors
  }
}

function hydrateAgents() {
  if (IS_PROD || typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        agents = parsed;
      }
    }
  } catch {
    // ignore hydration errors
  }
}

hydrateAgents();

export function listAgents(): AgentDirectoryEntry[] {
  return agents;
}

export function getAgentById(id: string) {
  return agents.find((a) => a.id === id);
}

function makeAgentCode(roleKey: AgentDirectoryEntry["roleKey"]) {
  const prefix = roleKey === "hq" ? "Z-HQ" : roleKey === "admin" ? "ZA" : roleKey === "yacht_broker" ? "ZY" : roleKey === "influencer" ? "ZI" : roleKey === "partner" ? "ZP" : "ZT";
  const rand = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${rand}`;
}

function roleToLabel(role: Role): AgentDirectoryEntry["roleLabel"] {
  const normalized = normalizeRbacRole(role) || role;
  if (normalized === "hq") return "HQ";
  if (normalized === "admin") return "Admin";
  if (normalized === "yacht_broker") return "Yacht Broker";
  if (normalized === "influencer") return "Influencer";
  if (role === "partner_owner" || role === "partner_staff") return "Partner";
  if (role === "traveler") return "Traveler";
  return "Travel Agent";
}

function roleToKey(role: Role): AgentDirectoryEntry["roleKey"] {
  const normalized = normalizeRbacRole(role) || role;
  if (normalized === "hq") return "hq";
  if (normalized === "admin") return "admin";
  if (normalized === "yacht_broker") return "yacht_broker";
  if (normalized === "influencer") return "influencer";
  if (role === "partner_owner" || role === "partner_staff") return "partner";
  if (role === "traveler") return "traveler";
  return "travel_agent";
}

export function addAgentFromAccount(account: { name: string; email: string; role: Role; divisions?: Division[]; status?: AgentStatus }) {
  const normalizedEmail = account.email.trim().toLowerCase();
  const existing = agents.find((a) => a.email.toLowerCase() === normalizedEmail);
  if (existing) return existing;

  const roleKey = roleToKey(account.role);
  const roleLabel = roleToLabel(account.role);
  const entry: AgentDirectoryEntry = {
    id: `agent-${normalizedEmail.replace(/[^a-z0-9]/gi, "-")}`,
    name: account.name || "Agent",
    email: normalizedEmail,
    roleLabel,
    roleKey,
    status: account.status || "active",
    code: makeAgentCode(roleKey),
    avatar: "/branding/lina-avatar.png",
    divisions: account.divisions && account.divisions.length ? account.divisions : roleKey === "partner" ? [] : ["TRAVEL"],
    createdAt: new Date().toISOString(),
    linkedToTravel: (account.divisions || ["TRAVEL"]).includes("TRAVEL"),
    linkedToYacht: (account.divisions || []).includes("YACHT"),
    metrics: {
      activeClients: 0,
      openFiles: 0,
      inProgressSales: 0,
      revenue: 0,
      commission: 0,
      lastActivity: new Date().toISOString(),
    },
  };

  agents = [entry, ...agents];
  persistAgents();
  return entry;
}

export function removeAgentByEmail(email: string) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return;
  agents = agents.filter((a) => a.email.toLowerCase() !== normalized);
  persistAgents();
}

export function setAgentStatus(id: string, status: AgentStatus) {
  const idx = agents.findIndex((a) => a.id === id);
  if (idx === -1) return;
  agents[idx] = { ...agents[idx], status };
}

export function setAgentRole(id: string, roleKey: AgentDirectoryEntry["roleKey"], roleLabel: AgentRoleLabel) {
  const idx = agents.findIndex((a) => a.id === id);
  if (idx === -1) return;
  agents[idx] = { ...agents[idx], roleKey, roleLabel };
}
