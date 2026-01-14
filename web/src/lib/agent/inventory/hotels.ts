import { HotelComponent, Pricing } from "../types";

function price(net: number, currency = "USD"): Pricing {
  const sell = Math.round(net * 1.22);
  const marginAmount = sell - net;
  const marginPct = Math.round((marginAmount / sell) * 1000) / 10;
  const commissionPct = 12;
  const commissionAmount = Math.round((sell * commissionPct) / 100);
  return { currency, net, sell, marginAmount, marginPct, commissionAmount, commissionPct };
}

export function searchHotels(): HotelComponent[] {
  return [
    {
      id: "HT-1",
      type: "hotel",
      productKind: "travel",
      status: "Draft",
      hotel: "Hotel Lutetia",
      location: "Paris, 6e",
      checkIn: "2024-03-13",
      checkOut: "2024-03-17",
      room: "Deluxe King",
      board: "Breakfast",
      supplier: "TravelgateX",
      provider: "TravelgateX",
      allowHold: true,
      pricing: price(620),
    },
    {
      id: "HT-2",
      type: "hotel",
      productKind: "travel",
      status: "Draft",
      hotel: "Bulgari Rome",
      location: "Rome",
      checkIn: "2024-03-15",
      checkOut: "2024-03-18",
      room: "Junior Suite",
      board: "Room only",
      supplier: "Supplier",
      provider: "Supplier",
      allowHold: false,
      pricing: price(980),
    },
  ];
}
