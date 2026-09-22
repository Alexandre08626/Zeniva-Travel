import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, destination, tripId, name } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }

    // Save lead on VPS
    await fetch("https://vmi3097009.contaboserver.net/admin/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer zeniva-secret-2025",
      },
      body: JSON.stringify({
        email,
        first_name: name?.split(" ")[0] || "",
        last_name: name?.split(" ").slice(1).join(" ") || "",
        destination: destination || "",
        source: "chat-generate-proposal",
        status: "new",
        source_ref: tripId || "",
      }),
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("lina-lead error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
