export const dynamic = "force-dynamic";

export async function GET() {
  // List ALL env var names that are present (not values, just keys)
  const allKeys = Object.keys(process.env);
  const unitKeys = allKeys.filter(k => k.includes("UNIT"));
  const supaKeys = allKeys.filter(k => k.includes("SUPA") || k.includes("supabase") || k.includes("SUPABASE"));
  const finixKeys = allKeys.filter(k => k.includes("FINIX"));
  
  return Response.json({
    unitKeys,
    supaKeys,
    finixKeys,
    totalEnvVars: allKeys.length,
    sampleKeys: allKeys.slice(0, 20),
    unitTokenDirect: process.env["UNIT_API_TOKEN"]?.slice(0, 15) || "(empty)",
    unitUrlDirect: process.env["UNIT_API_URL"] || "(empty)",
  });
}
