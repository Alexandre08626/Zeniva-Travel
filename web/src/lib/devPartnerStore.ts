// Temporary in-memory store for partner portal (development only).
// TODO: Replace with persistent DB (Postgres + Prisma) and move to server-side services.

import { mockListings } from "./mockData";

export const listings: any[] = [...mockListings];
export const bookings: any[] = [];