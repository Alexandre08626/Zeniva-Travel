import { getSupabaseAdminClient } from "@/src/lib/supabase/server";
import { sendPushToHQ } from "@/src/lib/server/pushNotify";

/**
 * Saves a traveler lead in Supabase `leads` + push alert to HQ (same columns as /api/lina-lead).
 * Replaces the old contabo VPS, which no longer answers — leads sent there were lost.
 */
export async function saveTravelLead(input: {
  name?: string;
  email: string;
  phone?: string;
  destination?: string;
  source: string;
  details?: string;
  url?: string;
}): Promise<{ saved: boolean; existing: boolean }> {
  const email = String(input.email || "").trim().toLowerCase();
  const fullName = String(input.name || "").trim();
  let saved = false;
  let existing = false;
  try {
    const { client } = getSupabaseAdminClient();
    const { data: found } = await client.from("leads").select("id").eq("email", email).limit(1);
    if (found && found.length) {
      existing = true;
    } else {
      const { error } = await client.from("leads").insert({
        first_name: fullName.split(" ")[0] || "",
        last_name: fullName.split(" ").slice(1).join(" ") || "",
        email,
        phone: String(input.phone || "").trim(),
        destination: String(input.destination || ""),
        source: input.source,
        status: "new",
        language: "en",
      });
      if (error) console.error(`[travel-lead:${input.source}] insert error:`, error.message);
      else saved = true;
    }
  } catch (err: any) {
    console.error(`[travel-lead:${input.source}] supabase error:`, err?.message || err);
  }

  await sendPushToHQ({
    title: existing ? "Voyageur de retour" : "Nouveau lead voyage",
    body: [fullName || email, input.destination ? `→ ${input.destination}` : "", input.details || "", `(${input.source})`]
      .filter(Boolean)
      .join(" ")
      .slice(0, 240),
    url: input.url || "/agent/leads",
    tag: "travel-lead",
  });
  return { saved, existing };
}
