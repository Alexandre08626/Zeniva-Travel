import { NextResponse } from "next/server";
import { listings } from "../../../../src/lib/devPartnerStore";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type");

  // only published listings are public
  let results = listings.filter((l) => l.status === "published");
  if (type) results = results.filter((l) => l.type === type);

  return NextResponse.json({ data: results });
}
