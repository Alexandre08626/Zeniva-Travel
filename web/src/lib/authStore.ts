"use client";
import { useEffect, useSyncExternalStore } from "react";

const STORAGE_KEY = "zeniva_auth_store_v1";
const HQ_EMAIL = "info@zeniva.ca";
const HQ_PASSWORD = "Baton08!!";

export type Division = "TRAVEL" | "YACHT" | "VILLAS" | "GROUPS" | "RESORTS";
export type Role = "traveler" | "hq" | "admin" | "travel-agent" | "yacht-partner" | "finance" | "support" | "partner_owner" | "partner_staff";
export type AgentLevel = "Agent" | "Senior Agent" | "Manager" | null;
export type Account = {
  email: string;
  name: string;
  password: string;
  // Multiple roles per user (single identity supporting traveler + partner + agent)
  roles?: Role[];
  role?: Role; // legacy single-role field (kept for backward compatibility)
  agentLevel?: AgentLevel;
  inviteCode?: string;
  divisions?: Division[];
  status?: "active" | "disabled" | "suspended";
  createdAt?: string;
  // Partner profile fields (optional)
  partnerId?: string; // if the account is tied to a partner
  partnerCompany?: {
    legalName?: string;
    displayName?: string;
    country?: string;
    currency?: string;
    language?: string;
    phone?: string;
    kycStatus?: "pending" | "verified" | "rejected";
  } | null;
  // Traveler profile
  travelerProfile?: {
    displayName?: string;
    phone?: string;
  } | null;
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

export type PublicUser = Omit<Account, "password"> & { activeSpace?: "traveler" | "partner" | "agent"; roles?: Role[] };
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
  // Partner roles and permissions
  partner_owner: [
    "partner:dashboard",
    "partner:listings:write",
    "partner:listings:read",
    "partner:bookings:manage",
    "partner:media:write",
    "partner:payouts:read",
    "partner:team:manage",
  ],
  partner_staff: ["partner:listings:read", "partner:bookings:manage", "partner:media:write"],
};

