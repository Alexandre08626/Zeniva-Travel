import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || "";
const PLACES_URL = "https://places.googleapis.com/v1/places:searchText";

interface GooglePlace {
  displayName?: { text: string };
  formattedAddress?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
}

async function searchPlaces(query: string, pageToken?: string): Promise<{ places: GooglePlace[]; nextPageToken?: string }> {
  const body: any = { textQuery: query, maxResultCount: 20 };
  if (pageToken) body.pageToken = pageToken;

  const res = await fetch(PLACES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_API_KEY,
      "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.internationalPhoneNumber,places.websiteUri,places.googleMapsUri,nextPageToken",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) return { places: [] };
  const data = await res.json();
  return { places: data.places || [], nextPageToken: data.nextPageToken };
}

function parseAddress(address: string): { city: string; province: string; country: string } {
  const parts = address.split(",").map((p) => p.trim());
  if (parts.length >= 3) {
    const city = parts[parts.length - 3] || "";
    const provRaw = parts[parts.length - 2] || "";
    const country = parts[parts.length - 1] || "";
    // Remove postal code from province
    const province = provRaw.replace(/\b[A-Z0-9]{2,}\s*[A-Z0-9]*\b/g, "").trim();
    return { city, province, country };
  }
  return { city: parts[0] || "", province: parts[1] || "", country: parts[2] || "" };
}

function extractEmail(website: string): string {
  // We can't extract email from Google Places — leave empty for now
  return "";
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const n8nSecret = process.env.N8N_WEBHOOK_SECRET || "zeniva-n8n-2026";
  const cronSecret = process.env.CRON_SECRET;
  const cookies = req.headers.get("cookie") || "";
  const isAuth = authHeader === `Bearer ${n8nSecret}` ||
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    cookies.includes("zeniva_session=");

  if (!isAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!GOOGLE_API_KEY) return NextResponse.json({ error: "GOOGLE_PLACES_API_KEY not set" }, { status: 500 });

  const body = await req.json().catch(() => ({}));
  const queries: string[] = body.queries || [];
  if (!queries.length) return NextResponse.json({ error: "queries[] required" }, { status: 400 });

  const { client } = getSupabaseAdminClient();
  const now = new Date().toISOString();
  let totalFound = 0;
  let totalSaved = 0;
  let totalSkipped = 0;
  const results: Record<string, { found: number; saved: number }> = {};

  for (const query of queries) {
    const { places } = await searchPlaces(query);
    let saved = 0;

    for (const place of places) {
      const name = place.displayName?.text || "";
      if (!name) continue;

      const { city, province, country } = parseAddress(place.formattedAddress || "");

      // Dedupe by company name
      const { data: existing } = await client
        .from("leads_business")
        .select("id")
        .ilike("company_name", name)
        .limit(1);
      if (existing?.length) { totalSkipped++; continue; }

      // Dedupe by phone
      const phone = place.internationalPhoneNumber || "";
      if (phone) {
        const { data: phoneMatch } = await client
          .from("leads_business")
          .select("id")
          .eq("contact_phone", phone)
          .limit(1);
        if (phoneMatch?.length) { totalSkipped++; continue; }
      }

      const { error } = await client.from("leads_business").insert({
        type: "travel_agency",
        contact_name: "",
        contact_email: "",
        contact_phone: phone,
        company_name: name,
        website: place.websiteUri || place.googleMapsUri || "",
        city,
        province,
        status: "new",
        source: "google",
        priority: "medium",
        estimated_setup_value: 1999,
        estimated_monthly_value: 399,
        notes: `Address: ${place.formattedAddress || ""}`,
        created_at: now,
      });

      if (!error) saved++;
    }

    totalFound += places.length;
    totalSaved += saved;
    results[query] = { found: places.length, saved };
  }

  return NextResponse.json({ ok: true, totalFound, totalSaved, totalSkipped, results });
}
