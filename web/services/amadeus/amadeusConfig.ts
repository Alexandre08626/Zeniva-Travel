export type AmadeusConfig = {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
};

type AmadeusEnv = "test" | "prod";

function normalizeEnv(raw: string | undefined): AmadeusEnv {
  const value = String(raw || "").trim().toLowerCase();
  if (value === "prod" || value === "production" || value === "live") return "prod";
  return "test";
}

function stripUrlNoise(raw: string): string {
  let url = (raw || "").trim();
  url = url.replace(/\/$/, "");
  // Some setups mistakenly store a versioned base URL (e.g. https://.../v1).
  // Our service paths include the version prefix already, so strip it here.
  url = url.replace(/\/(v\d+(?:\.\d+)*)$/i, "");
  return url;
}

export function getAmadeusConfig(): AmadeusConfig {
  const env = normalizeEnv(process.env.AMADEUS_ENV || process.env.AMADEUS_MODE);
  const defaultBaseUrl = env === "prod" ? "https://api.amadeus.com" : "https://test.api.amadeus.com";
  const baseUrl = stripUrlNoise(process.env.AMADEUS_BASE_URL || defaultBaseUrl);

  const clientId =
    (env === "prod" ? process.env.AMADEUS_PROD_CLIENT_ID || process.env.AMADEUS_PROD_API_KEY : process.env.AMADEUS_TEST_CLIENT_ID || process.env.AMADEUS_TEST_API_KEY) ||
    process.env.AMADEUS_CLIENT_ID ||
    process.env.AMADEUS_API_KEY ||
    "";

  const clientSecret =
    (env === "prod" ? process.env.AMADEUS_PROD_CLIENT_SECRET || process.env.AMADEUS_PROD_API_SECRET : process.env.AMADEUS_TEST_CLIENT_SECRET || process.env.AMADEUS_TEST_API_SECRET) ||
    process.env.AMADEUS_CLIENT_SECRET ||
    process.env.AMADEUS_API_SECRET ||
    "";

  if (!clientId || !clientSecret) {
    const prefix = env === "prod" ? "AMADEUS_PROD_" : "AMADEUS_TEST_";
    throw new Error(
      `Missing Amadeus credentials (env=${env}). Set ${prefix}CLIENT_ID + ${prefix}CLIENT_SECRET (or ${prefix}API_KEY + ${prefix}API_SECRET). ` +
      "Fallback supported: AMADEUS_CLIENT_ID + AMADEUS_CLIENT_SECRET (or AMADEUS_API_KEY + AMADEUS_API_SECRET)."
    );
  }

  return { baseUrl, clientId, clientSecret };
}
