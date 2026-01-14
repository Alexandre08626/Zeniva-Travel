export async function searchDuffelOffers(params: Record<string, any> = {}) {
  const key = process.env.DUFFEL_API_KEY;
  const baseUrl = process.env.DUFFEL_API_URL || 'https://api.duffel.com';
  // Use configured Duffel API version or default to v2 (supported current standard).
  const preferredVersion = process.env.DUFFEL_VERSION || 'v2';

  if (!key) {
    return {
      mock: true,
      message: 'DUFFEL_API_KEY not set in environment; returning mock offers',
      data: { offers: [] },
    };
  }

  // Try the configured version first (Duffel requires a version header).
  const candidates = [preferredVersion].filter((v) => v);
  let lastError: any = null;

  for (const version of candidates) {
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      };

      if (version) {
        headers['Duffel-Version'] = version;
      }

      const res = await fetch(`${baseUrl}/air/offer_requests`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ data: params }),
      });

      if (!res.ok) {
        const txt = await res.text();
        // If version unsupported, try next candidate
        if (res.status === 400 && txt.includes('unsupported_version')) {
          lastError = new Error(`Duffel version ${version} unsupported: ${txt}`);
          continue;
        }
        throw new Error(`Duffel API error (${version}): ${res.status} ${txt}`);
      }

      return res.json();
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Duffel request failed');
}

export function duffelIsConfigured() {
  return Boolean(process.env.DUFFEL_API_KEY && process.env.DUFFEL_VERSION);
}

// Duffel Stays API functions
export async function searchStays(params: {
  rooms: number;
  location: {
    radius: number;
    geographic_coordinates: {
      longitude: number;
      latitude: number;
    };
  };
  check_out_date: string;
  check_in_date: string;
  guests: Array<{ type: string }>;
}) {
  const key = process.env.DUFFEL_STAYS_API_KEY || process.env.DUFFEL_API_KEY;
  // Use test API URL for test keys
  const baseUrl = key?.startsWith('duffel_test_') ? 'https://api.duffel.com' : (process.env.DUFFEL_API_URL || 'https://api.duffel.com');
  const version = 'v2';

  if (!key) {
    throw new Error('DUFFEL_API_KEY not configured');
  }

  const response = await fetch(`${baseUrl}/stays/search`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Duffel-Version': version,
    },
    body: JSON.stringify({ data: params }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Stays search failed: ${response.status} ${error}`);
  }

  return response.json();
}

export async function fetchStayRates(searchResultId: string) {
  const key = process.env.DUFFEL_STAYS_API_KEY || process.env.DUFFEL_API_KEY;
  const baseUrl = process.env.DUFFEL_API_URL || 'https://api.duffel.com';
  const version = 'v2';

  if (!key) {
    throw new Error('DUFFEL_API_KEY not configured');
  }

  const response = await fetch(`${baseUrl}/stays/search_results/${searchResultId}/rates`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Duffel-Version': version,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Fetch rates failed: ${response.status} ${error}`);
  }

  return response.json();
}

export async function createStayQuote(rateId: string) {
  const key = process.env.DUFFEL_STAYS_API_KEY || process.env.DUFFEL_API_KEY;
  const baseUrl = process.env.DUFFEL_API_URL || 'https://api.duffel.com';
  const version = 'v1';

  if (!key) {
    throw new Error('DUFFEL_API_KEY not configured');
  }

  const response = await fetch(`${baseUrl}/stays/quotes`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Duffel-Version': version,
    },
    body: JSON.stringify({ data: { rate_id: rateId } }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Create quote failed: ${response.status} ${error}`);
  }

  return response.json();
}

export async function createStayBooking(params: {
  quote_id: string;
  phone_number: string;
  guests: Array<{
    given_name: string;
    family_name: string;
    born_on: string;
  }>;
  email: string;
  accommodation_special_requests?: string;
}) {
  const key = process.env.DUFFEL_STAYS_API_KEY || process.env.DUFFEL_API_KEY;
  const baseUrl = process.env.DUFFEL_API_URL || 'https://api.duffel.com';
  const version = 'v1';

  if (!key) {
    throw new Error('DUFFEL_API_KEY not configured');
  }

  const response = await fetch(`${baseUrl}/stays/bookings`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Duffel-Version': version,
    },
    body: JSON.stringify({ data: params }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Create booking failed: ${response.status} ${error}`);
  }

  return response.json();
}
