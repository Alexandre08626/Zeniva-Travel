import { Pricing, TripComponent } from "./types";

export function aggregatePricing(components: TripComponent[], commissionOverridePct?: number, marginOverridePct?: number): Pricing | null {
  if (!components.length) return null;
  const currency = components[0].pricing.currency;

  // Apply yacht rule: 95% to Zeniva Yacht, 5% to Zeniva Travel; agent commission only on the 5% Travel share.
  let netTotal = 0;
  let sellTotal = 0;
  let marginBaseSell = 0;
  let marginAmountTotal = 0;

  components.forEach((c) => {
    const isYacht = c.productKind === "yacht";
    const share = isYacht ? 0.05 : 1;
    const compNet = c.pricing.net;
    const compSell = c.pricing.sell;
    netTotal += compNet;
    sellTotal += compSell;
    marginBaseSell += compSell * share;
    marginAmountTotal += compSell * share - compNet * share;
  });

  const marginPctBase = marginBaseSell ? Math.round((marginAmountTotal / marginBaseSell) * 1000) / 10 : 0;
  const commissionPct = commissionOverridePct ?? averageCommission(components);

  // Commission base respects yacht rule (5% travel share for yachts)
  const commissionBase = components.reduce((sum, c) => sum + c.pricing.sell * (c.productKind === "yacht" ? 0.05 : 1), 0);
  const commissionAmount = Math.round((commissionBase * commissionPct) / 100);

  const appliedSell = marginOverridePct != null ? Math.round(netTotal * (1 + marginOverridePct / 100)) : sellTotal;
  const appliedMarginAmount = appliedSell - netTotal;
  const appliedMarginPct = appliedSell ? Math.round((appliedMarginAmount / appliedSell) * 1000) / 10 : marginPctBase;

  return {
    currency,
    net: netTotal,
    sell: appliedSell,
    marginAmount: appliedMarginAmount,
    marginPct: appliedMarginPct,
    commissionAmount,
    commissionPct,
  };
}

function averageCommission(components: TripComponent[]) {
  if (!components.length) return 0;
  const total = components.reduce((sum, c) => sum + c.pricing.commissionPct, 0);
  return Math.round((total / components.length) * 10) / 10;
}
