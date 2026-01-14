import { listTrips, getClientById } from "./store";
import { TripComponent } from "./types";

export type CommissionLine = {
  tripId: string;
  clientName: string;
  productKind: string;
  componentId: string;
  sellBase: number;
  commissionPct: number;
  commissionAmount: number;
  bonuses: { label: string; amount: number }[];
  totalCommission: number;
  agentEmail: string;
};

export function computeCommissions(agentEmail?: string) {
  const trips = listTrips();
  const lines: CommissionLine[] = [];
  trips.forEach((trip) => {
    const client = getClientById(trip.clientId);
    const eligible = client && client.ownerEmail && client.origin === "agent";
    if (!eligible) return;
    const agent = client!.ownerEmail;
    trip.components.forEach((c: TripComponent) => {
      const isYacht = c.productKind === "yacht";
      const baseSell = c.pricing.sell * (isYacht ? 0.05 : 1);
      const pct = trip.commissionOverridePct ?? c.pricing.commissionPct ?? 0;
      const baseCommission = Math.round((baseSell * pct) / 100);
      const bonuses: { label: string; amount: number }[] = [];
      if (client.origin === "agent") {
        bonuses.push({ label: "Client creation", amount: Math.round(baseSell * 0.01) });
      }
      if (trip.components.length >= 3) {
        bonuses.push({ label: "Manual build", amount: Math.round(baseSell * 0.01) });
      }
      if (trip.title.toLowerCase().includes("rebook")) {
        bonuses.push({ label: "Rebooking", amount: Math.round(baseSell * 0.01) });
      }
      const totalBonus = bonuses.reduce((acc, b) => acc + b.amount, 0);
      const amount = baseCommission + totalBonus;
      lines.push({
        tripId: trip.id,
        clientName: client?.name || "",
        productKind: c.productKind,
        componentId: c.id,
        sellBase: baseSell,
        commissionPct: pct,
        commissionAmount: baseCommission,
        bonuses,
        totalCommission: amount,
        agentEmail: agent,
      });
    });
  });
  return agentEmail ? lines.filter((l) => l.agentEmail === agentEmail) : lines;
}
