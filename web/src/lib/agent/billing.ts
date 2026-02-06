import { TripComponent } from "./types";

export type TripSplit = {
  totalSell: number;
  travelSell: number;
  yachtSell: number;
  yachtTravelShare: number;
  partnerFeeAmount: number;
  travelAfterPartnerFee: number;
  travelAgentShare: number;
  travelNetAfterAgent: number;
};

export function computeTripSplit(components: TripComponent[], travelAgentPct = 0, partnerFeePct = 0): TripSplit {
  let travelSell = 0;
  let yachtSell = 0;
  components.forEach((c) => {
    if (c.productKind === "yacht") {
      yachtSell += c.pricing.sell * 0.95;
      travelSell += c.pricing.sell * 0.05;
    } else {
      travelSell += c.pricing.sell;
    }
  });
  const partnerFee = partnerFeePct > 0 ? travelSell * partnerFeePct : 0;
  const travelAfterFee = travelSell - partnerFee;
  const agentShare = travelAgentPct > 0 ? travelAfterFee * travelAgentPct : 0;
  const travelNet = travelAfterFee - agentShare;
  return {
    totalSell: Math.round(travelSell + yachtSell),
    travelSell: Math.round(travelSell),
    yachtSell: Math.round(yachtSell),
    yachtTravelShare: Math.round(travelSell),
    partnerFeeAmount: Math.round(partnerFee),
    travelAfterPartnerFee: Math.round(travelAfterFee),
    travelAgentShare: Math.round(agentShare),
    travelNetAfterAgent: Math.round(travelNet),
  };
}
