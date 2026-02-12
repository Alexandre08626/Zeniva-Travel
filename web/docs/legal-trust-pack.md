# Zeniva Legal and Trust Pack

This pack adds enterprise legal pages, cookie consent controls, DSAR requests, and conditional tracking.

## Deploy

1. Install dependencies in the web app folder.
2. Build and deploy as usual (Next.js App Router).

## Update addresses and contact info

Edit the constants in:
- web/src/components/legal/legal-constants.ts

This controls the operator name, addresses, email, privacy officer label, website, and the global "Last updated" and policy version strings.

## Update policy version and last updated

Change these values in:
- web/src/components/legal/legal-constants.ts

## Plug in GA4 and Meta Pixel

Set these environment variables:
- NEXT_PUBLIC_GA4_ID
- NEXT_PUBLIC_META_PIXEL_ID

Tracking scripts are loaded only after consent via:
- web/src/components/legal/tracking.ts

## Cookie consent behavior

Consent state is stored in:
- localStorage key: zeniva_consent_state
- cookie name: zeniva_consent

To open the preferences modal, use the "Cookie Settings" link in the footer or call:
- window.zenivaOpenCookieSettings()

## DSAR endpoint

The form posts to:
- /api/dsar

The endpoint is implemented in:
- web/app/api/dsar/route.ts

If the POST fails, the UI presents a mailto fallback.

## Routes

- /privacy-policy
- /cookie-policy
- /terms
- /ai-terms
- /do-not-sell
- /data-requests
