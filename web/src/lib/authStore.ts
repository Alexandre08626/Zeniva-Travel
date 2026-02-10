"use client";
import { useEffect, useSyncExternalStore } from "react";
import { RBAC_ROLES, type RbacRole, normalizeRbacRole, hasRbacPermission } from "./rbac";

const STORAGE_KEY = "zeniva_auth_store_v1";
const DEFAULT_OWNER_EMAIL = "info@zenivatravel.com";
const IS_PROD = process.env.NODE_ENV === "production";

export type Division = "TRAVEL" | "YACHT" | "VILLAS" | "GROUPS" | "RESORTS";
export type Role = RbacRole | "traveler" | "partner_owner" | "partner_staff";
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
    referralCode?: string;
    influencerId?: string;
  } | null;
};

type AuditEntry = {
  id: string;
  actor: string;
  agentEnabled?: boolean;
  agentDivisions?: Division[];
  action: string;
  targetType: string;
  targetId?: string;
  timestamp: string;
  meta?: Record<string, unknown>;
};

export type PublicUser = Omit<Account, "password"> & {
  activeSpace?: "traveler" | "partner" | "agent";
  roles?: Role[];
  agentEnabled?: boolean;
  agentDivisions?: Division[];
  effectiveRole?: RbacRole | null;
};
type AuthState = { user: PublicUser | null; accounts: Account[]; auditLog: AuditEntry[] };

const defaultState: AuthState = { user: null, accounts: [], auditLog: [] };

export const DIVISIONS: Division[] = ["TRAVEL", "YACHT", "VILLAS", "GROUPS", "RESORTS"];

function normalizeAccountRoles(input: Array<string | null | undefined>): Role[] {
  const normalized: Role[] = [];
  input.forEach((role) => {
    if (!role) return;
    const rbacRole = normalizeRbacRole(role);
    if (rbacRole) {
      normalized.push(rbacRole);
      return;
    }
    if (role === "traveler" || role === "partner_owner" || role === "partner_staff") {
      normalized.push(role as Role);
    }
  });
  const unique = Array.from(new Set(normalized));
  const hasHQ = unique.includes("hq") || unique.includes("admin");
  const hasYachtBroker = unique.includes("yacht_broker");
  if (hasYachtBroker && !hasHQ) {
    return unique.filter((role) => role !== "travel_agent");
  }
  return unique;
}