function withDefaultsAccount(a: Account): Account {
  const roles = a.roles && a.roles.length ? a.roles : [(a.role || "traveler") as Role];
  const isAgentRole = roles.some((r) => AGENT_ROLES.includes(r));
  return {
    ...a,
    roles,
    role: roles[0], // keep legacy field for compatibility
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
  
  // Force update current user's name if they are HQ
  if (state.user && normalizeEmail(state.user.email) === normalizeEmail(HQ_EMAIL)) {
    const hqAccount = state.accounts.find(a => normalizeEmail(a.email) === normalizeEmail(HQ_EMAIL));
    if (hqAccount && state.user.name !== hqAccount.name) {
      setState((s) => ({
        ...s,
        user: s.user ? { ...s.user, name: hqAccount.name } : s.user
      }));
    }
  }
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
      existing.password !== HQ_PASSWORD || 
      existing.name !== "Alexandre Blais" ||
      !(existing.roles && existing.roles.includes("hq") && existing.roles.includes("partner_owner")) || 
      existing.inviteCode !== "ZENIVA-HQ";
    if (!needsUpdate) return;

    const updated: Account = withDefaultsAccount({
      ...existing,
      name: "Alexandre Blais",
      password: HQ_PASSWORD,
      roles: ["hq", "partner_owner"],
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
    name: "Alexandre Blais",
    password: HQ_PASSWORD,
    // Seed HQ also as a partner in dev so the dev user can test partner flows
    roles: ["hq", "partner_owner"],
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
      roles: ["travel-agent"],
      agentLevel: "Agent",
      inviteCode: "ZENIVA-AGENT",
      divisions: ["TRAVEL"],
      status: "active",
    },
    {
      email: "yacht@zeniva.ca",
      name: "Jason Yacht",
      password: HQ_PASSWORD,
      roles: ["yacht-partner"],
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
  roles?: Role[];
  agentLevel?: AgentLevel;
  inviteCode?: string;
  divisions?: Division[];
}) {
  const { name, email, password, role = "traveler", roles = undefined, agentLevel = null, inviteCode, divisions } = params;
  if (!email || !password) throw new Error("Email and password are required");

  const normalizedEmail = email.trim();
  const finalRoles = roles && roles.length ? roles : [role];
  const isAgentRole = finalRoles.some((r) => AGENT_ROLES.includes(r));
  if (isAgentRole) {
    requireInviteCode(inviteCode);
  }

  const baseAccount: Account = withDefaultsAccount({
    name: name || (isAgentRole ? "Agent" : "Traveler"),
    email: normalizedEmail,
    password,
    roles: finalRoles,
    role: finalRoles[0],
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

// Cookie helpers (simple, dev-friendly)
function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}; samesite=lax`;
}
function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`;
}

export function login(email: string, password: string, opts?: { role?: Role | "agent"; allowedRoles?: Role[] }) {
  if (!email || !password) throw new Error("Credentials are required");

  if (normalizeEmail(email) === normalizeEmail(HQ_EMAIL) && password === HQ_PASSWORD) {
    ensureSeedHQ();
  }

  const account = findAccount(email, password);
  if (!account) throw new Error("Invalid credentials");
  const allowedRoles = opts?.allowedRoles || (opts?.role === "agent" ? AGENT_ROLES : undefined);
  const accountRoles = (account.roles && account.roles.length ? account.roles : (account.role ? [account.role] : ["traveler"])) as Role[];
  if (allowedRoles && !accountRoles.some((r) => allowedRoles.includes(r))) {
    throw new Error(opts?.role === "agent" ? "This account is not an agent account" : "This account is not allowed here");
  }

  // determine default activeSpace
  const hasPartnerRole = accountRoles.some((r) => r === "partner_owner" || r === "partner_staff");
  const defaultActiveSpace = hasPartnerRole ? "partner" : accountRoles.includes("hq") || accountRoles.some((r) => AGENT_ROLES.includes(r)) ? "agent" : "traveler";

  // set cookies for middleware and server-aware routing
  if (typeof window !== "undefined") {
    setCookie("zeniva_active_space", defaultActiveSpace, 7);
    setCookie("zeniva_roles", JSON.stringify(accountRoles), 7);
    setCookie("zeniva_email", account.email, 7);
    if (account.travelerProfile) setCookie("zeniva_has_traveler_profile", "1", 7);
  }

  setState((s) => ({
    ...s,
    user: {
      name: account.name,
      email: account.email,
      roles: accountRoles,
      role: accountRoles[0] as Role,
      agentLevel: account.agentLevel,
      inviteCode: account.inviteCode,
      divisions: account.divisions,
      status: account.status,
      activeSpace: defaultActiveSpace,
      travelerProfile: account.travelerProfile,
      partnerCompany: account.partnerCompany,
      partnerId: account.partnerId,
    },
    auditLog: [...s.auditLog, makeAudit("login", account.email, "account", account.email)],
  }));
  return { name: account.name, email: account.email, roles: accountRoles, agentLevel: account.agentLevel, activeSpace: defaultActiveSpace };
}

export function logout(redirectTo = "/") {
  setState((s) => ({ ...s, user: null }));
  if (typeof window !== "undefined") {
    deleteCookie("zeniva_active_space");
    deleteCookie("zeniva_roles");
    deleteCookie("zeniva_email");
    deleteCookie("zeniva_has_traveler_profile");
    window.location.href = redirectTo;
  }
}

// Switch the active UI space without logging out
export function switchActiveSpace(space: "traveler" | "partner" | "agent") {
  if (!state.user) throw new Error("Not authenticated");
  if (typeof document !== "undefined") {
    setCookie("zeniva_active_space", space, 7);
  }
  setState((s) => ({
    ...s,
    user: s.user ? ({ ...s.user, activeSpace: space } as PublicUser) : s.user,
    auditLog: [...s.auditLog, makeAudit("switch:space", s.user?.email || "unknown", "session", undefined, { space })],
  }));
}

// Quick create traveler profile (15-30s flow)
export function createTravelerProfile(update: { displayName?: string; phone?: string }) {
  const current = state.user;
  if (!current) throw new Error("Not authenticated");
  const email = current.email;
  setState((s) => {
    const idx = s.accounts.findIndex((a) => normalizeEmail(a.email) === normalizeEmail(email));
    if (idx < 0) throw new Error("Account not found");
    const existing = s.accounts[idx];
    const nextAccount: Account = withDefaultsAccount({
      ...existing,
      travelerProfile: {
        displayName: update.displayName ?? existing.travelerProfile?.displayName,
        phone: update.phone ?? existing.travelerProfile?.phone,
      },
      // ensure traveler role exists
      roles: (existing.roles && existing.roles.length ? existing.roles : []).concat("traveler"),
    });
    const nextAccounts = [...s.accounts];
    nextAccounts[idx] = nextAccount;
    const { password: _pw, ...publicUser } = nextAccount;
    void _pw;
    // set cookie to inform middleware
    if (typeof document !== "undefined") setCookie("zeniva_has_traveler_profile", "1", 7);
    return {
      ...s,
      accounts: nextAccounts,
      user: publicUser as PublicUser,
      auditLog: [...s.auditLog, makeAudit("traveler:create", email, "account", email, { created: Object.keys(update) })],
    };
  });
}

export function getUser() {
  return state.user;
}

export function isAgent(user = state.user) {
  const roles = user ? (user.roles || (user.role ? [user.role] : [])) : [];
  return roles.some((r) => AGENT_ROLES.includes(r));
}

export function isPartner(user = state.user) {
  const roles = user ? (user.roles || (user.role ? [user.role] : [])) : [];
  return roles.includes("partner_owner") || roles.includes("partner_staff");
}

export function hasPartnerPermission(user: PublicUser | null | undefined, permission: string) {
  return hasPermission(user, permission);
}

export function hasDivision(user: PublicUser | null | undefined, division: Division) {
  if (!user) return false;
  const roles = user.roles || (user.role ? [user.role] : []);
  if (roles.includes("hq")) return true;
  return (user.divisions || []).includes(division);
}

export function isHQ(user = state.user) {
  const roles = user ? (user.roles || (user.role ? [user.role] : [])) : [];
  return roles.includes("hq");
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

// NOTE: client-side helper. In production this must call a secure server-side API to update partner profile and trigger KYC workflows.
export function updatePartnerProfile(update: {
  partnerId?: string;
  legalName?: string;
  displayName?: string;
  country?: string;
  currency?: string;
  language?: string;
  phone?: string;
  kycStatus?: "pending" | "verified" | "rejected";
}) {
  const current = state.user;
  if (!current) throw new Error("Not authenticated");
  const email = current.email;
  setState((s) => {
    const idx = s.accounts.findIndex((a) => normalizeEmail(a.email) === normalizeEmail(email));
    if (idx < 0) throw new Error("Account not found");
    const existing = s.accounts[idx];
    const nextAccount: Account = withDefaultsAccount({
      ...existing,
      partnerId: update.partnerId || existing.partnerId || `partner_${Math.random().toString(36).slice(2,8)}`,
      partnerCompany: {
        legalName: update.legalName ?? existing.partnerCompany?.legalName,
        displayName: update.displayName ?? existing.partnerCompany?.displayName,
        country: update.country ?? existing.partnerCompany?.country,
        currency: update.currency ?? existing.partnerCompany?.currency,
        language: update.language ?? existing.partnerCompany?.language,
        phone: update.phone ?? existing.partnerCompany?.phone,
        kycStatus: update.kycStatus ?? existing.partnerCompany?.kycStatus ?? "pending",
      },
    });
    const nextAccounts = [...s.accounts];
    nextAccounts[idx] = nextAccount;
    const { password: _pw, ...publicUser } = nextAccount;
    void _pw;
    return {
      ...s,
      accounts: nextAccounts,
      user: publicUser as PublicUser,
      auditLog: [...s.auditLog, makeAudit("partner:profile-update", email, "partner", nextAccount.partnerId, { updated: Object.keys(update) })],
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
  const roles = user.roles || (user.role ? [user.role] : []);
  if (roles.includes("hq")) return true;
  for (const r of roles) {
    const perms = PERMISSIONS[r] || [];
    if (perms.includes("*") || perms.includes(permission)) return true;
  }
  return false;
}
