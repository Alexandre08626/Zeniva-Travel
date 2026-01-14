"use client";
import { useEffect, useSyncExternalStore } from "react";

const STORAGE_KEY = "zeniva_auth_store_v1";
const HQ_EMAIL = "info@zeniva.ca";
const HQ_PASSWORD = "Baton08!!";

export type Division = "TRAVEL" | "YACHT" | "VILLAS" | "GROUPS" | "RESORTS";
export type Role = "traveler" | "hq" | "admin" | "travel-agent" | "yacht-partner" | "finance" | "support";
export type AgentLevel = "Agent" | "Senior Agent" | "Manager" | null;
export type Account = {
  email: string;
  name: string;
  password: string;
  role: Role;
  agentLevel?: AgentLevel;
  inviteCode?: string;
  divisions?: Division[];
  status?: "active" | "disabled" | "suspended";
  createdAt?: string;
};

type AuditEntry = {
  id: string;
  actor: string;
  action: string;
  targetType: string;
  targetId?: string;
  timestamp: string;
  meta?: Record<string, unknown>;
};

export type PublicUser = Omit<Account, "password">;
type AuthState = { user: PublicUser | null; accounts: Account[]; auditLog: AuditEntry[] };

const defaultState: AuthState = { user: null, accounts: [], auditLog: [] };

export const DIVISIONS: Division[] = ["TRAVEL", "YACHT", "VILLAS", "GROUPS", "RESORTS"];
const AGENT_ROLES: Role[] = ["hq", "admin", "travel-agent", "yacht-partner", "finance", "support"];
const PERMISSIONS: Record<Role, string[]> = {
  traveler: ["view:own"],
  hq: ["*"],
  admin: ["agents:read", "agents:write", "dossiers:all", "proposals:all", "orders:all", "documents:all", "finance:read"],
  "travel-agent": ["dossiers:own", "proposals:own", "orders:submit", "documents:own"],
  "yacht-partner": ["dossiers:own", "proposals:own", "orders:submit", "documents:own"],
  finance: ["finance:all", "orders:approve", "invoices:all", "refunds:all", "exports:csv"],
  support: ["documents:division", "dossiers:division"],
};

function withDefaultsAccount(a: Account): Account {
  const role: Role = (a.role || "traveler") as Role;
  const isAgentRole = AGENT_ROLES.includes(role);
  return {
    ...a,
    role,
    agentLevel: isAgentRole ? a.agentLevel || "Agent" : null,
    divisions: isAgentRole ? (a.divisions && a.divisions.length > 0 ? a.divisions : [...DIVISIONS]) : [],
    status: a.status || "active",
    createdAt: a.createdAt || new Date().toISOString(),
    email: a.email.trim(),
    name: a.name || (isAgentRole ? "Agent" : "Traveler"),
  };
}

let state: AuthState = { ...defaultState };
let hasHydrated = false;

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function persist(next: AuthState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore persistence errors
  }
}

function hydrate() {
  if (typeof window === "undefined" || hasHydrated) return;
  hasHydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      setState((s) => ({ ...s, ...defaultState, ...parsed }));
    }
  } catch {
    // ignore hydration errors
  }
  ensureSeedHQ();
  ensureSeedDefaultAgents();
}

const listeners = new Set<() => void>();

