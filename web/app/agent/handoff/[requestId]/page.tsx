"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallRoom } from "../../../../src/lib/call/useCallRoom";
import { getSupabaseClient } from "../../../../src/lib/supabase/client";
import PreCallScreen from "../../../../components/handoff/PreCallScreen.client";
import { CallControls, QualityBars, StatusBadge } from "../../../../components/handoff/CallControls.client";
import CartSidebar, { projectCartSnapshot } from "../../../../components/handoff/CartSidebar.client";
import { getHandoffDict, type HandoffLocale } from "../../../../components/handoff/handoffDict";
import { useAuthStore } from "../../../../src/lib/authStore";

interface HandoffRow {
  id: string;
  status: string;
  cart_snapshot: Record<string, unknown> | null;
  contact_method: string;
  payment_link_url: string | null;
  client_email: string | null;
  client_name: string | null;
  client_id: string | null;
  locale: string;
}

export default function AgentCallPage() {
  const params = useParams<{ requestId: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const requestId = params?.requestId as string;
  const localeQuery = search?.get("locale");
  const locale: HandoffLocale = localeQuery === "fr" ? "fr" : "en";
  const dict = getHandoffDict(locale);
  const authUser = useAuthStore((s) => s.user);
  const agentId = authUser?.email || "agent-anon";

  const [phase, setPhase] = useState<"pre" | "in" | "post">("pre");
  const [request, setRequest] = useState<HandoffRow | null>(null);
  const [requestErr, setRequestErr] = useState<string | null>(null);
  const [claimErr, setClaimErr] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentCurrency, setPaymentCurrency] = useState("USD");
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [generationErr, setGenerationErr] = useState<string | null>(null);
  const startedAtRef = useRef<number | null>(null);

  const room = useCallRoom(requestId, "agent");
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // Load + subscribe to handoff row.
  useEffect(() => {
    let alive = true;
    const supabase = getSupabaseClient();
    (async () => {
      const { data, error } = await supabase
        .from("human_handoff_requests")
        .select("id, status, cart_snapshot, contact_method, payment_link_url, client_email, client_name, client_id, locale")
        .eq("id", requestId)
        .maybeSingle();
      if (!alive) return;
      if (error) setRequestErr(error.message);
      if (data) setRequest(data as HandoffRow);
    })();
    const channel = supabase
      .channel(`handoff:agent:${requestId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "human_handoff_requests", filter: `id=eq.${requestId}` },
        (payload) => {
          if (alive) setRequest(payload.new as HandoffRow);
        }
      )
      .subscribe();
    return () => {
      alive = false;
      supabase.removeChannel(channel);
    };
  }, [requestId]);

  useEffect(() => {
    if (localVideoRef.current && room.localStream) {
      localVideoRef.current.srcObject = room.localStream;
      localVideoRef.current.play().catch(() => undefined);
    }
  }, [room.localStream]);
  useEffect(() => {
    if (remoteVideoRef.current && room.remoteStream) {
      remoteVideoRef.current.srcObject = room.remoteStream;
      remoteVideoRef.current.play().catch(() => undefined);
    }
  }, [room.remoteStream]);

  useEffect(() => {
    if (room.state !== "connected") return;
    if (startedAtRef.current == null) startedAtRef.current = Date.now();
    const id = setInterval(() => {
      if (startedAtRef.current != null) {
        setCallDuration(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [room.state]);

  const cartProjection = useMemo(() => projectCartSnapshot(request?.cart_snapshot), [request?.cart_snapshot]);

  // Pre-fill payment amount from cart total once we have it.
  useEffect(() => {
    if (paymentAmount === "" && cartProjection.totalAmount) {
      const numeric = cartProjection.totalAmount.replace(/[^\d.]/g, "");
      if (numeric) setPaymentAmount(numeric);
    }
  }, [cartProjection.totalAmount, paymentAmount]);

  async function acceptAndJoin(opts: { video: boolean; cameraDeviceId?: string; microphoneDeviceId?: string }) {
    setClaimErr(null);
    if (request?.status === "pending") {
      try {
        const res = await fetch("/api/handoff/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ request_id: requestId, agent_id: agentId }),
        });
        const json = await res.json();
        if (!res.ok || !json?.ok) throw new Error(json?.error || "Claim failed");
      } catch (err: any) {
        setClaimErr(err?.message || "Failed to claim request");
        return;
      }
    }
    setPhase("in");
    try {
      await room.join(opts);
    } catch {
      setPhase("pre");
    }
  }

  async function generatePaymentLink() {
    setPaymentBusy(true);
    setGenerationErr(null);
    try {
      const amt = parseFloat(paymentAmount.replace(/[^\d.]/g, ""));
      if (!Number.isFinite(amt) || amt <= 0) throw new Error("Invalid amount");
      const res = await fetch("/api/zenipay/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amt,
          currency: paymentCurrency,
          description: `Zeniva Travel · handoff ${requestId}`,
          customer_id: request?.client_id || undefined,
          customerEmail: request?.client_email || undefined,
          customerName: request?.client_name || undefined,
          booking_id: requestId,
        }),
      });
      const json = await res.json();
      const url = json?.checkout_url;
      if (!res.ok || !url) throw new Error(json?.error || "ZeniPay link generation failed");
      setGeneratedLink(url);
      // Stamp it on the handoff row so the client room picks it up.
      await fetch("/api/handoff/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: requestId, payment_link_url: url, outcome: "completed" }),
      });
    } catch (err: any) {
      setGenerationErr(err?.message || "Failed to generate link");
    } finally {
      setPaymentBusy(false);
    }
  }

  async function hangUp() {
    await room.leave("agent");
    if (request && request.status !== "completed" && request.status !== "abandoned") {
      try {
        await fetch("/api/handoff/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            request_id: requestId,
            payment_link_url: generatedLink || request.payment_link_url || null,
            outcome: generatedLink || request.payment_link_url ? "completed" : "abandoned",
          }),
        });
      } catch {}
    }
    setPhase("post");
  }

  if (phase === "pre") {
    return (
      <PreCallScreen
        locale={locale}
        title={request?.client_name ? `${dict.preCallTitle} — ${request.client_name}` : dict.preCallTitle}
        subtitle={
          request?.client_email
            ? `${request.client_email} · ${dict.preCallSub}`
            : dict.preCallSub
        }
        joinLabel={request?.contact_method === "call" ? "Accept call" : "Accept request"}
        joinDisabled={!request}
        rightPanel={
          <div>
            <CartSidebar
              title="Client cart"
              items={cartProjection.items}
              totalAmount={cartProjection.totalAmount}
              totalLabel={cartProjection.totalLabel}
            />
            {requestErr ? <p className="mt-3 text-rose-300 text-sm">{requestErr}</p> : null}
            {claimErr ? <p className="mt-3 text-rose-300 text-sm">{claimErr}</p> : null}
          </div>
        }
        onJoin={acceptAndJoin}
      />
    );
  }

  if (phase === "in") {
    return (
      <main className="fixed inset-0 bg-slate-950 text-white">
        <video ref={remoteVideoRef} playsInline autoPlay className="absolute inset-0 w-full h-full object-cover bg-slate-900" />
        {room.state !== "connected" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-5xl mb-3">⏳</div>
              <p className="text-white/80 font-bold">{dict.inCallStatus.connecting}</p>
            </div>
          </div>
        ) : null}

        <div className="absolute top-4 right-4 w-32 h-44 sm:w-40 sm:h-56 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-slate-900">
          <video ref={localVideoRef} playsInline autoPlay muted className={`w-full h-full object-cover ${room.cameraEnabled ? "" : "opacity-0"}`} />
          {!room.cameraEnabled ? <div className="absolute inset-0 flex items-center justify-center text-3xl bg-slate-900">📵</div> : null}
        </div>

        <div className="absolute top-4 left-4 flex items-center gap-2">
          <StatusBadge state={room.state} locale={locale} durationSec={callDuration} />
          <div className="rounded-full bg-black/40 backdrop-blur border border-white/15 px-3 py-1.5">
            <QualityBars quality={room.quality} />
          </div>
        </div>

        {/* Agent panel: cart + generate-link control */}
        <aside className="hidden lg:block absolute right-4 bottom-28 top-56 w-96 overflow-y-auto space-y-3">
          <CartSidebar
            title="Client cart"
            items={cartProjection.items}
            totalAmount={cartProjection.totalAmount}
            totalLabel={cartProjection.totalLabel}
            variant="light"
          />

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-white/60">Generate ZeniPay link</div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Amount"
                className="col-span-2 rounded-lg bg-white/10 border border-white/15 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
              />
              <select
                value={paymentCurrency}
                onChange={(e) => setPaymentCurrency(e.target.value)}
                className="rounded-lg bg-white/10 border border-white/15 px-2 py-2 text-sm text-white outline-none"
              >
                {["USD", "CAD", "EUR", "GBP"].map((c) => (
                  <option key={c} value={c} style={{ color: "#0B1B4D" }}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={generatePaymentLink}
              disabled={paymentBusy || !paymentAmount}
              className="w-full rounded-xl px-4 py-2.5 text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {paymentBusy ? "Generating…" : "💳 Send payment link"}
            </button>
            {generatedLink ? (
              <div className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 p-2 text-xs">
                <div className="font-bold text-emerald-300 mb-1">Link sent to client ✓</div>
                <a href={generatedLink} target="_blank" rel="noreferrer" className="text-emerald-200 underline break-all">
                  {generatedLink}
                </a>
              </div>
            ) : null}
            {generationErr ? <div className="text-xs text-rose-300">{generationErr}</div> : null}
          </div>
        </aside>

        <div className="absolute bottom-6 inset-x-0 px-6">
          <CallControls
            cameraEnabled={room.cameraEnabled}
            microphoneEnabled={room.microphoneEnabled}
            onToggleCamera={room.toggleCamera}
            onToggleMicrophone={room.toggleMicrophone}
            onHangUp={hangUp}
            locale={locale}
          />
        </div>
      </main>
    );
  }

  // post-call
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-black mb-3">Call ended</h1>
        <p className="text-white/70 mb-6">
          {generatedLink || request?.payment_link_url
            ? "Payment link delivered to the client. The handoff is marked complete."
            : "No payment link was generated — request marked abandoned."}
        </p>
        <button
          type="button"
          onClick={() => router.push("/agent")}
          className="rounded-2xl bg-white/10 border border-white/20 px-6 py-3 font-bold hover:bg-white/15"
        >
          Back to dashboard
        </button>
      </div>
    </main>
  );
}
