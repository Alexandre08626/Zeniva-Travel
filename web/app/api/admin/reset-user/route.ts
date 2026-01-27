import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

// POST /api/admin/reset-user
// curl -X POST https://www.zenivatravel.com/api/admin/reset-user \
//   -H "content-type: application/json" \
//   -H "x-admin-token: ***" \
//   -d '{"email":"info@zeniva.ca"}'

export async function POST(request: Request) {
  const token = request.headers.get("x-admin-token") || "";
  if (!token || token !== process.env.ADMIN_RESET_TOKEN) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch (err) {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const email = String(body?.email || "").trim().toLowerCase();
  const alsoDeleteAuth = body?.alsoDeleteAuth !== false;

  if (!email) {
    return NextResponse.json({ ok: false, error: "missing_email" }, { status: 400 });
  }

  const { client: admin } = getSupabaseAdminClient();

  console.info("Reset request received", { email });
  console.info("Reset deleting public tables", { email });

  const { error: accountsError, count: accountsCount } = await admin
    .from("accounts")
    .delete({ count: "exact" })
    .eq("email", email);

  if (accountsError) {
    console.error("Reset accounts delete error", { message: accountsError.message });
  }

  const { error: clientsError, count: clientsCount } = await admin
    .from("clients")
    .delete({ count: "exact" })
    .eq("email", email);

  if (clientsError) {
    console.error("Reset clients delete error", { message: clientsError.message });
  }

  let authDeleted = false;
  if (alsoDeleteAuth) {
    console.info("Reset deleting auth user", { email });
    const { data: authList, error: authLookupError } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (authLookupError) {
      console.error("Reset auth lookup error", { message: authLookupError.message });
    } else {
      const authUser = authList?.users?.find((u) => u.email?.toLowerCase() === email) || null;
      if (authUser?.id) {
        const { error: deleteError } = await admin.auth.admin.deleteUser(authUser.id);
        if (deleteError) {
          console.error("Reset auth delete error", { message: deleteError.message });
        } else {
          authDeleted = true;
        }
      }
    }
  }

  console.info("Reset done", { email });
  return NextResponse.json({
    ok: true,
    email,
    deleted: {
      auth: authDeleted,
      accounts: accountsCount ?? 0,
      clients: clientsCount ?? 0,
    },
  });
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
