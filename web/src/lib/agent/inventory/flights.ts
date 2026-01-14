import { FlightComponent, Pricing } from "../types";

function price(net: number, currency = "USD"): Pricing {
  const sell = Math.round(net * 1.18);
  const marginAmount = sell - net;
  const marginPct = Math.round((marginAmount / sell) * 1000) / 10;
  const commissionPct = 10;
  const commissionAmount = Math.round((sell * commissionPct) / 100);
  return { currency, net, sell, marginAmount, marginPct, commissionAmount, commissionPct };
}

export function searchFlights(): FlightComponent[] {
  return [
    {
      id: "FL-1",
      type: "flight",
      productKind: "travel",
      status: "Draft",
      from: "YUL",
      to: "CDG",
      dep: "2024-03-12T19:00",
      arr: "2024-03-13T07:55",
      carrier: "AF",
      cabin: "Premium Eco",
      supplier: "Duffel",
      provider: "Duffel",
      allowHold: true,
      pricing: price(820),
    },
    {
      id: "FL-2",
      type: "flight",
      productKind: "travel",
      status: "Draft",
      from: "YUL",
      to: "FCO",
      dep: "2024-03-14T17:30",
      arr: "2024-03-15T08:40",
      carrier: "AC/LH",
      cabin: "Business",
      supplier: "GDS",
      provider: "GDS",
      allowHold: false,
      pricing: price(1420),
    },
  ];
}
