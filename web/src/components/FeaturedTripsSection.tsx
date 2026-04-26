"use client";

import FeaturedTripsByLina from "./FeaturedTripsByLina";

export default function FeaturedTripsSection({ limit = 12 }: { limit?: number } = {}) {
  return <FeaturedTripsByLina limit={limit} />;
}