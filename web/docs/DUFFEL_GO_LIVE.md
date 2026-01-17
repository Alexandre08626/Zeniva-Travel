# Duffel Stays — Go Live checklist

This document explains how to demonstrate your Stays integration to Duffel and produce the assets they request (screenshots or a video of the four steps).

## Pre-requisites
- Use Duffel *test* keys for your local testing: `DUFFEL_STAYS_API_KEY` must be a key starting with `duffel_test_` when running tests.
- Add your test keys to `.env.local` by copying the example and filling values (do NOT commit `.env.local`):
  ```bash
  cd web
  cp .env.example .env.local
  # edit .env.local and set DUFFEL_STAYS_API_KEY=duffel_test_...
  ```
- Quick key check (optional):
  ```bash
  cd web
  node scripts/check-duffel-keys.mjs
  ```
- Start the dev server from `web/`:
  ```bash
  cd web
  npm install
  npm run dev
  ```

## End-to-end demo (required captures)
You must capture the following steps and provide clear screenshots/video:
1. Search — results should include the **Duffel Test Hotel** (Henderson Island)
   - Use coordinates: `-24.38,-128.32` and dates like `2025-06-10` → `2025-06-17`.
   - Example endpoint (dev):
     `GET /api/partners/duffel-stays?destination=-24.38,-128.32&checkIn=2025-06-10&checkOut=2025-06-17&guests=2&rooms=1`
2. Display accommodation details & rates — show rate names including the two test rooms:
   - `Successful Booking by Balance` and `Successful Booking by Card`.
   - Endpoint: `GET /api/partners/duffel-stays/rates?searchResultId=<id>`
3. Checkout (quote → booking) — POST a rate to `/quotes` then POST the quote to `/bookings`.
4. Booking confirmation — capture the confirmation page (must display all required fields listed below).

## Display requirements (UI must clearly show these fields)
- Number of guests
- Number of rooms
- Number of nights
- Accommodation name
- Accommodation location / address
- Check-in date
- Check-out date
- Check-in information (arrival instructions / key collection)
- Price: total, taxes, fees, due at accommodation (separate lines)
- Refundability (cancellation timeline)
- Hotel policy and rate conditions
- Your business name, address, customer service contact details, and Terms URL
- Booking reference, booking confirmed date, and key collection info (on confirmation)

## Local test automation
We provide a convenience script that runs the 4 steps and saves artifacts to `web/scripts/artifacts/`:

```bash
cd web
npm run test:duffel:e2e
```

It will save: `search.json`, `rates.json`, `quote.json`, `booking.json`, and `confirmation.png`.

To package the artifacts into a zip for submitting to Duffel:

```bash
cd web
npm run pack:duffel:artifacts
```

## If Duffel returns 403 (Live access denied)
- Duffel must enable Live Stays for your account. Contact your Duffel onboarding rep and request Live mode activation.
- For the review, you MUST run the flows in **test mode** with `duffel_test_` keys so the test hotel and test rate names are available.

## Acceptance
When you have the screenshots and the ZIP file, submit them to the Duffel onboarding channel along with the following notes:
- Which endpoints you used & exact parameters
- Screenshot list mapped to the required review steps
- Any missing information or questions (e.g., taxes display, cancellation timeline mapping)

If you want, I can:
- Run the E2E script and produce the ZIP for you (needs running dev server and test keys in `.env.local`).
- Create a short video using Playwright recording (optional).
