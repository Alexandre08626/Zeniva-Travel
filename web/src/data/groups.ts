import { PackageComponent } from "../lib/agent/types";

export const groups: PackageComponent[] = [
  {
    id: "GRP-6001",
    type: "package",
    productKind: "group",
    status: "Quoted",
    title: "Corporate Offsite - Lisbon",
    supplier: "BCD",
    pricing: {
      currency: "EUR",
      net: 42000,
      sell: 50000,
      marginAmount: 8000,
      marginPct: 19,
      commissionAmount: 3500,
      commissionPct: 7,
    },
  },
];
