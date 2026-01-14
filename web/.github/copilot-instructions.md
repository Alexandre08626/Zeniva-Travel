2# Copilot Instructions for AI Agents

## Project Overview
- This is a Next.js app (using the app router) for Zeniva Travel, a travel planning platform with Lina AI as the executive travel assistant.
- Lina collects mandatory trip data (origin, destination, dates, travelers, budget, style) before generating proposals.
- All sensitive AI provider calls (e.g., Lina/OpenAI) are proxied through server routes (see `app/api/lina/route.ts`) to keep API keys secure and off the client.
- The frontend never exposes secrets as `NEXT_PUBLIC_*`.
- Chat is organized per trip, with threads, conversations sidebar, and trip snapshots.

## Key Workflows
- **Start dev server:**
  ```bash
  npm install
  npm run dev
  # open http://localhost:3000
  ```
- **Health check:**
  - GET `/api/health` for environment and provider status.
- **Smoke test:**
  ```bash
  npm run test:lina
  ```
  - Posts a sample prompt to `/api/lina` to verify provider/env config.
- **Lint:**
  ```bash
  npm run lint
  ```

## Environment
- Set secrets in `.env.local` (never expose as `NEXT_PUBLIC_*`).
- Example:
  ```
  OPENAI_API_KEY=sk-...
  OPENAI_MODEL=gpt-4o-mini
  OPENAI_API_BASE=https://api.openai.com/v1
  LINA_TIMEOUT_MS=18000
  ```

## Structure & Patterns
- **Pages:**
  - Main app routes in `app/`, with subfolders for features (e.g., `agent/`, `airbnbs/`, `chat/`).
  - Dynamic routes use `[param]` syntax (e.g., `chat/[tripId]/`).
  - Chat redirects to trip-specific pages via `ensureSeedTrip()` from `lib/store/tripsStore.js`.
- **Components:**
  - Shared React components in `components/` and `src/components/`.
  - Chat components: `ChatLayout`, `ChatThread`, `ConversationsSidebar`, `TripSnapshotPanel`.
- **Data:**
  - Static and mock data in `src/data/` and `app/agent/bookings/data.ts`.
  - Trip state managed via Zustand store in `lib/store/tripsStore.js`.
- **Lib:**
  - Shared logic in `src/lib/` (e.g., `authStore.ts`, `linaClient.ts` for client-side Lina calls).
  - Lina client always calls `/api/lina` to proxy to OpenAI.
- **Styling:**
  - Global styles in `app/globals.css`.
  - Tailwind CSS used site-wide.

## Conventions
- Use server routes for all external API calls requiring secrets.
- Organize features as folders under `app/` with their own `page.tsx` and optional `layout.tsx`.
- Prefer colocating feature-specific data and logic within their feature folder.
- Use TypeScript for all new code.
- Lina responses include structured TRIP_JSON blocks for auto-filling trip data; extract and strip using `extractTripJson` and `stripTripJson` from `linaClient.ts`.
- Chat threads are per trip; use `useTripsStore` for state management.

## Examples
- To add a new feature, create a folder under `app/` (e.g., `app/agent/new-feature/`) with its own `page.tsx`.
- For shared UI, add to `src/components/`.
- When implementing Lina integrations, follow the system prompt in `app/api/lina/route.ts` for mandatory data collection.

## Integration Points
- Lina AI: Proxied via `/api/lina`; collects data in sequence, outputs TRIP_JSON for proposals.
- External deps: OpenAI for Lina, potential Duffel/Stripe integrations mentioned in comments.
- Images: Allowed from `images.unsplash.com` in `next.config.js`.

## References
- See `README.md` for setup and test details.
- See `app/api/lina/route.ts` for Lina proxy logic and system prompt.
- See `src/lib/linaClient.ts` for client-side Lina calls.
- See `lib/store/tripsStore.js` for trip state management.
- See `components/chat/` for chat UI components.

---
For questions about project-specific patterns, check the folder structure and existing feature folders for examples.

- Preserve Tailwind-first styling; small presentational helpers may be defined inline for simple pages.
- Respect the existing font variables imported in `app/layout.tsx` to avoid duplicate font loads.
- Check which `next.config` is actually used before editing image or build configs (there is both a root `next.config.ts` and `app/next.config.js`).

Quick examples
- Form read (server route): read `prompt` via `const prompt = request.nextUrl.searchParams.get('prompt')` in `app/chat/route.ts`.
- Add an external image host: update `images.remotePatterns` in the active `next.config` to include the host.

Questions for you
- Should AI responses live in `app/chat/route.ts` (JSON API) or `app/chat/page.tsx` (SSR UI)? Reply with preference and I’ll adapt the guidance.

If anything here is unclear or you want the file split/expanded, tell me which parts to elaborate.
