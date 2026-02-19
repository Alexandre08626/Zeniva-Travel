import { getAmadeusConfig } from "@/services/amadeus/amadeusConfig";
import { AmadeusUpstreamError } from "@/services/amadeus/amadeusErrors";

type TokenCache = {
  accessToken: string;
  expiresAtMs: number;
};

let tokenCache: TokenCache | null = null;
let tokenInFlight: Promise<string> | null = null;

export async function getAmadeusAccessToken(requestId: string): Promise<string> {
  const now = Date.now();

  if (tokenCache && tokenCache.expiresAtMs - 60_000 > now) {
    return tokenCache.accessToken;
  }

  if (tokenInFlight) return tokenInFlight;

  tokenInFlight = (async () => {
    const { baseUrl, clientId, clientSecret } = getAmadeusConfig();

    const url = `${baseUrl}/v1/security/oauth2/token`;

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    const text = await resp.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    if (!resp.ok) {
      throw new AmadeusUpstreamError("Amadeus token request failed", {
        requestId,
        status: resp.status,
        responseText: text,
        responseJson: json,
        headers: Object.fromEntries(resp.headers.entries()),
      });
    }

    const accessToken = json?.access_token;
    const expiresInSec = Number(json?.expires_in || 0);

    if (!accessToken || !Number.isFinite(expiresInSec) || expiresInSec <= 0) {
      throw new Error("Amadeus token response missing access_token/expires_in");
    }

    tokenCache = {
      accessToken,
      expiresAtMs: Date.now() + expiresInSec * 1000,
    };

    return accessToken;
  })();

  try {
    return await tokenInFlight;
  } finally {
    tokenInFlight = null;
  }
}

export function clearAmadeusTokenCache() {
  tokenCache = null;
}
