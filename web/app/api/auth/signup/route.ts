import { NextResponse } from "next/server";
import { sendPushToHQ } from "../../../../src/lib/server/pushNotify";
import { sendEmail } from "../../../../src/lib/server/email";

import { assertBackendEnv, normalizeEmail, dbQuery } from "../../../../src/lib/server/db";
import { normalizeRbacRole } from "../../../../src/lib/rbac";
import { getCookieDomain, getSessionCookieName, signSession, hashPassword } from "../../../../src/lib/server/auth";
import { getSupabaseAdminClient, getSupabaseAnonClient } from "../../../../src/lib/supabase/server";

function normalizeStringArray(value: unknown, fallback: string[] = []) {
  if (Array.isArray(value)) return value.filter((item) => typeof item === "string" && item.trim());
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return fallback;
}

function cleanJsonObject(value: Record<string, unknown>) {
  const entries = Object.entries(value).filter(([, v]) => v !== undefined);
  return Object.fromEntries(entries);
}

function normalizeSupabaseUrl(rawUrl: string) {
  if (!rawUrl) return "";
  const trimmed = rawUrl.trim();
  try {
    const normalized = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    return new URL(normalized).toString().replace(/\/$/, "");
  } catch {
    return trimmed;
  }
}

function keyPrefix(value: string) {
  if (!value) return "";
  const idx = value.indexOf("_");
  return idx > 0 ? value.slice(0, idx + 1) : value.slice(0, 12);
}

function errorResponse(stage: string, message: string, status = 500, details?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, stage, message, details }, { status });
}

