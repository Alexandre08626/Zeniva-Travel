import { YachtComponent, Pricing } from "../types";

function price(total: number, currency = "USD"): Pricing {
  // Total net/sell of the yacht. Commission for agent will be applied only on 5% (Zeniva Travel share).
  const net = total;
  const sell = Math.round(total * 1.08); // modest markup for example
  const travelShareSell = sell * 0.05;
  const travelShareNet = net * 0.05;
  const marginAmount = travelShareSell - travelShareNet;
  const marginPct = travelShareSell ? Math.round((marginAmount / travelShareSell) * 1000) / 10 : 0;
  const commissionPct = 8; // only applied on travel share later by pricing util
  const commissionAmount = Math.round((travelShareSell * commissionPct) / 100);
  return { currency, net, sell, marginAmount, marginPct, commissionAmount, commissionPct };
}

export function searchYachts(): YachtComponent[] {
  return [
    {
      id: "YT-1",
      type: "yacht",
      productKind: "yacht",
      status: "Draft",
      name: "Zeniva One",
      location: "Med (Corsica / Sardinia)",
      length: "32m",
      guests: 10,
      weekStart: "2024-07-06",
      includesCrew: true,
      supplier: "Zeniva Yacht",
      provider: "Zeniva Yacht",
      allowHold: true,
      pricing: price(52000),
    },
    {
      id: "YT-2",
      type: "yacht",
      productKind: "yacht",
      status: "Draft",
      name: "Zeniva Blue",
      location: "Greek Islands",
      length: "40m",
      guests: 12,
      weekStart: "2024-08-10",
      includesCrew: true,
      supplier: "Zeniva Yacht",
      provider: "Zeniva Yacht",
      allowHold: false,
      pricing: price(78000),
    },
  ];
}
