# Zeniva Travel Web App

This web app uses Next.js (app router) and integrates multiple travel APIs for flight search, hotel booking, activities, and AI-powered chat.

## Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Required environment variables

Create `.env.local` (or set host env vars) with server-only keys. Copy from `.env.local.example` and fill in your actual API keys:

### Core APIs
```
# Duffel API (Flight & Hotel search)
DUFFEL_API_URL=https://api.duffel.com
DUFFEL_API_KEY=your_duffel_api_key_here
DUFFEL_STAYS_API_KEY=your_duffel_stays_api_key_here
DUFFEL_VERSION=v2

# OpenAI API (Chat functionality)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
OPENAI_API_BASE=https://api.openai.com/v1

# Amadeus API (Alternative flight search)
AMADEUS_API_KEY=your_amadeus_api_key_here
AMADEUS_API_SECRET=your_amadeus_api_secret_here

# Hotelbeds API (Activities & Transfers)
HOTELBEDS_API_KEY=your_hotelbeds_api_key_here
HOTELBEDS_API_SECRET=your_hotelbeds_api_secret_here
HOTELBEDS_BASE_URL_TEST=https://api.test.hotelbeds.com
HOTELBEDS_BASE_URL_PROD=https://api.hotelbeds.com
HOTELBEDS_USE_MTLS=false
```

### Optional
```
# Lina / Chat server
LINA_API_URL=https://your-lina-server.example.com
LINA_API_KEY=your_lina_api_key_here

# Stripe (Payment processing)
STRIPE_SECRET_KEY=your_stripe_secret_key_here
```

**⚠️ Never expose these as `NEXT_PUBLIC_*`. The frontend only calls relative endpoints like `/api/partners/duffel`.**

## Deployment

### 1. Get API Keys
- **Duffel**: Sign up at [duffel.com](https://duffel.com) for flight and hotel APIs
- **OpenAI**: Get key at [platform.openai.com](https://platform.openai.com)
- **Amadeus**: Register at [developers.amadeus.com](https://developers.amadeus.com)
- **Hotelbeds**: Contact Hotelbeds for API access

### 2. Configure Environment Variables

#### Vercel
```bash
vercel env add DUFFEL_API_KEY
vercel env add OPENAI_API_KEY
# ... add all required variables
```

#### Netlify
Add to Site Settings > Environment Variables:
```
DUFFEL_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
# ... etc
```

#### Railway/DigitalOcean
Set environment variables in your dashboard or via CLI.

### 3. Deploy
```bash
# Vercel
npm install -g vercel
vercel

# Netlify
npm install -g netlify-cli
netlify deploy --prod

# Or push to GitHub and connect to your platform
```

## Health and tests

- Health: GET `/api/health` returns env status and provider reachability.
- Smoke test (server must be running or set `LINA_BASE_URL`):

```bash
npm run test:lina
```

This posts to `/api/lina` with a sample prompt and fails fast if the provider or env are misconfigured.

### Duffel Stays end-to-end demo

We provide a convenience E2E script that performs a full Stays search → rates → quote → booking flow (saves artifacts and a confirmation screenshot).

Prerequisites:
- Dev server running: `npm run dev` (from `web/`)
- Use Duffel **test** keys (or request Duffel to activate Live mode). Duffel test keys begin with `duffel_test_`.

Run the demo script:

```bash
# from the repo root
cd web
npm run test:duffel:e2e
```

Artifacts (search results, rates, quote, booking and a screenshot) are written to `web/scripts/artifacts/`.

If your Duffel account is not yet approved for Live mode, the server will automatically attempt an Amadeus fallback or return mock offers for UI testing.

## API Endpoints

- `/api/partners/duffel` - Flight search
- `/api/partners/duffel-stays` - Hotel search
- `/api/partners/amadeus` - Alternative flight search
- `/api/partners/hotelbeds/activities` - Activity booking
- `/api/partners/hotelbeds/transfers` - Transfer services
- `/api/lina` - AI chat
- `/api/health` - System health check
