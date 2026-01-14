const base = process.env.LINA_BASE_URL || process.env.BASE_URL || "http://localhost:3000";

async function main() {
  const payload = { prompt: "Health check from test:lina" };
  const res = await fetch(`${base}/api/lina`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (err) {
    throw new Error(`Non-JSON response (${res.status}): ${text}`);
  }

  if (!res.ok) {
    throw new Error(`Request failed (${res.status}): ${text}`);
  }

  if (!json?.reply) {
    throw new Error("Missing reply in response");
  }

  console.log(`✅ /api/lina responded ${res.status} (requestId: ${json.requestId || "n/a"})`);
  console.log(`Reply preview: ${String(json.reply).slice(0, 120)}`);
}

main().catch((err) => {
  console.error("❌ test:lina failed", err?.message || err);
  process.exit(1);
});
