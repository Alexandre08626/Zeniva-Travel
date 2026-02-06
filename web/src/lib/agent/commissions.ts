import { listTrips, getClientById } from "./store";
import { TripComponent } from "./types";

export type CommissionLine = {
  tripId: string;
  clientName: string;
  productKind: string;
  componentId: string;
  ruleLabel: string;
  bookingType: "zeniva_managed" | "agent_built";
  partnerFeePct: number;
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
    const hasAgent = client && client.ownerEmail && client.origin === "agent";
    if (!hasAgent) return;
    const agent = client?.ownerEmail || "";
    const bookingType = trip.bookingType || "zeniva_managed";
    const partnerFeePct = trip.partnerBooking ? Number(trip.partnerFeePct ?? 0.025) : 0;
    trip.components.forEach((c: TripComponent) => {
      const isYacht = c.productKind === "yacht";
      const baseRule = isYacht
        ? "Yacht travel share"
        : bookingType === "agent_built"
          ? "Agent-built (80/20)"
          : "Zeniva-managed (5% referral)";
      const ruleLabel = !isYacht && partnerFeePct > 0
        ? `${baseRule} + partner fee ${Math.round(partnerFeePct * 1000) / 10}%`
        : baseRule;

      const pct = isYacht
        ? trip.commissionOverridePct ?? c.pricing.commissionPct ?? 0
        : bookingType === "agent_built"
          ? 80
          : 5;

      let baseSell = c.pricing.sell * (isYacht ? 0.05 : 1);
      if (!isYacht && partnerFeePct > 0) {
        baseSell = Math.max(0, Math.round(baseSell - baseSell * partnerFeePct));
      }

      const baseCommission = Math.round((baseSell * pct) / 100);
      const bonuses: { label: string; amount: number }[] = [];
      const amount = baseCommission;
      lines.push({
        tripId: trip.id,
        clientName: client?.name || "",
        productKind: c.productKind,
        componentId: c.id,
        ruleLabel,
        bookingType,
        partnerFeePct,
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
