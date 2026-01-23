import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Endpoint moved", next: "/api/integrations/jason/yacht" },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}