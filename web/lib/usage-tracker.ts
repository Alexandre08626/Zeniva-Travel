import { getSupabaseAdminClient } from "@/src/lib/supabase/server";

export interface UsageLogParams {
  agencyId?: string | null;
  agentId?: string | null;
  service: "sms_twilio" | "whatsapp" | "email" | "api_search";
  action: string;
  quantity?: number;
  metadata?: Record<string, unknown>;
}

interface PricingRow {
  price_per_unit: string;
  cost_per_unit: string;
}

export async function logUsage({
  agencyId,
  agentId,
  service,
  action,
  quantity = 1,
  metadata = {},
}: UsageLogParams) {
  try {
    const { client } = getSupabaseAdminClient();

    let pricing: PricingRow | null = null;

    if (agencyId) {
      const { data } = await client
        .from("agency_pricing")
        .select("price_per_unit, cost_per_unit")
        .eq("agency_id", agencyId)
        .eq("service", service)
        .eq("is_active", true)
        .single();
      pricing = data;
    }

    if (!pricing) {
      const { data } = await client
        .from("agency_pricing")
        .select("price_per_unit, cost_per_unit")
        .is("agency_id", null)
        .eq("service", service)
        .eq("is_active", true)
        .single();
      pricing = data;
    }

    if (!pricing) {
      console.warn(`[usage-tracker] No pricing found for service: ${service}`);
      return null;
    }

    const unitPrice = parseFloat(pricing.price_per_unit);
    const unitCost = parseFloat(pricing.cost_per_unit);

    const { data: log, error } = await client
      .from("api_usage_logs")
      .insert({
        agency_id: agencyId || null,
        agent_id: agentId || null,
        service,
        action,
        unit_cost: unitCost,
        unit_price: unitPrice,
        quantity,
        metadata,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[usage-tracker] Insert error:", error.message);
      return null;
    }

    return log;
  } catch (err) {
    console.error("[usage-tracker] Unexpected error:", err);
    return null;
  }
}