function withDefaultsAccount(a: Account): Account {
  const roles = normalizeAccountRoles(a.roles && a.roles.length ? a.roles : [a.role || "traveler"]);
  const isAgentRole = roles.some((r) => RBAC_ROLES.includes(r as RbacRole));
  const effectiveRole = normalizeRbacRole(roles[0]) || null;
  const divisions: Division[] = (() => {
    if (!isAgentRole) return [];
    if (effectiveRole === "hq" || effectiveRole === "admin") return [...DIVISIONS];
    if (effectiveRole === "yacht_broker") return ["YACHT"];
    if (effectiveRole === "travel_agent") return ["TRAVEL"];
    return a.divisions && a.divisions.length > 0 ? a.divisions : [];
  })();
  return {
    ...a,
    roles,
    role: roles[0], // keep legacy field for compatibility
    agentLevel: isAgentRole ? a.agentLevel || "Agent" : null,
    divisions,
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
  if (IS_PROD || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore persistence errors
  }
}

function hydrate() {
  if (IS_PROD || typeof window === "undefined" || hasHydrated) return;
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
  ensureSeedDefaultAgents();
}

async function hydrateFromServer() {
  if (typeof window === "undefined") return;
  try {
    const res = await fetch("/api/auth/me", { method: "GET" });
    const payload = await res.json();
    if (payload?.user) {
      const user = payload.user as PublicUser;
      const roles = normalizeAccountRoles(user.roles || (user.role ? [user.role] : []));
      const normalizedUser = { ...user, roles, role: roles[0] };
      setState((s) => ({ ...s, user: normalizedUser }));
      const hasPartnerRole = roles.some((r) => r === "partner_owner" || r === "partner_staff");
      const defaultActiveSpace = hasPartnerRole ? "partner" : roles.some((r) => RBAC_ROLES.includes(r as RbacRole)) ? "agent" : "traveler";
      if (typeof window !== "undefined") {
        setCookie("zeniva_active_space", defaultActiveSpace, 7);
        setCookie("zeniva_roles", JSON.stringify(roles), 7);
        setCookie("zeniva_email", user.email, 7);
      }
    }
  } catch {
    // ignore
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
        return { ...(rest as PublicUser), effectiveRole: (next.user as PublicUser).effectiveRole || null };
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
    if (IS_PROD) {
      void hydrateFromServer();
    }
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

function ensureSeedDefaultAgents() {
  const blocked = new Set(["agent@zenivatravel.com", "yacht@zenivatravel.com"]);
  if (state.accounts.some((a) => blocked.has(normalizeEmail(a.email)))) {
    setState((s) => ({
      ...s,
      accounts: s.accounts.filter((a) => !blocked.has(normalizeEmail(a.email))),
    }));
  }
  const seeds: Account[] = [];

  seeds.forEach((seed) => {
    const exists = state.accounts.find((a) => normalizeEmail(a.email) === normalizeEmail(seed.email));
    if (exists) {
      const mergedRoles = Array.from(new Set([...(exists.roles || (exists.role ? [exists.role] : [])), ...(seed.roles || [])])) as Role[];
      const updated = withDefaultsAccount({
        ...exists,
        name: seed.name || exists.name,
        password: exists.password || seed.password,
        roles: mergedRoles,
        role: mergedRoles[0],
        agentLevel: exists.agentLevel || seed.agentLevel,
        inviteCode: exists.inviteCode || seed.inviteCode,
        divisions: (exists.divisions && exists.divisions.length ? exists.divisions : seed.divisions) || [],
        status: exists.status || seed.status,
      });
      setState((s) => {
        const nextAccounts = s.accounts.map((a) => (normalizeEmail(a.email) === normalizeEmail(seed.email) ? updated : a));
        return { ...s, accounts: nextAccounts };
      });
      return;
    }
    const normalized = withDefaultsAccount(seed);
    setState((s) => ({ ...s, accounts: [normalized, ...s.accounts] }));
  });
}

export async function signup(params: {
  name: string;
  email: string;
  password: string;
  role?: Role;
  roles?: Role[];
  agentLevel?: AgentLevel;
  inviteCode?: string;
  divisions?: Division[];
  referralCode?: string;
  influencerId?: string;
}) {
  const {
    name,
    email,
    password,
    role = "traveler",
    roles = undefined,
    agentLevel = null,
    inviteCode,
    divisions,
    referralCode,
    influencerId,
  } = params;
  if (!email || !password) throw new Error("Email and password are required");

  const normalizedEmail = email.trim();
  const requestedRole = role;
  const requestedRoles = roles;
  const requestedAgentLevel = agentLevel;
  const requestedDivisions = divisions;
  const baseRoles = requestedRoles && requestedRoles.length ? requestedRoles : [requestedRole];
  const finalRoles = normalizeAccountRoles(baseRoles as string[]);
  const isAgentRole = finalRoles.some((r) => RBAC_ROLES.includes(r as RbacRole));
  if (isAgentRole && !IS_PROD) {
    requireInviteCode(inviteCode);
  }

  const baseAccount: Account = withDefaultsAccount({
    name: name || (isAgentRole ? "Agent" : "Traveler"),
    email: normalizedEmail,
    password,
    roles: finalRoles,
    role: finalRoles[0],
    agentLevel: isAgentRole ? requestedAgentLevel || "Agent" : null,
    inviteCode: isAgentRole ? inviteCode?.trim() : undefined,
    divisions: isAgentRole ? (requestedDivisions && requestedDivisions.length ? requestedDivisions : [...DIVISIONS]) : [],
    status: "active",
    travelerProfile: !isAgentRole ? {
      referralCode: referralCode || undefined,
      influencerId: influencerId || undefined,
    } : undefined,
  });

  const syncAccountToServer = () => {
    if (typeof window === "undefined") return;
    const rolesToSync = baseAccount.roles || (baseAccount.role ? [baseAccount.role] : []);
    const isAgentAccount = rolesToSync.some((r) => RBAC_ROLES.includes(r as RbacRole));
    const isPartnerAccount = rolesToSync.includes("partner_owner") || rolesToSync.includes("partner_staff");
    const isTravelerAccount = rolesToSync.includes("traveler") || !rolesToSync.length;

    try {
      fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: baseAccount.name || "Account",
          email: baseAccount.email,
          role: baseAccount.role || rolesToSync[0] || "traveler",
          roles: rolesToSync,
          divisions: baseAccount.divisions || [],
          status: baseAccount.status || "active",
        }),
      });
    } catch (_) {
      // ignore sync errors
    }

    if (isTravelerAccount) {
      try {
        fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: baseAccount.name || "Traveler",
            email: baseAccount.email,
            ownerEmail: DEFAULT_OWNER_EMAIL.toLowerCase(),
            phone: "",
            origin: "web_signup",
            assignedAgents: [],
            primaryDivision: "TRAVEL",
          }),
        });
      } catch (_) {
        // ignore sync errors
      }
    }
  };

  if (IS_PROD) {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        name: baseAccount.name,
        email: baseAccount.email,
        password: baseAccount.password,
        role: baseAccount.role,
        roles: finalRoles,
        divisions: baseAccount.divisions || [],
        inviteCode: baseAccount.inviteCode,
        agentLevel: baseAccount.agentLevel,
          travelerProfile: baseAccount.travelerProfile || undefined,
      }),
    });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload?.error || "Signup failed");
    const account = payload.user as PublicUser;
    const roles = account.roles || (account.role ? [account.role] : []);
    const hasPartnerRole = roles.some((r) => r === "partner_owner" || r === "partner_staff");
    const defaultActiveSpace = hasPartnerRole ? "partner" : roles.some((r) => RBAC_ROLES.includes(r as RbacRole)) ? "agent" : "traveler";
    if (typeof window !== "undefined") {
      setCookie("zeniva_active_space", defaultActiveSpace, 7);
      setCookie("zeniva_roles", JSON.stringify(roles), 7);
      setCookie("zeniva_email", account.email, 7);
    }
    setState((s) => ({
      ...s,
      user: { ...account, activeSpace: defaultActiveSpace },
      auditLog: [...s.auditLog, makeAudit("signup", account.email, "account", account.email, { role: account.role })],
    }));
    return { name: account.name, email: account.email, role: account.role as Role, agentLevel: account.agentLevel };
  }

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
    if (typeof window !== "undefined") {
      const hasPartnerRole = finalRoles.some((r) => r === "partner_owner" || r === "partner_staff");
      const defaultActiveSpace = hasPartnerRole ? "partner" : finalRoles.some((r) => RBAC_ROLES.includes(r as RbacRole)) ? "agent" : "traveler";
      setCookie("zeniva_active_space", defaultActiveSpace, 7);
      setCookie("zeniva_roles", JSON.stringify(finalRoles), 7);
      setCookie("zeniva_email", baseAccount.email, 7);
      deleteCookie("zeniva_agent_enabled");
      deleteCookie("zeniva_agent_divisions");
      if (baseAccount.travelerProfile) setCookie("zeniva_has_traveler_profile", "1", 7);
    }
    setTimeout(syncAccountToServer, 0);
    return { name: baseAccount.name, email: baseAccount.email, role: baseAccount.role, agentLevel: baseAccount.agentLevel };
  }

  setState((s) => ({
    ...s,
    accounts: [...s.accounts, baseAccount],
    user: {
      name: baseAccount.name,
      email: baseAccount.email,
      role: baseAccount.role,
      roles: finalRoles,
      agentLevel: baseAccount.agentLevel,
      inviteCode: baseAccount.inviteCode,
      divisions: baseAccount.divisions,
      status: baseAccount.status,
      agentEnabled: finalRoles.some((r) => RBAC_ROLES.includes(r as RbacRole)),
      agentDivisions: baseAccount.divisions || [],
    },
    auditLog: [...s.auditLog, makeAudit("signup", baseAccount.email, "account", baseAccount.email, { role: baseAccount.role })],
  }));
  if (typeof window !== "undefined") {
    const hasPartnerRole = finalRoles.some((r) => r === "partner_owner" || r === "partner_staff");
    const defaultActiveSpace = hasPartnerRole ? "partner" : finalRoles.some((r) => RBAC_ROLES.includes(r as RbacRole)) ? "agent" : "traveler";
    setCookie("zeniva_active_space", defaultActiveSpace, 7);
    setCookie("zeniva_roles", JSON.stringify(finalRoles), 7);
    setCookie("zeniva_email", baseAccount.email, 7);
    deleteCookie("zeniva_agent_enabled");
    deleteCookie("zeniva_agent_divisions");
    if (baseAccount.travelerProfile) setCookie("zeniva_has_traveler_profile", "1", 7);
  }
  setTimeout(syncAccountToServer, 0);
  return { name: baseAccount.name, email: baseAccount.email, role: baseAccount.role, agentLevel: baseAccount.agentLevel };
}

