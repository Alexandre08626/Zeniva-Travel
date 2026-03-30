import { getSupabaseAdminClient } from "@/src/lib/supabase/server";
import { verifySession, getSessionCookieName } from "@/src/lib/server/auth";

export interface AgencyContext {
  agencyId: string | null;
  agentId: string | null;
  agencyConfig: Record<string, unknown> | null;
}

export async function getAgencyContext(
  request: Request
): Promise<AgencyContext> {
  const { client } = getSupabaseAdminClient();
  const url = new URL(request.url);

  const headerAgencyId = request.headers.get("x-agency-id");
  if (headerAgencyId) {
    const { data: agency } = await client
      .from("agencies")
      .select("id, config")
      .eq("id", headerAgencyId)
      .eq("is_active", true)
      .single();

    if (agency) {
      return { agencyId: agency.id, agentId: null, agencyConfig: agency.config };
    }
  }

  const partnerSlug = url.searchParams.get("partner");
  if (partnerSlug) {
    const { data: agency } = await client
      .from("agencies")
      .select("id, config")
      .eq("slug", partnerSlug)
      .eq("is_active", true)
      .single();

    if (agency) {
      return { agencyId: agency.id, agentId: null, agencyConfig: agency.config };
    }
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const cookieName = getSessionCookieName();
  const match = cookieHeader.match(new RegExp(`${cookieName}=([^;]+)`));
  const token = match?.[1];

  if (token) {
    const session = verifySession(token);
    if (session?.email) {
      const { data: profile } = await client
        .from("profiles")
        .select("id, agency_id")
        .eq("account_email", session.email)
        .single();

      if (profile?.agency_id) {
        const { data: agency } = await client
          .from("agencies")
          .select("id, config")
          .eq("id", profile.agency_id)
          .eq("is_active", true)
          .single();

        return {
          agencyId: agency?.id || profile.agency_id,
          agentId: profile.id,
          agencyConfig: agency?.config || null,
        };
      }

      return { agencyId: null, agentId: profile?.id || null, agencyConfig: null };
    }
  }

  return { agencyId: null, agentId: null, agencyConfig: null };
}
