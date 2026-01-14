import { TripComponent } from "./types";

export type TripSplit = {
  totalSell: number;
  travelSell: number;
  yachtSell: number;
  yachtTravelShare: number;
  travelAgentShare: number;
  travelNetAfterAgent: number;
};

export function computeTripSplit(components: TripComponent[], travelAgentPct = 0): TripSplit {
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
  const agentShare = travelAgentPct > 0 ? travelSell * travelAgentPct : 0;
  const travelNet = travelSell - agentShare;
  return {
    totalSell: Math.round(travelSell + yachtSell),
    travelSell: Math.round(travelSell),
    yachtSell: Math.round(yachtSell),
    yachtTravelShare: Math.round(travelSell),
    travelAgentShare: Math.round(agentShare),
    travelNetAfterAgent: Math.round(travelNet),
  };
}
