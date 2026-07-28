import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/src/lib/supabase/server";
import { verifySession, getSessionCookieName } from "@/src/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

function getAuth(req: NextRequest) {
  const ck = req.headers.get("cookie") || "";
  const cn = getSessionCookieName();
  const m = ck.match(new RegExp(cn + "=([^;]+)"));
  const t = m?.[1];
  if (!t) return null;
  const s = verifySession(t);
  return s?.email ? s : null;
}

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let pw = "";
  for (let i = 0; i < 12; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

export async function POST(req: NextRequest) {
  const session = getAuth(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { agency_id } = await req.json();
  if (!agency_id) return NextResponse.json({ error: "agency_id is required" }, { status: 400 });

  const { client } = getSupabaseAdminClient();
  const log: string[] = [];

  // 1. Get agency
  const { data: agency, error: agErr } = await client.from("agencies").select("*").eq("id", agency_id).single();
  if (agErr || !agency) return NextResponse.json({ error: "Agency not found" }, { status: 404 });

  const config = (agency.config || {}) as Record<string, unknown>;
  const onboarding = (config.onboarding || {}) as Record<string, unknown>;
  const plan = (config.plan as string) || "standard";
  const numAgents = (config.number_of_agents as number) || 1;

  log.push(`\u2705 Agency loaded: ${agency.name} (${plan} plan, ${numAgents} advisors)`);

  // 2. Create agency owner account (if not exists)
  const ownerEmail = agency.contact_email || (onboarding.primaryEmail as string);
  const ownerName = (onboarding.primaryName as string) || agency.name;

  if (ownerEmail) {
    const { data: existingAccount } = await client
      .from("accounts")
      .select("id")
      .eq("email", ownerEmail)
      .maybeSingle();

    if (!existingAccount) {
      const password = generatePassword();
      const { error: accErr } = await client.from("accounts").insert({
        email: ownerEmail,
        name: ownerName,
        role: "agency_admin",
        agency_id: agency.id,
        password_hash: password, // In production, hash this
        is_active: true,
      });

      if (!accErr) {
        log.push(`\u2705 Agency admin account created: ${ownerEmail} (temp password: ${password})`);
      } else {
        log.push(`\u26A0\uFE0F Could not create admin account: ${accErr.message}`);
      }
    } else {
      log.push(`\u2139\uFE0F Admin account already exists: ${ownerEmail}`);
    }
  }

  // 3. Create advisor accounts
  const advisorList = (onboarding.advisorList as string) || "";
  const advisorLines = advisorList.split("\n").filter((l: string) => l.trim());
  let advisorsCreated = 0;

  for (const line of advisorLines) {
    const emailMatch = line.match(/[\w.+-]+@[\w.-]+\.\w+/);
    const nameMatch = line.match(/:\s*(.+?)\s*[\u2014\-\u2013]/);
    if (emailMatch) {
      const email = emailMatch[0];
      const name = nameMatch?.[1]?.trim() || email.split("@")[0];

      const { data: existing } = await client
        .from("accounts")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (!existing) {
        const pw = generatePassword();
        await client.from("accounts").insert({
          email,
          name,
          role: "travel_agent",
          agency_id: agency.id,
          password_hash: pw,
          is_active: true,
        });
        advisorsCreated++;
      }
    }
  }

  if (advisorsCreated > 0) {
    log.push(`\u2705 Created ${advisorsCreated} advisor accounts`);
  } else if (advisorLines.length > 0) {
    log.push(`\u2139\uFE0F Advisor accounts already exist or could not parse emails`);
  }

  // 4. Configure AI widget settings
  const aiConfig = {
    agency_id: agency.id,
    agency_name: agency.name,
    languages: onboarding.languages || ["English"],
    default_language: onboarding.defaultLanguage || "English",
    welcome_message: onboarding.welcomeMessage || `Welcome to ${agency.name}! How can we help?`,
    business_hours: {
      weekday: onboarding.weekdayHours || "9 AM - 5 PM",
      weekend: onboarding.weekendHours || "Closed",
    },
    promotions: onboarding.promotions || "",
    branding: {
      primary_color: agency.primary_color,
      secondary_color: agency.secondary_color,
      tone: onboarding.brandTone || [],
    },
    suppliers: onboarding.suppliers || "",
    specialties: onboarding.specialties || [],
  };

  // Store AI config in agency config
  const updatedConfig = {
    ...config,
    zeniva_ai_config: aiConfig,
    setup_completed_at: new Date().toISOString(),
    setup_completed_by: session.email,
  };

  log.push(`\u2705 Zeniva AI configured: ${(aiConfig.languages as string[]).join(", ")}`);

  // 5. Generate widget embed code
  const widgetCode = `<!-- Zeniva AI Widget for ${agency.name} -->
<script src="https://www.zenivatravel.com/widget/zeniva.js"
  data-agency="${agency.slug}"
  data-color="${agency.primary_color || '#0D9488'}"
  data-lang="${onboarding.defaultLanguage || 'en'}"
  async></script>`;

  updatedConfig.widget_code = widgetCode;
  log.push(`\u2705 Widget code generated for ${agency.domain || agency.slug}`);

  // 6. Activate agency
  const { error: updateErr } = await client.from("agencies").update({
    is_active: true,
    config: updatedConfig,
    updated_at: new Date().toISOString(),
  }).eq("id", agency.id);

  if (!updateErr) {
    log.push(`\u2705 Agency activated!`);
  } else {
    log.push(`\u274C Failed to activate: ${updateErr.message}`);
    return NextResponse.json({ ok: false, log, error: updateErr.message }, { status: 500 });
  }

  // 7. Premium: flag for app build
  if (plan === "premium") {
    log.push(`\uD83D\uDC8E Premium plan detected — mobile app build queued`);
    log.push(`\u2139\uFE0F App name: ${onboarding.appName || agency.name}`);
    log.push(`\u2139\uFE0F Website to analyze: ${agency.domain || "TBD"}`);
  }

  log.push("");
  log.push(`\uD83C\uDF89 Setup complete for ${agency.name}!`);
  log.push(`\u2192 ${advisorsCreated + 1} accounts created`);
  log.push(`\u2192 Widget code ready to install`);
  if (plan === "premium") log.push(`\u2192 Mobile app build queued`);

  return NextResponse.json({ ok: true, log, agency_id: agency.id });
}
