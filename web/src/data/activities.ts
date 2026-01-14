import { ActivityComponent } from "../lib/agent/types";

export const activities: ActivityComponent[] = [
  {
    id: "ACT-2001",
    type: "activity",
    productKind: "travel",
    status: "Quoted",
    title: "Private Louvre Evening",
    date: "2024-06-14",
    time: "19:00",
    location: "Paris",
    supplier: "Louvre",
    pricing: {
      currency: "EUR",
      net: 2500,
      sell: 3200,
      marginAmount: 700,
      marginPct: 28,
      commissionAmount: 480,
      commissionPct: 15,
    },
  },
  {
    id: "ACT-2002",
    type: "activity",
    productKind: "travel",
    status: "Quoted",
    title: "Colosseum Underground",
    date: "2024-06-18",
    time: "10:00",
    location: "Rome",
    supplier: "Roma Tours",
    pricing: {
      currency: "EUR",
      net: 850,
      sell: 1200,
      marginAmount: 350,
      marginPct: 41,
      commissionAmount: 240,
      commissionPct: 20,
    },
  },
];
