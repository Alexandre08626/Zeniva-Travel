import { getSupabaseAdminClient } from "@/src/lib/supabase/server";

export interface PricingInfo {
  service: string;
  pricePerUnit: number;
  costPerUnit: number;
  unitLabel: string;
}

export async function getPricing(
  agencyId: string | null,
  service: string
): Promise<PricingInfo | null> {
  const { client } = getSupabaseAdminClient();

  if (agencyId) {
    const { data } = await client
      .from("agency_pricing")
      .select("service, price_per_unit, cost_per_unit, unit_label")
      .eq("agency_id", agencyId)
      .eq("service", service)
      .eq("is_active", true)
      .single();

    if (data) {
      return {
        service: data.service,
        pricePerUnit: parseFloat(data.price_per_unit),
        costPerUnit: parseFloat(data.cost_per_unit),
        unitLabel: data.unit_label,
      };
    }
  }

  const { data } = await client
    .from("agency_pricing")
    .select("service, price_per_unit, cost_per_unit, unit_label")
    .is("agency_id", null)
    .eq("service", service)
    .eq("is_active", true)
    .single();

  if (!data) return null;

  return {
    service: data.service,
    pricePerUnit: parseFloat(data.price_per_unit),
    costPerUnit: parseFloat(data.cost_per_unit),
    unitLabel: data.unit_label,
  };
}

export async function getAllPricing(agencyId: string | null): Promise<PricingInfo[]> {
  const { client } = getSupabaseAdminClient();
  const result: PricingInfo[] = [];

  if (agencyId) {
    const { data } = await client
      .from("agency_pricing")
      .select("service, price_per_unit, cost_per_unit, unit_label")
      .eq("agency_id", agencyId)
      .eq("is_active", true);

    if (data) {
      result.push(...data.map((d) => ({
        service: d.service,
        pricePerUnit: parseFloat(d.price_per_unit),
        costPerUnit: parseFloat(d.cost_per_unit),
        unitLabel: d.unit_label,
      })));
    }
  }

  const coveredServices = result.map((p) => p.service);
  const { data: defaults } = await client
    .from("agency_pricing")
    .select("service, price_per_unit, cost_per_unit, unit_label")
    .is("agency_id", null)
    .eq("is_active", true);

  if (defaults) {
    for (const d of defaults) {
      if (!coveredServices.includes(d.service)) {
        result.push({
          service: d.service,
          pricePerUnit: parseFloat(d.price_per_unit),
          costPerUnit: parseFloat(d.cost_per_unit),
          unitLabel: d.unit_label,
        });
      }
    }
  }

  return result;
}
