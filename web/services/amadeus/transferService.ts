import { amadeusJson } from "@/services/amadeus/amadeusHttp";

export type TransferSearchParams = {
  origin: string;
  destination: string;
  dateTime: string;
  passengers?: number;
  currency?: string;
  endAddress?: string;
  endCity?: string;
  endCountryCode?: string;
  endZip?: string;
  endName?: string;
  endGeoCode?: string;
};

export type NormalizedTransferOffer = {
  id: string;
  provider: "amadeus";
  origin: string;
  destination: string;
  dateTime: string;
  vehicle?: {
    code?: string;
    category?: string;
    description?: string;
  };
  price?: {
    amount: number;
    currency: string;
  };
  transferType?: string;
  raw?: unknown;
};

export async function searchTransfers(params: TransferSearchParams, requestId: string) {
  const currency = params.currency || "USD";

  // Amadeus Transfer API — flat payload (NOT wrapped in data.type)
  // origin = IATA airport code (e.g. MIA), destination = city name or hotel address
  const payload: any = {
    startLocationCode: params.origin,
    startDateTime: params.dateTime,
    passengers: params.passengers || 1,
    currency,
    transferType: "PRIVATE",
    stopOvers: [],
  };

  // If destination looks like a city name (not IATA), use address fields
  if (params.endAddress) {
    payload.endAddressLine = params.endAddress;
    payload.endCityName = params.endCity || params.destination;
    payload.endCountryCode = params.endCountryCode || "US";
    if (params.endZip) payload.endZipCode = params.endZip;
    if (params.endName) payload.endName = params.endName;
    if (params.endGeoCode) payload.endGeoCode = params.endGeoCode;
  } else if (/^[A-Z]{3}$/i.test(params.destination)) {
    // IATA to IATA
    payload.endLocationCode = params.destination.toUpperCase();
  } else {
    // City name fallback
    payload.endCityName = params.destination;
    payload.endCountryCode = params.endCountryCode || "US";
  }

  const upstream: any = await amadeusJson({
    requestId,
    method: "POST",
    path: "/v1/shopping/transfer-offers",
    body: payload,
  });

  const offers: NormalizedTransferOffer[] = (upstream?.data || []).map((item: any) => {
    const id = String(item?.id || item?.offerId || "");
    const quotation = item?.quotation || item?.price || {};

    const amountCandidate =
      quotation?.monetaryAmount ||
      quotation?.totalAmount ||
      quotation?.grandTotal ||
      quotation?.total;

    const amount = amountCandidate != null ? Number(amountCandidate) : NaN;
    const currencyCode = quotation?.currencyCode || quotation?.currency || currency;

    const vehicle = item?.vehicle || item?.transportation?.vehicle || {};

    return {
      id: id || `transfer-${params.origin}-${params.destination}-${params.dateTime}`,
      provider: "amadeus",
      origin: params.origin,
      destination: params.destination,
      dateTime: params.dateTime,
      transferType: item?.transferType || item?.serviceProvider?.type || undefined,
      vehicle: {
        code: vehicle?.code,
        category: vehicle?.category,
        description: vehicle?.description,
      },
      price:
        Number.isFinite(amount) && currencyCode
          ? {
              amount,
              currency: String(currencyCode),
            }
          : undefined,
      raw: item,
    };
  });

  return { offers, raw: upstream };
}

export async function bookTransfer(payload: unknown, requestId: string) {
  // Transfer Booking expects a detailed reservation payload.
  // We accept the caller-provided JSON and forward it upstream.
  const upstream: any = await amadeusJson({
    requestId,
    method: "POST",
    path: "/v1/ordering/transfer-orders",
    body: payload,
  });

  const orderId = upstream?.data?.id ? String(upstream.data.id) : undefined;

  return {
    orderId,
    raw: upstream,
  };
}

export async function cancelTransfer(orderId: string, payload: unknown, requestId: string) {
  const upstream: any = await amadeusJson({
    requestId,
    method: "POST",
    path: `/v1/ordering/transfer-orders/${encodeURIComponent(orderId)}/transfers/cancellation`,
    body: payload,
  });

  return {
    raw: upstream,
  };
}
