export const dynamic = "force-dynamic";

export async function GET() {
  const token = process.env.UNIT_API_TOKEN || "";
  const url = process.env.UNIT_API_URL || "https://api.s.unit.co";

  // Test 1: DNS resolution
  let dnsOk = false;
  let unitResponse: unknown = null;
  let unitError = "";

  try {
    const r = await fetch(`${url}/customers?page[limit]=1`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/vnd.api+json",
      },
      signal: AbortSignal.timeout(10000),
    });
    dnsOk = true;
    const text = await r.text();
    try { unitResponse = JSON.parse(text); } catch { unitResponse = text.slice(0, 200); }
  } catch (e) {
    unitError = e instanceof Error ? e.message : String(e);
  }

  return Response.json({
    tokenOk: !!token,
    tokenStart: token.slice(0, 15),
    unitUrl: url,
    dnsOk,
    unitResponse,
    unitError,
  });
}