function setState(updater: AuthState | ((s: AuthState) => AuthState)) {
  const next = typeof updater === "function" ? (updater as (s: AuthState) => AuthState)(state) : updater;
  const normalizedAccounts = next.accounts.map(withDefaultsAccount);
  const normalizedUser = next.user
    ? (() => {
        const { password: _pw, ...rest } = withDefaultsAccount({ ...(next.user as Account), password: "" });
        void _pw;
        return rest as PublicUser;
      })()
    : null;
  state = { ...next, accounts: normalizedAccounts, user: normalizedUser, auditLog: next.auditLog || [] };
  persist(state);
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAuthStore<T = AuthState>(selector: (s: AuthState) => T = (s) => s as unknown as T) {
  useEffect(() => {
    hydrate();
  }, []);

  const snapshot = useSyncExternalStore(subscribe, () => state, () => state);
  return selector(snapshot);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function findAccount(email: string, password?: string) {
  const normalized = normalizeEmail(email);
  return state.accounts.find((a) => a.email.toLowerCase() === normalized && (!password || a.password === password));
}

function requireInviteCode(inviteCode?: string) {
  const allowed = ["ZENIVA-AGENT", "ZENIVA-ADMIN", "ZENIVA-HQ"];
  if (!inviteCode || !allowed.includes(inviteCode.trim())) {
    throw new Error("Invite code required or invalid for agents");
  }
  return inviteCode.trim();
}

function ensureSeedHQ() {
  const email = HQ_EMAIL;
  const idx = state.accounts.findIndex((a) => normalizeEmail(a.email) === normalizeEmail(email));

  if (idx >= 0) {
    const existing = state.accounts[idx];
    const needsUpdate =
      existing.password !== HQ_PASSWORD || existing.role !== "hq" || existing.inviteCode !== "ZENIVA-HQ";
    if (!needsUpdate) return;

    const updated: Account = withDefaultsAccount({
      ...existing,
      password: HQ_PASSWORD,
      role: "hq",
      inviteCode: "ZENIVA-HQ",
      divisions: existing.divisions && existing.divisions.length ? existing.divisions : [...DIVISIONS],
      agentLevel: existing.agentLevel || "Manager",
      status: existing.status || "active",
    });

    setState((s) => {
      const nextAccounts = [...s.accounts];
      nextAccounts[idx] = updated;
      return { ...s, accounts: nextAccounts };
    });
    return;
  }

  const hq: Account = withDefaultsAccount({
    email,
    name: "Zeniva HQ",
    password: HQ_PASSWORD,
    role: "hq",
    divisions: [...DIVISIONS],
    agentLevel: "Manager",
    inviteCode: "ZENIVA-HQ",
    status: "active",
  });
  setState((s) => ({ ...s, accounts: [hq, ...s.accounts] }));
}

function ensureSeedDefaultAgents() {
  const seeds: Account[] = [
    {
      email: "agent@zeniva.ca",
      name: "Justine Caron",
      password: HQ_PASSWORD,
      role: "travel-agent",
      agentLevel: "Agent",
      inviteCode: "ZENIVA-AGENT",
      divisions: ["TRAVEL"],
      status: "active",
    },
    {
      email: "yacht@zeniva.ca",
      name: "Jason Yacht",
      password: HQ_PASSWORD,
      role: "yacht-partner",
      agentLevel: "Agent",
      inviteCode: "ZENIVA-AGENT",
      divisions: ["YACHT"],
      status: "active",
    },
  ];

  seeds.forEach((seed) => {
    const exists = state.accounts.find((a) => normalizeEmail(a.email) === normalizeEmail(seed.email));
    if (exists) return;
    const normalized = withDefaultsAccount(seed);
    setState((s) => ({ ...s, accounts: [normalized, ...s.accounts] }));
  });
}

export function signup(params: {
  name: string;
  email: string;
  password: string;
  role?: Role;
  agentLevel?: AgentLevel;
  inviteCode?: string;
  divisions?: Division[];
}) {
  const { name, email, password, role = "traveler", agentLevel = null, inviteCode, divisions } = params;
  if (!email || !password) throw new Error("Email and password are required");

  const normalizedEmail = email.trim();
  const isAgentRole = AGENT_ROLES.includes(role);
  if (isAgentRole) {
    requireInviteCode(inviteCode);
  }

  const baseAccount: Account = withDefaultsAccount({
    name: name || (isAgentRole ? "Agent" : "Traveler"),
    email: normalizedEmail,
    password,
    role,
    agentLevel: isAgentRole ? agentLevel || "Agent" : null,
    inviteCode: isAgentRole ? inviteCode?.trim() : undefined,
    divisions: isAgentRole ? (divisions && divisions.length ? divisions : [...DIVISIONS]) : [],
    status: "active",
  });

  const existingIdx = state.accounts.findIndex((a) => normalizeEmail(a.email) === normalizeEmail(normalizedEmail));

  if (existingIdx >= 0) {
    setState((s) => {
      const nextAccounts = [...s.accounts];
      nextAccounts[existingIdx] = baseAccount;
      const { password: _pw, ...publicUser } = baseAccount;
      void _pw;
      return {
        ...s,
        accounts: nextAccounts,
        user: publicUser as PublicUser,
        auditLog: [...s.auditLog, makeAudit("signup:update", normalizedEmail, "account", normalizedEmail, { role: baseAccount.role })],
      };
    });
    return { name: baseAccount.name, email: baseAccount.email, role: baseAccount.role, agentLevel: baseAccount.agentLevel };
  }

  setState((s) => ({
    ...s,
    accounts: [...s.accounts, baseAccount],
    user: {
      name: baseAccount.name,
      email: baseAccount.email,
      role: baseAccount.role,
      agentLevel: baseAccount.agentLevel,
      inviteCode: baseAccount.inviteCode,
      divisions: baseAccount.divisions,
      status: baseAccount.status,
    },
    auditLog: [...s.auditLog, makeAudit("signup", baseAccount.email, "account", baseAccount.email, { role: baseAccount.role })],
  }));
  return { name: baseAccount.name, email: baseAccount.email, role: baseAccount.role, agentLevel: baseAccount.agentLevel };
}

export function login(email: string, password: string, opts?: { role?: Role | "agent"; allowedRoles?: Role[] }) {
  if (!email || !password) throw new Error("Credentials are required");

  if (normalizeEmail(email) === normalizeEmail(HQ_EMAIL) && password === HQ_PASSWORD) {
    ensureSeedHQ();
  }

  const account = findAccount(email, password);
  if (!account) throw new Error("Invalid credentials");
  const allowedRoles = opts?.allowedRoles || (opts?.role === "agent" ? AGENT_ROLES : undefined);
  if (allowedRoles && !allowedRoles.includes(account.role)) {
    throw new Error(opts?.role === "agent" ? "This account is not an agent account" : "This account is not allowed here");
  }
  setState((s) => ({
    ...s,
    user: {
      name: account.name,
      email: account.email,
      role: account.role,
      agentLevel: account.agentLevel,
      inviteCode: account.inviteCode,
      divisions: account.divisions,
      status: account.status,
    },
    auditLog: [...s.auditLog, makeAudit("login", account.email, "account", account.email)],
  }));
  return { name: account.name, email: account.email, role: account.role, agentLevel: account.agentLevel };
}

export function logout(redirectTo = "/") {
  setState((s) => ({ ...s, user: null }));
  if (typeof window !== "undefined") {
    window.location.href = redirectTo;
  }
}

export function getUser() {
  return state.user;
}

export function isAgent(user = state.user) {
  return user ? AGENT_ROLES.includes(user.role) : false;
}

export function hasDivision(user: PublicUser | null | undefined, division: Division) {
  if (!user) return false;
  if (user.role === "hq") return true;
  return (user.divisions || []).includes(division);
}

export function isHQ(user = state.user) {
  return user?.role === "hq";
}

export function updateAccountStatus(email: string, status: "active" | "disabled" | "suspended") {
  setState((s) => {
    const nextAccounts = s.accounts.map((a) => (normalizeEmail(a.email) === normalizeEmail(email) ? { ...a, status } : a));
    return {
      ...s,
      accounts: nextAccounts,
      auditLog: [...s.auditLog, makeAudit("agent:status", email, "account", email, { status })],
      user: s.user && normalizeEmail(s.user.email) === normalizeEmail(email) ? { ...s.user, status } : s.user,
    };
  });
}

export function updateAccountRole(email: string, role: Role) {
  setState((s) => {
    const nextAccounts = s.accounts.map((a) => (normalizeEmail(a.email) === normalizeEmail(email) ? withDefaultsAccount({ ...a, role }) : a));
    const updatedUser = s.user && normalizeEmail(s.user.email) === normalizeEmail(email) ? withDefaultsAccount({ ...(s.user as Account), role }) : s.user;
    return {
      ...s,
      accounts: nextAccounts,
      auditLog: [...s.auditLog, makeAudit("agent:role", email, "account", email, { role })],
      user: updatedUser ? ({ ...updatedUser, password: undefined } as unknown as PublicUser) : s.user,
    };
  });
}

export function updateSelfProfile(update: {
  name?: string;
  password?: string;
  agentLevel?: AgentLevel;
  divisions?: Division[];
}) {
  const current = state.user;
  if (!current) throw new Error("Not authenticated");
  const email = current.email;
  setState((s) => {
    const idx = s.accounts.findIndex((a) => normalizeEmail(a.email) === normalizeEmail(email));
    if (idx < 0) throw new Error("Account not found");
    const existing = s.accounts[idx];
    const nextAccount = withDefaultsAccount({
      ...existing,
      name: update.name !== undefined ? update.name : existing.name,
      password: update.password ? update.password : existing.password,
      agentLevel: update.agentLevel !== undefined ? update.agentLevel : existing.agentLevel,
      divisions: update.divisions && update.divisions.length ? update.divisions : existing.divisions,
    });
    const nextAccounts = [...s.accounts];
    nextAccounts[idx] = nextAccount;
    const { password: _pw, ...publicUser } = nextAccount;
    void _pw;
    return {
      ...s,
      accounts: nextAccounts,
      user: publicUser as PublicUser,
      auditLog: [...s.auditLog, makeAudit("agent:self-update", email, "account", email, { updated: Object.keys(update) })],
    };
  });
}

function makeAudit(action: string, actor: string, targetType: string, targetId?: string, meta?: Record<string, unknown>): AuditEntry {
  return { id: uid(), actor, action, targetType, targetId, timestamp: new Date().toISOString(), meta };
}

export function addAudit(action: string, targetType: string, targetId?: string, meta?: Record<string, unknown>) {
  const actor = state.user?.email || "system";
  setState((s) => ({ ...s, auditLog: [...s.auditLog, makeAudit(action, actor, targetType, targetId, meta)] }));
}

export function hasPermission(user: PublicUser | null | undefined, permission: string) {
  if (!user) return false;
  if (user.role === "hq") return true;
  const perms = PERMISSIONS[user.role] || [];
  return perms.includes("*") || perms.includes(permission);
}