export async function POST(request: Request) {
  const requestId =
    (globalThis.crypto?.randomUUID?.() ||
      `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`) as string;

  try {
    assertBackendEnv();

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return errorResponse("validate", "Content-Type must be application/json", 415, { requestId });
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch (parseError: any) {
      return errorResponse("parse", "Invalid JSON", 400, {
        requestId,
        message: parseError?.message || "Invalid JSON body",
      });
    }

    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const supabaseUrl = normalizeSupabaseUrl(rawUrl);
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    console.info("supabase_env", {
      requestId,
      supabaseUrl,
      hasAnon: Boolean(anonKey),
      hasService: Boolean(serviceKey),
    });

    // ---- Inputs
    const space = String(body?.space || body?.role || "traveler").toLowerCase();
    const resolvedRole =
      space === "agent" || space === "zeniva agent"
        ? "travel_agent"
        : space === "partner"
          ? "partner_owner"
          : "traveler";

    const name = String(body?.full_name || body?.fullName || body?.name || "").trim();
    const email = normalizeEmail(String(body?.email || ""));
    const password = String(body?.password || "");

    const role = String(body?.role || resolvedRole);
    const roles = normalizeStringArray(body?.roles, [role]);
    const normalizedRole = normalizeRbacRole(role) || role;
    const normalizedRoles = roles.map((entry) => normalizeRbacRole(entry) || entry);
    const divisions = normalizeStringArray(body?.divisions, []);
    const referralCode = body?.referralCode || body?.referral_code;
    const influencerId = body?.influencerId || body?.influencer_id;
    const travelerProfile = body?.travelerProfile && typeof body.travelerProfile === "object"
      ? { ...body.travelerProfile, referralCode: referralCode || body?.travelerProfile?.referralCode, influencerId: influencerId || body?.travelerProfile?.influencerId }
      : referralCode || influencerId
        ? { referralCode: referralCode || undefined, influencerId: influencerId || undefined }
        : undefined;

    const inviteCode = body?.invite_code
      ? String(body.invite_code).trim()
      : body?.inviteCode
        ? String(body.inviteCode).trim()
        : "";

    const agentLevel = body?.agent_role
      ? String(body.agent_role)
      : body?.agentLevel
        ? String(body.agentLevel)
        : null;

    const isAgentRole = normalizedRoles.some((r: string) =>
      ["hq", "admin", "travel_agent", "yacht_broker", "influencer"].includes(r)
    );

    // ---- Validate
    const missing: string[] = [];
    if (!email) missing.push("email");
    if (!password) missing.push("password");
    if (!space) missing.push("space");
    if (!name) missing.push("fullName/name");
    if (isAgentRole && !inviteCode) missing.push("inviteCode");
    if (isAgentRole && !agentLevel) missing.push("agentRole");
    if (missing.length) {
      return errorResponse("validate", "Missing required fields", 400, { missing, requestId });
    }

    if (isAgentRole) {
      const check = await dbQuery(
        "SELECT id, status, role FROM agent_requests WHERE lower(email) = $1 AND code = $2 AND status = 'approved' ORDER BY requested_at DESC LIMIT 1",
        [email, inviteCode]
      );
      if (!check.rows.length) {
        return NextResponse.json({ ok: false, message: "Agent approval required" }, { status: 400 });
      }
      const requestedRole = normalizeRbacRole(check.rows[0].role) || check.rows[0].role;
      if (requestedRole && requestedRole !== normalizedRole) {
        return NextResponse.json({ ok: false, message: "Agent role mismatch" }, { status: 400 });
      }
    }

    // ---- Clients (IMPORTANT)
    // ANON client for auth.signUp
    const { client: supabaseAnonClient } = getSupabaseAnonClient();

    // ADMIN client for user creation + DB insert
    const { client: supabaseAdminClient } = getSupabaseAdminClient();

    // ---- Auth signup
    const metadata = cleanJsonObject({
      name,
      role,
      roles: Array.isArray(normalizedRoles) ? normalizedRoles : [normalizedRole],
      divisions: Array.isArray(divisions) ? divisions : [],
      agentLevel,
      inviteCode: inviteCode || undefined,
      agent_role: agentLevel || undefined,
      invite_code: inviteCode || undefined,
    });

    let authUser = null as { id: string } | null;

    if (isAgentRole) {
      console.info("auth_signup_start", {
        requestId,
        key: "service_role",
        url: supabaseUrl || null,
      });
      const { data, error } = await supabaseAdminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: metadata,
      });

      if (error || !data?.user) {
        const code = (error as any)?.code || null;
        if (code === "email_exists") {
          const retry = await supabaseAdminClient.auth.signInWithPassword({ email, password });
          if (retry.data?.user && !retry.error) {
            authUser = retry.data.user;
          } else {
            // Try to locate user by email and reset password (HQ-approved agent flow)
            try {
              const adminAuth = (supabaseAdminClient.auth as any).admin;
              if (adminAuth?.listUsers) {
                const list = await adminAuth.listUsers({ page: 1, perPage: 1000 });
                const users = list?.data?.users || [];
                const match = users.find((u: any) => String(u?.email || "").toLowerCase() === email);
                if (match && adminAuth?.updateUserById) {
                  const updated = await adminAuth.updateUserById(match.id, {
                    password,
                    user_metadata: { ...(match.user_metadata || {}), ...metadata },
                    email_confirm: true,
                  });
                  if (updated?.data?.user) {
                    authUser = updated.data.user;
                  }
                }
              }
            } catch {
              // ignore and fall through
            }

            if (!authUser) {
              return errorResponse("auth_signup_error", "Account already exists", 400, {
                requestId,
                code,
              });
            }
          }
        } else {
          console.error("auth_signup_error", {
            requestId,
            url: supabaseUrl || null,
            code,
            message: error?.message || null,
          });
          return errorResponse("auth_signup_error", error?.message || "Signup failed", 400, {
            requestId,
            code,
          });
        }
      } else {
        authUser = data.user;
      }
    } else {
      console.info("auth_signup_start", {
        requestId,
        key: "anon",
        url: supabaseUrl || null,
        anonPrefix: keyPrefix(anonKey),
        anonLength: anonKey.length,
      });
      const { data, error } = await supabaseAnonClient.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error || !data?.user) {
        console.error("auth_signup_error", {
          requestId,
          url: supabaseUrl || null,
          code: (error as any)?.code || null,
          message: error?.message || null,
        });
        return errorResponse("auth_signup_error", error?.message || "Signup failed", 400, {
          requestId,
          code: (error as any)?.code || null,
        });
      }
      authUser = data.user;
    }

    // ---- Insert account row (admin)
    const accountPayload = {
      id: authUser.id,
      name,
      email,
      role: normalizedRole,
      roles: normalizedRoles,
      divisions,
      status: "active",
      agent_level: agentLevel,
      invite_code: inviteCode || null,
      traveler_profile: travelerProfile || null,
      password_hash: hashPassword(password),
      created_at: new Date().toISOString(),
    };

    console.info("accounts_insert_start", { requestId, key: "service_role", url: supabaseUrl || null });
    const { data: account, error: insertError } = await supabaseAdminClient
      .from("accounts")
      .insert(accountPayload)
      .select("id, name, email, role, roles, divisions, status, agent_level, invite_code, partner_id, partner_company, traveler_profile")
      .single();

    if (insertError) {
      const code = (insertError as any)?.code || null;
      const isDuplicate = code === "23505" || /duplicate|already exists/i.test(insertError.message || "");
      if (isDuplicate) {
        const { data: updated, error: updateError } = await supabaseAdminClient
          .from("accounts")
          .update({
            name,
            role: normalizedRole,
            roles: normalizedRoles,
            divisions,
            status: "active",
            agent_level: agentLevel,
            invite_code: inviteCode || null,
            traveler_profile: travelerProfile || null,
            updated_at: new Date().toISOString(),
          })
          .eq("email", email)
          .select("id, name, email, role, roles, divisions, status, agent_level, invite_code, partner_id, partner_company, traveler_profile")
          .maybeSingle();

        if (!updateError && updated) {
          const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
          const token = signSession({ email: updated.email, roles: updated.roles || [updated.role || "traveler"], exp });
          const response = NextResponse.json({ user: updated }, { status: 200 });
          const cookieDomain = getCookieDomain();
          response.cookies.set(getSessionCookieName(), token, {
            httpOnly: true,
            sameSite: "lax",
            secure: true,
            path: "/",
            ...(cookieDomain ? { domain: cookieDomain } : {}),
            maxAge: 60 * 60 * 24 * 30,
          });
          return response;
        }
      }

      return errorResponse("accounts_insert_error", "Accounts insert failed", 500, {
        requestId,
        message: insertError.message,
        code,
      });
    }

    if (isAgentRole) {
      try {
        await dbQuery(
          "UPDATE agent_requests SET status='completed', completed_at=now() WHERE lower(email) = $1 AND code = $2 AND status = 'approved'",
          [email, inviteCode]
        );
      } catch {
        // ignore
      }
    }

    if (normalizedRole === "traveler" || normalizedRoles.includes("traveler")) {
      try {
        const existing = await dbQuery("SELECT id FROM clients WHERE lower(email) = lower($1) LIMIT 1", [email]);
        if (!existing.rows.length) {
          await dbQuery(
            "INSERT INTO clients (id, name, email, owner_email, phone, origin, assigned_agents, primary_division, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8, now())",
            [`C-${authUser.id}`, name || "Traveler", email, "info@zenivatravel.com", null, "web_signup", [], "TRAVEL"]
          );
        }
      } catch {
        // ignore client sync failures
      }

      if (travelerProfile?.referralCode && travelerProfile?.influencerId) {
        try {
          const referralId = globalThis.crypto?.randomUUID?.() || `ref-${Date.now()}`;
          await dbQuery(
            "INSERT INTO influencer_referrals (id, traveler_email, referral_code, influencer_id, captured_at, created_at) VALUES ($1,$2,$3,$4, now(), now())",
            [referralId, email, travelerProfile.referralCode, travelerProfile.influencerId]
          );
        } catch {
          // ignore referral persistence failures
        }
      }
    }

    // Push notification to HQ — new account created
    sendPushToHQ({
      title: "🆕 New Account!",
      body: `${account.name || account.email} just created an account`,
      url: "/agent/clients",
      tag: "new-account",
    }).catch(() => {});

    // Send welcome email via Resend (no more n8n/VPS dependency)
    sendEmail({
      fromName: "Lina — Zeniva Travel",
      to: account.email,
      subject: "Welcome to Zeniva Travel — Your Dream Trip Starts Here!",
      html: generateWelcomeEmailHTML(account.name || ""),
    }).catch((err) => console.error("Welcome email failed:", err));

    // ---- Create session cookie (your custom token)
    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
    const token = signSession({ email: account.email, roles: normalizedRoles, exp });

    const response = NextResponse.json(
      {
        user: {
          id: account.id,
          name: account.name,
          email: account.email,
          role: account.role,
          roles: normalizedRoles,
          divisions: account.divisions || [],
          status: account.status || "active",
          agentLevel: account.agent_level || null,
          inviteCode: account.invite_code || null,
          partnerId: account.partner_id || null,
          partnerCompany: account.partner_company || null,
          travelerProfile: account.traveler_profile || null,
        },
      },
      { status: 201 }
    );

    const cookieDomain = getCookieDomain();
    response.cookies.set(getSessionCookieName(), token, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      ...(cookieDomain ? { domain: cookieDomain } : {}),
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (err: any) {
    return errorResponse("crash", err?.message || "Signup failed", 500, {
      requestId,
      stack: err?.stack || null,
    });
  }
}

