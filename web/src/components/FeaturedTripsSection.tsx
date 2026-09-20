"use client";

import FeaturedTripsByLina from "./FeaturedTripsByLina";

type Props = { variant?: "grid" | "carousel"; limit?: number };

export default function FeaturedTripsSection(props: Props) {
  return <FeaturedTripsByLina {...props} />;
}
