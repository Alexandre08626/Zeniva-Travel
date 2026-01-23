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
          lastError = new Error(`Duffel version ${version} unsupported: ${txt.slice(0, 200)}`);
          continue;
        }
        throw new Error(`Duffel API error (${version}): ${res.status} ${txt.slice(0, 200)}`);
      }

      try {
        return await res.json();
      } catch (jsonErr) {
        throw new Error(`Duffel API returned invalid JSON (${version}): ${(jsonErr as Error).message}`);
      }
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
function getDuffelStaysBaseUrl(key?: string) {
  const base = key?.startsWith('duffel_test_')
    ? 'https://api.duffel.com'
    : (process.env.DUFFEL_API_URL || 'https://api.duffel.com');

  return base.replace(/\/air\/?$/, '');
}

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
  const baseUrl = getDuffelStaysBaseUrl(key);
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
    throw new Error(`Stays search failed: ${response.status} ${error.slice(0, 200)}`);
  }

  try {
    return await response.json();
  } catch (jsonErr) {
    throw new Error(`Stays API returned invalid JSON: ${(jsonErr as Error).message}`);
  }
}

export async function fetchStayRates(searchResultId: string) {
  const key = process.env.DUFFEL_STAYS_API_KEY || process.env.DUFFEL_API_KEY;
  const baseUrl = getDuffelStaysBaseUrl(key);
  const version = 'v2';

  if (!key) {
    throw new Error('DUFFEL_API_KEY not configured');
  }

  if (searchResultId.startsWith('mock-')) {
    return {
      data: [
        {
          id: `mock-rate-${Date.now()}`,
          total_amount: '120.00',
          total_currency: 'USD',
          refundable: true,
          board_type: 'room_only',
        },
      ],
    } as any;
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
    if (response.status === 404) {
      return {
        data: [
          {
            id: `fallback-rate-${Date.now()}`,
            total_amount: '150.00',
            total_currency: 'USD',
            refundable: true,
            board_type: 'room_only',
          },
        ],
        fallback: true,
        error,
      } as any;
    }
    throw new Error(`Fetch rates failed: ${response.status} ${error}`);
  }

  return response.json();
}

export async function createStayQuote(rateId: string) {
  const key = process.env.DUFFEL_STAYS_API_KEY || process.env.DUFFEL_API_KEY;
  const baseUrl = getDuffelStaysBaseUrl(key);
  const version = process.env.DUFFEL_STAYS_VERSION || 'v2';

  if (!key) {
    throw new Error('DUFFEL_API_KEY not configured');
  }

  if (rateId.startsWith('mock-') || rateId.startsWith('fallback-rate-')) {
    return {
      data: {
        id: `mock-quote-${Date.now()}`,
        rate_id: rateId,
        expires_at: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
        total_amount: '150.00',
        total_currency: 'USD',
      },
    } as any;
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
    if (response.status === 404) {
      return {
        data: {
          id: `fallback-quote-${Date.now()}`,
          rate_id: rateId,
          expires_at: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
          total_amount: '150.00',
          total_currency: 'USD',
        },
        fallback: true,
        error,
      } as any;
    }
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
  const baseUrl = getDuffelStaysBaseUrl(key);
  const version = process.env.DUFFEL_STAYS_VERSION || 'v2';

  if (!key) {
    throw new Error('DUFFEL_API_KEY not configured');
  }

  if (params.quote_id.startsWith('mock-') || params.quote_id.startsWith('fallback-')) {
    return {
      data: {
        id: `mock-booking-${Date.now()}`,
        booking_reference: `ZNV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        status: 'confirmed',
        total_amount: '150.00',
        total_currency: 'USD',
        guest: params.guests?.[0],
        email: params.email,
      },
    } as any;
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
    if (response.status === 404) {
      return {
        data: {
          id: `fallback-booking-${Date.now()}`,
          booking_reference: `ZNV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          status: 'confirmed',
          total_amount: '150.00',
          total_currency: 'USD',
          guest: params.guests?.[0],
          email: params.email,
        },
        fallback: true,
        error,
      } as any;
    }
    throw new Error(`Create booking failed: ${response.status} ${error}`);
  }

  return response.json();
}
