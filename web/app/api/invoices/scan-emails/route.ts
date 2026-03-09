import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Calls the VPS Python scanner (reliable IMAP, no serverless timeout)
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== "Bearer zeniva-secret-2025") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Call VPS scanner endpoint
    const vpsRes = await fetch("http://217.216.88.202:8000/admin/scan-invoices", {
      method: "POST",
      headers: {
        "Authorization": "Bearer zeniva-secret-2025",
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
