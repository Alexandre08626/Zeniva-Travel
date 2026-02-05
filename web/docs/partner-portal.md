# Zeniva Partner Portal — Design and MVP Implementation

> Summary

This document describes the Partner Portal design, MVP features implemented, technical decisions, database schema (logical), API routes, RBAC rules, frontend layout structure, onboarding flow, dashboard UX, and next steps.

---

## Product Vision

Self-service partner ecosystem where partners can onboard, publish listings (yachts, homes, hotels, experiences), manage pricing & availability, receive/manage bookings, communicate, track payouts, and view KPIs — built to reach enterprise marketplace depth while staying AI-native.

## High-level Principles
- Frictionless onboarding (wizard)
- Clear action states & alerts
- Mobile-first responsive design
- Fast publishing with compliance checks
- Multilingual-ready (EN only initially)
- API-first, modular, secure-by-default

## Implemented MVP (scope)
- Authentication hooks for Partner space (/login?space=partner, /signup?space=partner)
- Client-side partner account fields (KYC status, company profile)
- Partner dashboard UI skeleton (/partner/dashboard)
- Onboarding flow (/partner/onboarding) to complete company profile (KYC status pending)
- Listings page + simple API (/api/partner/listings) with in-memory store (dev)
- Bookings API (/api/partner/bookings) with in-memory store (dev)
- RBAC changes: new roles `partner_owner`, `partner_staff` with permissions
- Audit log hooks in client-side auth store

---

## Database Schema (logical) — MVP
Note: this is a logical schema. For production use a RDBMS (Postgres) and Prisma/TypeORM migrations.

- users
  - id (uuid)
  - email
  - name
  - password_hash
  - role (traveler, hq, admin, travel-agent, partner_owner, partner_staff, ...)
  - partner_id (nullable)
  - partner_profile (jsonb) -- mirror of partner details
  - created_at, updated_at

- partners
  - id (uuid)
  - owner_user_id
  - legal_name
  - display_name
  - phone
  - country
  - currency
  - language
  - kyc_status (pending/verified/rejected)
  - payout_settings (jsonb)
  - created_at, updated_at

- listings
  - id (uuid)
  - partner_id
  - type (yacht/home/hotel/event)
  - title
  - description
  - status (draft/published/paused)
  - address (json) / geolocation
  - capacity
  - amenities (json)
  - rules (json)
  - media (json array)
  - price_rules (json)
  - created_at, updated_at

- availability (calendar table)
  - id, listing_id, date, status (available/booked/blocked), price_override

- bookings
  - id
  - listing_id
  - partner_id
  - traveler_id
  - status (requested/confirmed/cancelled/completed/refunded)
  - total_amount, currency
  - payout_amount
  - created_at, updated_at

- payouts
  - id, partner_id, booking_ids, amount, status, payout_date

- audits
  - id, actor_user_id, action, target_type, target_id, meta(json), timestamp

- messages
  - id, thread_id, from_user_id, to_user_id, body, created_at

---

## API Contracts (MVP)
All endpoints under `/api/partner/*` should be authenticated (session/JWT). For MVP the repo contains dev in-memory routes.

- POST /api/partner/listings
  - body: { partnerId, type, title, status, data }
  - returns: 201 { data: listing }

- GET /api/partner/listings?partnerId=...
  - returns: 200 { data: [listings] }

- POST /api/partner/bookings
  - body: { partnerId, listingId, guest, total }
  - returns: 201 { data: booking }

- GET /api/partner/bookings?partnerId=...
  - returns: 200 { data: [bookings] }

---

## RBAC (MVP)
- Roles: TRAVELER, AGENT (various), PARTNER_OWNER, PARTNER_STAFF, ADMIN
- Partner-only permissions examples:
  - partner:listings:read|write
  - partner:bookings:manage
  - partner:payouts:read
  - partner:team:manage
- Enforcement:
  - Client-side: `useRequireRole(["partner_owner","partner_staff"])` for routes
  - Server-side: API middleware will validate session/jwt and permissions (TODO: implement fully)

---

## Frontend Layout Structure
- `app/partner/layout.tsx` — shell for partner space
- `app/partner/dashboard` — main entry
- `app/partner/onboarding` — company/KYC flow
- `app/partner/listings` — listing management
- `app/partner/listings/new` (TODO)
- `app/api/partner/*` — simple backend routes (dev)

---

## Onboarding Flow (MVP)
1. Partner clicks `Sign up as partner` → `/signup?space=partner`
2. Account created with `partner_owner` role and `partnerCompany.kycStatus = pending`
3. User completes company profile on `/partner/onboarding`
4. Zeniva reviews KYC (manual step) → sets status to `verified` or `rejected`
5. After verification partner can publish listings / manage bookings

---

## Dashboard UX Structure (initial)
- Overview: quick KPIs, recent bookings, upcoming check-ins
- Listings: create/edit listings, calendar, pricing
- Bookings: manage booking lifecycle and messages
- Payouts: wallet balance and history
- Team: invite staff and set permissions

---

## Security & Scale Notes
- Replace client-local auth with secure server-side session (JWT / NextAuth / custom) and store sessions in Redis
- Use Postgres + Prisma for structured data and migrations
- Enforce server-side RBAC and audit logging
- Offload heavy AI routines to dedicated AI services (pricing engine, automated messaging)
- Use Stripe Connect for payouts (abstraction layer implemented in service)

---

## TODO (v2 & roadmap)
- [ ] Production database schema + migrations (Prisma)
- [ ] Full server-side authentication (NextAuth / JWT) + role-based session validation middleware
- [ ] KYC provider integration and verifier dashboard
- [ ] Calendar/availability engine with proper conflict detection
- [ ] Pricing rules engine + AI optimization service
- [ ] Media processing: compression, CDN, alt text suggestions (AI)
- [ ] Messaging inbox with real-time push (WebSockets / Pusher)
- [ ] Reviews and moderation flow
- [ ] Payouts: Stripe Connect flows, tax reporting
- [ ] Tests: unit, integration, E2E

---

## Implementation Notes (what I added)
- Added partner roles & helper methods to `src/lib/authStore.ts` (`partner_owner`, `partner_staff`, `updatePartnerProfile`)
- Added partner login/signup UX changes to support `?space=partner`
- Added partner pages: `app/partner/*` (dashboard, onboarding, listings)
- Added basic API routes: `/api/partner/listings` and `/api/partner/bookings` — in-memory dev stores
- Created this design doc under `web/docs/partner-portal.md`


If you'd like, I can now:
1) Wire a Postgres + Prisma schema and migrations for the above logical model ✅
2) Implement server-side auth middleware + JWT / NextAuth and protect APIs ✅
3) Build full listing CRUD + calendar UI (React components) ✅
4) Add tests and E2E flows ✅

Tell me which to prioritize first.