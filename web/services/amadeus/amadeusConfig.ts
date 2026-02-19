export type AmadeusConfig = {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
};

export function getAmadeusConfig(): AmadeusConfig {
  let baseUrl = (process.env.AMADEUS_BASE_URL || "https://test.api.amadeus.com").trim();
  baseUrl = baseUrl.replace(/\/$/, "");

  // Some setups mistakenly store a versioned base URL (e.g. https://.../v1).
  // Our service paths include the version prefix already, so strip it here.
  baseUrl = baseUrl.replace(/\/(v\d+(?:\.\d+)*)$/i, "");

  const clientId =
    process.env.AMADEUS_CLIENT_ID ||
    process.env.AMADEUS_API_KEY ||
    "";

  const clientSecret =
    process.env.AMADEUS_CLIENT_SECRET ||
    process.env.AMADEUS_API_SECRET ||
    "";

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing Amadeus credentials. Set AMADEUS_CLIENT_ID + AMADEUS_CLIENT_SECRET (or AMADEUS_API_KEY + AMADEUS_API_SECRET) in server env."
    );
  }

  return { baseUrl, clientId, clientSecret };
}
