# Human handoff (chat / video-audio call)

Drop-in components + APIs for the &ldquo;Confirm with a human agent&rdquo; flow on
recap / confirmation pages.

## What lives here

| File                                | Purpose                                                               |
| ----------------------------------- | --------------------------------------------------------------------- |
| `HumanHandoffButton.client.tsx`     | The button you place next to your existing &ldquo;Pay&rdquo; CTA.      |
| `HumanHandoffModal.client.tsx`      | Choice modal (chat / call) shown after the button is clicked.          |
| `NoAgentFallback.client.tsx`        | Lead-capture form shown when no agent is online.                       |
| `PreCallScreen.client.tsx`          | Cam / mic preview + device pickers used by both the client + agent.    |
| `CallControls.client.tsx`           | Mute / hangup buttons, status badge, quality bars (3-bar indicator).   |
| `CartSidebar.client.tsx`            | Read-only cart projection (in-call sidebar + pre-call right panel).    |
| `AgentAvailabilityToggle.client.tsx`| Status toggle for the agent dashboard header (Available/Paused/Off).  |
| `AgentHandoffInbox.client.tsx`      | Realtime list of pending requests with sound-on-arrival.              |
| `handoffDict.ts`                    | EN / FR copy.                                                         |

The call engine itself lives under `web/src/lib/call/`:

- `types.ts` — the `CallProvider` interface (the swappable surface).
- `WebRTCCallProvider.ts` — native WebRTC + Google STUN, no TURN, P2P.
- `SupabaseSignaling.ts` — Supabase Realtime broadcast channel for SDP / ICE.
- `useCallRoom.ts` — React hook wrapping the provider.

## How to wire it onto a confirmation page

```tsx
import HumanHandoffButton from "@/components/handoff/HumanHandoffButton.client";

<HumanHandoffButton
  cartSnapshot={{
    total: 4280,
    currency: "USD",
    items: [
      { label: "Flight JFK ↔ CDG", detail: "2 travelers", amount: 2980, currency: "USD" },
      { label: "Hotel · Le Marais 4★", detail: "Mar 15 → Mar 22", amount: 1100, currency: "USD" },
    ],
  }}
  clientName={booking.customerName}
  clientEmail={booking.customerEmail}
  clientId={booking.customerId}
  sourcePage="/proposals/123/review"
  locale={locale === "fr" ? "fr" : "en"}
/>
```

Place it next to the existing &ldquo;Pay&rdquo; button using a flex row. Both should
have the same visual weight (the button's `variant="primary"` default
matches the gold gradient used by the rest of the site).

## How to wire the agent side

In the agent dashboard header:

```tsx
import AgentAvailabilityToggle from "@/components/handoff/AgentAvailabilityToggle.client";

<AgentAvailabilityToggle />
```

In the agent inbox / dashboard body:

```tsx
import AgentHandoffInbox from "@/components/handoff/AgentHandoffInbox.client";

<AgentHandoffInbox />
```

The inbox subscribes to Supabase Realtime; agents just need this widget on
screen for incoming requests to land + ping. Click an entry to open the
acceptance + call screen at `/agent/handoff/[requestId]`.

## Swap path to LiveKit / Daily.co / Twilio

Implement the `CallProvider` interface (see `web/src/lib/call/types.ts`) in a
new file under `web/src/lib/call/` and switch the import in
`useCallRoom.ts`. Nothing else in the UI layer needs to change.

## What's deliberately V1-only

- **No TURN** — symmetric NATs will fail to connect. Acceptable for V1.
- **Read-only cart** during the call — agent generates a payment link from
  the existing total; cart-editor comes in V2.
- **No-agent email** is best-effort via SMTP env vars
  (`SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM`); if not configured,
  the lead is still saved to `human_handoff_requests` with status
  `no_agent` for manual follow-up.
- **iOS Safari** permissions edge cases are not yet polished — needs
  real-device testing.

Validate the flow end-to-end at `/handoff-demo` before wiring the button
onto the live confirmation page.