function generateWelcomeEmailHTML(name: string) {
  const greeting = name ? `Hi ${name}!` : "Hi there!";
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background:linear-gradient(135deg,#0B1B4D 0%,#0F6CF5 100%);padding:40px 30px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">Welcome to Zeniva Travel!</h1>
              <p style="margin:10px 0 0 0;color:#E6F0FF;font-size:16px;">Your dream trip starts here</p>
            </td>
          </tr>
          <tr>
            <td style="padding:30px;">
              <p style="margin:0 0 20px 0;color:#1e293b;font-size:16px;line-height:1.6;">${greeting}</p>
              <p style="margin:0 0 20px 0;color:#1e293b;font-size:16px;line-height:1.6;">
                I'm <strong>Lina</strong>, your personal AI travel assistant at Zeniva Travel. I'm here to help you plan unforgettable trips!
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0;background:linear-gradient(135deg,#10b981,#059669);border-radius:12px;">
                <tr>
                  <td style="padding:30px;text-align:center;">
                    <h2 style="margin:0 0 10px 0;color:#ffffff;font-size:32px;font-weight:700;">15% OFF</h2>
                    <p style="margin:0;color:#d1fae5;font-size:18px;font-weight:500;">Your First Trip with Zeniva</p>
                  </td>
                </tr>
              </table>
              <p style="margin:20px 0;color:#1e293b;font-size:16px;line-height:1.6;">Here's what you get with Zeniva:</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
                <tr><td style="padding:12px 0;"><span style="color:#10b981;font-size:20px;margin-right:10px;">&#10003;</span><span style="color:#1e293b;font-size:15px;">24/7 AI-powered travel assistance</span></td></tr>
                <tr><td style="padding:12px 0;"><span style="color:#10b981;font-size:20px;margin-right:10px;">&#10003;</span><span style="color:#1e293b;font-size:15px;">Personalized trip recommendations</span></td></tr>
                <tr><td style="padding:12px 0;"><span style="color:#10b981;font-size:20px;margin-right:10px;">&#10003;</span><span style="color:#1e293b;font-size:15px;">Exclusive deals on hotels, flights &amp; experiences</span></td></tr>
                <tr><td style="padding:12px 0;"><span style="color:#10b981;font-size:20px;margin-right:10px;">&#10003;</span><span style="color:#1e293b;font-size:15px;">Real-time booking management</span></td></tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://www.zenivatravel.com" style="display:inline-block;background:linear-gradient(135deg,#0F6CF5,#0B1B4D);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:16px;font-weight:600;box-shadow:0 4px 14px rgba(15,108,245,0.4);">
                      Start Planning My Trip
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:20px 0 0 0;color:#1e293b;font-size:16px;">
                <strong>Lina</strong><br>
                <span style="color:#64748b;font-size:14px;">Your AI Travel Concierge — Zeniva Travel</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8fafc;padding:30px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0 0 10px 0;color:#64748b;font-size:12px;">Zeniva Travel | Premium Travel Experiences</p>
              <div style="margin-top:15px;">
                <a href="https://www.zenivatravel.com" style="color:#0F6CF5;text-decoration:none;margin:0 10px;font-size:12px;">Website</a>
                <a href="https://www.zenivatravel.com/privacy" style="color:#0F6CF5;text-decoration:none;margin:0 10px;font-size:12px;">Privacy</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
