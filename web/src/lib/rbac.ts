export type RbacRole = "travel_agent" | "yacht_broker" | "influencer" | "hq" | "admin";

export const RBAC_ROLES: RbacRole[] = ["travel_agent", "yacht_broker", "influencer", "hq", "admin"];

export const RBAC_PERMISSIONS: Record<RbacRole, string[]> = {
  travel_agent: [
    "inventory:all",
    "sales:all",
    "clients:all",
    "clients:own",
    "bookings:all",
    "payments:all",
    "documents:all",
    "changes:all",
    "read_yachts_inventory",
    "create_yacht_proposal",
    "send_proposal_to_client",
    "invoicing:own",
    "marketing:own",
    "commissions:read",
    "proposals:all",
    "leads:own",
    "referrals:read",
  ],
  yacht_broker: [
    "yacht_listings:manage",
    "read_yachts_inventory",
    "create_yacht_proposal",
    "send_proposal_to_client",
    "clients:own",
    "clients:all",
    "sales:yacht",
    "bookings:all",
    "payments:all",
    "documents:all",
    "invoicing:own",
    "marketing:own",
    "commissions:read",
    "proposals:all",
    "referrals:read",
  ],
  influencer: [
    "referrals:read",
    "referrals:manage",
    "marketing:own",
    "clients:own",
    "commissions:read",
    "leads:own",
    "sales:all",
  ],
  hq: ["*", "accounts:manage"],
  admin: ["*", "accounts:manage"],
};

const LEGACY_ROLE_MAP: Record<string, RbacRole> = {
  "travel-agent": "travel_agent",
  "yacht-broker": "yacht_broker",
};

const PREVIEW_ALLOWLIST_EMAILS = ["info@zeniva.ca"];

export function normalizeRbacRole(role?: string | null): RbacRole | null {
  if (!role) return null;
  if (RBAC_ROLES.includes(role as RbacRole)) return role as RbacRole;
  return LEGACY_ROLE_MAP[role] || null;
}

export function normalizeRbacRoles(roles: Array<string | null | undefined> = []): RbacRole[] {
  const normalized = roles
    .map((role) => normalizeRbacRole(role))
    .filter((role): role is RbacRole => Boolean(role));
  return Array.from(new Set(normalized));
}

export function getEffectiveRole(options: {
  roles?: string[] | null;
  role?: string | null;
  override?: string | null;
}): RbacRole | null {
  if (options.override) {
    const override = normalizeRbacRole(options.override);
    if (override) return override;
  }
  const normalized = normalizeRbacRoles([...(options.roles || []), options.role]);
  return normalized[0] || null;
}

export function hasRbacPermission(
  permission: string,
  options: { roles?: string[] | null; role?: string | null; override?: string | null }
) {
  const effective = getEffectiveRole(options);
  if (!effective) return false;
  const perms = RBAC_PERMISSIONS[effective] || [];
  return perms.includes("*") || perms.includes(permission);
}

export function canPreviewRole(user: { email?: string | null; id?: string | null }) {
  if (!user?.email && !user?.id) return false;
  if (user.email && PREVIEW_ALLOWLIST_EMAILS.includes(user.email.trim().toLowerCase())) return true;
  const allowlist = (process.env.NEXT_PUBLIC_RBAC_PREVIEW_IDS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (!allowlist.length) return false;
  return user.id ? allowlist.includes(user.id) : false;
}
