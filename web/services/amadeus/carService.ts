import { amadeusJson } from "@/services/amadeus/amadeusHttp";

export type CarSearchParams = {
  pickup: string;
  dropoff?: string;
  startDate: string;
  endDate: string;
  age?: number;
  currency?: string;
  lang?: string;
};

export type NormalizedCarOffer = {
  id: string;
  provider: "amadeus";
  pickup: string;
  dropoff: string;
  startDate: string;
  endDate: string;
  vehicle?: {
    name?: string;
    category?: string;
    transmission?: string;
    fuel?: string;
    seats?: number;
    doors?: number;
  };
  price?: {
    amount: number;
    currency: string;
  };
  raw?: unknown;
};

export async function searchCars(params: CarSearchParams, requestId: string) {
  // Note: Car rental APIs availability depends on your Amadeus plan.
  // We optimistically try the common Self-Service endpoint; if access is missing, callers will receive NOT_AVAILABLE.

  const pickup = params.pickup;
  const dropoff = params.dropoff || params.pickup;
  const currency = params.currency || "USD";

  const upstream: any = await amadeusJson({
    requestId,
    method: "GET",
    path: "/v3/shopping/car-rental-offers",
    query: {
      pickUpLocationCode: pickup,
      dropOffLocationCode: dropoff,
      pickUpDate: params.startDate,
      dropOffDate: params.endDate,
      currency,
      ...(params.age ? { driverAge: params.age } : null),
      ...(params.lang ? { language: params.lang } : null),
    },
  });

  const offers: NormalizedCarOffer[] = (upstream?.data || []).map((item: any, idx: number) => {
    const id = String(item?.id || item?.offerId || `${pickup}-${params.startDate}-${idx}`);

    const amountCandidate =
      item?.price?.total ||
      item?.price?.grandTotal ||
      item?.quotation?.monetaryAmount ||
      item?.quotation?.totalAmount;

    const amount = amountCandidate != null ? Number(amountCandidate) : NaN;
    const currencyCode =
      item?.price?.currency ||
      item?.price?.currencyCode ||
      item?.quotation?.currencyCode ||
      currency;

    return {
      id,
      provider: "amadeus",
      pickup,
      dropoff,
      startDate: params.startDate,
      endDate: params.endDate,
      vehicle: {
        name: item?.vehicle?.name || item?.vehicle?.model || item?.vehicle?.acrissCode,
        category: item?.vehicle?.category || item?.vehicle?.type,
        transmission: item?.vehicle?.transmission,
        fuel: item?.vehicle?.fuel,
        seats: item?.vehicle?.seats != null ? Number(item.vehicle.seats) : undefined,
        doors: item?.vehicle?.doors != null ? Number(item.vehicle.doors) : undefined,
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

export async function bookCar(_payload: unknown, _requestId: string) {
  // Car booking is typically not available in Self-Service plans.
  return {
    notAvailable: true as const,
    guidance: "Car booking is not enabled for this Amadeus access level. Use search results to redirect to supplier/OTA booking, or request Enterprise access.",
  };
}
