import { amadeusJson } from "@/services/amadeus/amadeusHttp";

export type TransferSearchParams = {
  origin: string;
  destination: string;
  dateTime: string;
  passengers?: number;
  currency?: string;
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

  // Transfer Search is a POST upstream; we expose a GET with query params as requested.
  const payload = {
    data: {
      type: "transfer-offers",
      startLocationCode: params.origin,
      endLocationCode: params.destination,
      startDateTime: params.dateTime,
      passengers: params.passengers || 1,
      currency,
    },
  };

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
