export const dynamic = "force-dynamic";

export async function GET() {
  const token = process.env.UNIT_API_TOKEN || "";
  const url = process.env.UNIT_API_URL || "";
  return Response.json({
    tokenExists: token.length > 0,
    tokenLen: token.length,
    tokenStart: token.slice(0, 15),
    urlExists: url.length > 0,
    url: url,
    allEnvKeys: Object.keys(process.env).filter(k => k.includes("UNIT")).join(", "),
  });
}
