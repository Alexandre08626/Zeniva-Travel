This web app uses Next.js (app router) and proxies all Lina AI calls through a server route to keep provider keys off the browser.

## Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Required environment

Create `.env.local` (or set host env vars) with server-only keys:

```
OPENAI_API_KEY=sk-...
# optional overrides
OPENAI_MODEL=gpt-4o-mini
OPENAI_API_BASE=https://api.openai.com/v1
```

Never expose these as `NEXT_PUBLIC_*`. The frontend only calls the relative endpoint `/api/lina`.

## Health and tests

- Health: GET `/api/health` returns env status and provider reachability.
- Smoke test (server must be running or set `LINA_BASE_URL`):

```bash
npm run test:lina
```

This posts to `/api/lina` with a sample prompt and fails fast if the provider or env are misconfigured.
