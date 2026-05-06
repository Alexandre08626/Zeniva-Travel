"use client";

import FeaturedTripsByLina from "./FeaturedTripsByLina";

type Props = {
  limit?: number;
  initialPrices?: Record<string, any>;
};

export default function FeaturedTripsSection({ limit = 12, initialPrices }: Props = {}) {
  return <FeaturedTripsByLina limit={limit} initialPrices={initialPrices} />;
}
