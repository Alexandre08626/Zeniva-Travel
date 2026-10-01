import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/src/lib/supabase/server";
import { sendPushToHQ } from "@/src/lib/server/pushNotify";

// Courriel laissé par un voyageur dans le clavardage (avant la proposition).
// Avant : envoyé seulement à l'ancien VPS (mort) → le lead était perdu.
// Maintenant : enregistré dans la table Supabase `leads` + alerte push à HQ.
// Aucun courriel n'est envoyé au voyageur ici.
export async function POST(req: NextRequest) {
  try {
    const { email, destination, tripId, name, phone } = await req.json();
    const cleanEmail = String(email || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }

    const fullName = String(name || "").trim();
    let saved = false;
    let existing = false;
    try {
      const { client } = getSupabaseAdminClient();
      const { data: found } = await client.from("leads").select("id").eq("email", cleanEmail).limit(1);
      if (found && found.length) {
        existing = true;
      } else {
        const { error } = await client.from("leads").insert({
          first_name: fullName.split(" ")[0] || "",
          last_name: fullName.split(" ").slice(1).join(" ") || "",
          email: cleanEmail,
          phone: String(phone || "").trim(),
          destination: String(destination || ""),
          source: "chat-generate-proposal",
          status: "new",
          language: "en",
        });
        if (error) console.error("[lina-lead] insert error:", error.message);
        else saved = true;
      }
    } catch (err: any) {
      console.error("[lina-lead] supabase error:", err?.message || err);
    }

    await sendPushToHQ({
      title: existing ? "Voyageur de retour (clavardage)" : "Nouveau lead voyage (clavardage)",
      body: `${fullName || cleanEmail}${destination ? ` → ${destination}` : ""}`,
      url: tripId ? `/agent/chat/${encodeURIComponent(String(tripId))}` : "/agent/leads",
      tag: "lina-lead",
    });

    return NextResponse.json({ ok: true, saved, existing });
  } catch (err) {
    console.error("lina-lead error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
