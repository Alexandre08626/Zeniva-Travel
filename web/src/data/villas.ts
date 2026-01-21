import { PackageComponent } from "../lib/agent/types";

export const villas: PackageComponent[] = [
  {
    id: "VIL-5001",
    type: "package",
    productKind: "villa",
    status: "Quoted",
    title: "Ibiza Cala Serena Villa",
    supplier: "OneFineStay",
    pricing: {
      currency: "USD",
      net: 18500,
      sell: 21000,
      marginAmount: 2500,
      marginPct: 13,
      commissionAmount: 1680,
      commissionPct: 8,
    },
  },
];
