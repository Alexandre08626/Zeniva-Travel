import { NextRequest, NextResponse } from "next/server";
import { getVpsBase, internalAuthHeader, isInternalAuth } from "@/src/lib/server/internalSecret";

export const runtime = "nodejs";

// Calls the VPS Python scanner (reliable IMAP, no serverless timeout)
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!isInternalAuth(auth)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Call VPS scanner endpoint
    const vpsRes = await fetch(`${getVpsBase()}/admin/scan-invoices`, {
      method: "POST",
      headers: {
        "Authorization": internalAuthHeader(),
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(60000),
    });

    if (!vpsRes.ok) {
      throw new Error(`VPS returned ${vpsRes.status}`);
    }

    const data = await vpsRes.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("[invoice-scan]", error.message);
    return NextResponse.json({ 
      error: error.message,
      added: 0,
      hint: "VPS scanner unavailable — use the direct script on VPS"
    }, { status: 500 });
  }
}