// Cookie helpers (simple, dev-friendly)
function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
  const secureFlag = isSecure ? "; secure" : "";
  const domain = getCookieDomainFromPublicUrl();
  const domainFlag = domain ? `; domain=${domain}` : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}; samesite=lax${secureFlag}${domainFlag}`;
}
function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
  const secureFlag = isSecure ? "; secure" : "";
  const domain = getCookieDomainFromPublicUrl();
  const domainFlag = domain ? `; domain=${domain}` : "";
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax${secureFlag}${domainFlag}`;
}

function getCookieDomainFromPublicUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "";
  if (!raw) return undefined;
  try {
    const normalized = raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`;
    const url = new URL(normalized);
    const host = url.hostname;
    if (!host || host.includes("localhost") || host.includes("127.0.0.1")) return undefined;
    return host;
  } catch {
    return undefined;
  }
}

export async function login(email: string, password: string, opts?: { role?: Role | "agent"; allowedRoles?: Role[] }) {
  if (!email || !password) throw new Error("Credentials are required");

  if (IS_PROD) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload?.error || "Invalid credentials");
    const account = payload.user as PublicUser;
    const accountRoles = normalizeAccountRoles(account.roles || (account.role ? [account.role] : ["traveler"]));
    const allowedRoles = opts?.allowedRoles || (opts?.role === "agent" ? (RBAC_ROLES as Role[]) : undefined);
    if (allowedRoles && !accountRoles.some((r) => allowedRoles.includes(r))) {
      throw new Error(opts?.role === "agent" ? "This account is not an agent account" : "This account is not allowed here");
    }
    const hasPartnerRole = accountRoles.some((r) => r === "partner_owner" || r === "partner_staff");
    const defaultActiveSpace = hasPartnerRole ? "partner" : accountRoles.some((r) => RBAC_ROLES.includes(r as RbacRole)) ? "agent" : "traveler";
    if (typeof window !== "undefined") {
      setCookie("zeniva_active_space", defaultActiveSpace, 7);
      setCookie("zeniva_roles", JSON.stringify(accountRoles), 7);
      setCookie("zeniva_email", account.email, 7);
    }
    setState((s) => ({ ...s, user: { ...account, activeSpace: defaultActiveSpace } }));
    return { name: account.name, email: account.email, roles: accountRoles, agentLevel: account.agentLevel, activeSpace: defaultActiveSpace };
  }

  const account = findAccount(email, password);
  if (!account) throw new Error("Invalid credentials");
  const allowedRoles = opts?.allowedRoles || (opts?.role === "agent" ? (RBAC_ROLES as Role[]) : undefined);
  const accountRoles = normalizeAccountRoles(account.roles && account.roles.length ? account.roles : (account.role ? [account.role] : ["traveler"]));
  if (allowedRoles && !accountRoles.some((r) => allowedRoles.includes(r))) {
    throw new Error(opts?.role === "agent" ? "This account is not an agent account" : "This account is not allowed here");
  }

  // determine default activeSpace
  const hasPartnerRole = accountRoles.some((r) => r === "partner_owner" || r === "partner_staff");
  const defaultActiveSpace = hasPartnerRole ? "partner" : accountRoles.some((r) => RBAC_ROLES.includes(r as RbacRole)) ? "agent" : "traveler";

  // set cookies for middleware and server-aware routing
  if (typeof window !== "undefined") {
    setCookie("zeniva_active_space", defaultActiveSpace, 7);
    setCookie("zeniva_roles", JSON.stringify(accountRoles), 7);
    setCookie("zeniva_email", account.email, 7);
    deleteCookie("zeniva_agent_enabled");
    deleteCookie("zeniva_agent_divisions");
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
      agentEnabled: accountRoles.some((r) => RBAC_ROLES.includes(r as RbacRole)),
      agentDivisions: account.divisions || [],
      travelerProfile: account.travelerProfile,
      partnerCompany: account.partnerCompany,
      partnerId: account.partnerId,
    },
    auditLog: [...s.auditLog, makeAudit("login", account.email, "account", account.email)],
  }));

  if (typeof window !== "undefined") {
    setTimeout(() => {
      import("../../lib/store/tripsStore")
        .then((mod) => {
          if (mod.setTripUserScope) mod.setTripUserScope(account.email);
          if (mod.syncTripsFromServer) mod.syncTripsFromServer(account.email);
        })
        .catch(() => undefined);
    }, 0);
  }
  return { name: account.name, email: account.email, roles: accountRoles, agentLevel: account.agentLevel, activeSpace: defaultActiveSpace };
}

export async function logout(redirectTo = "/") {
  setState((s) => ({ ...s, user: null }));
  if (typeof window !== "undefined") {
    if (IS_PROD) {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {
        // ignore
      }
    }
    setTimeout(() => {
      import("../../lib/store/tripsStore")
        .then((mod) => {
          if (mod.setTripUserScope) mod.setTripUserScope("guest");
        })
        .catch(() => undefined);
    }, 0);
    deleteCookie("zeniva_active_space");
    deleteCookie("zeniva_roles");
    deleteCookie("zeniva_email");
    deleteCookie("zeniva_agent_enabled");
    deleteCookie("zeniva_agent_divisions");
    deleteCookie("zeniva_has_traveler_profile");
    window.location.href = redirectTo;
  }
}

export async function setPreviewRole(role: RbacRole | null) {
  if (typeof window === "undefined") return;
  const method = role ? "POST" : "DELETE";
  const payload = role ? { role } : undefined;
  const res = await fetch("/api/auth/preview-role", {
    method,
    headers: { "Content-Type": "application/json" },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  if (!res.ok) return;
  setState((s) => ({
    ...s,
    user: s.user ? { ...s.user, effectiveRole: role } : s.user,
  }));
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
  const effective = user?.effectiveRole ? normalizeRbacRole(user.effectiveRole) : null;
  if (effective) return true;
  return roles.some((r) => RBAC_ROLES.includes(r as RbacRole));
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
  const effective = user.effectiveRole ? normalizeRbacRole(user.effectiveRole) : null;
  if (effective === "hq") return true;
  if (roles.includes("hq")) return true;
  return (user.divisions || []).includes(division);
}

export function isHQ(user = state.user) {
  const roles = user ? (user.roles || (user.role ? [user.role] : [])) : [];
  const effective = user?.effectiveRole ? normalizeRbacRole(user.effectiveRole) : null;
  if (effective === "hq") return true;
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

export function deleteAccountByEmail(email: string) {
  const target = normalizeEmail(email || "");
  if (!target) return;
  setState((s) => {
    const nextAccounts = s.accounts.filter((a) => normalizeEmail(a.email) !== target);
    const nextUser = s.user && normalizeEmail(s.user.email) === target ? null : s.user;
    return {
      ...s,
      accounts: nextAccounts,
      user: nextUser,
      auditLog: [...s.auditLog, makeAudit("account:delete", target, "account", target)],
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

// DEV: reset password by email (client-side). Replace with secure server flow in production.
export function resetPasswordByEmail(email: string, newPassword: string) {
  if (!email || !newPassword) throw new Error("Email and new password are required");
  const normalized = normalizeEmail(email);
  setState((s) => {
    const idx = s.accounts.findIndex((a) => normalizeEmail(a.email) === normalized);
    if (idx < 0) throw new Error("Account not found");
    const existing = s.accounts[idx];
    const updated = withDefaultsAccount({ ...existing, password: newPassword });
    const nextAccounts = [...s.accounts];
    nextAccounts[idx] = updated;
    const updatedUser = s.user && normalizeEmail(s.user.email) === normalized
      ? (() => {
          const { password: _pw, ...publicUser } = updated;
          void _pw;
          return publicUser as PublicUser;
        })()
      : s.user;
    return {
      ...s,
      accounts: nextAccounts,
      user: updatedUser,
      auditLog: [...s.auditLog, makeAudit("password:reset", normalized, "account", normalized)],
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
  return hasRbacPermission(permission, {
    roles,
    role: user.role || null,
    override: user.effectiveRole || null,
  });
}
