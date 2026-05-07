"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCallRoom } from "../../../../src/lib/call/useCallRoom";
import { getSupabaseClient } from "../../../../src/lib/supabase/client";
import PreCallScreen from "../../../../components/handoff/PreCallScreen.client";
import { CallControls, QualityBars, StatusBadge } from "../../../../components/handoff/CallControls.client";
import CartSidebar, { projectCartSnapshot } from "../../../../components/handoff/CartSidebar.client";
import { getHandoffDict, type HandoffLocale } from "../../../../components/handoff/handoffDict";

interface HandoffRow {
  id: string;
  status: string;
  cart_snapshot: Record<string, unknown> | null;
  contact_method: string;
  payment_link_url: string | null;
  locale: string;
}

export default function ClientCallPage() {
  const params = useParams<{ requestId: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const requestId = params?.requestId as string;
  const localeQuery = search?.get("locale");
  const locale: HandoffLocale = localeQuery === "fr" ? "fr" : "en";
  const dict = getHandoffDict(locale);

  const [phase, setPhase] = useState<"pre" | "in" | "post">("pre");
  const [request, setRequest] = useState<HandoffRow | null>(null);
  const [requestErr, setRequestErr] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const startedAtRef = useRef<number | null>(null);

  const room = useCallRoom(requestId, "client");
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // Load handoff row + subscribe to its updates (for payment_link_url).
  useEffect(() => {
    let alive = true;
    const supabase = getSupabaseClient();

    (async () => {
      const { data, error } = await supabase
        .from("human_handoff_requests")
        .select("id, status, cart_snapshot, contact_method, payment_link_url, locale")
        .eq("id", requestId)
        .maybeSingle();
      if (!alive) return;
      if (error) setRequestErr(error.message);
      if (data) setRequest(data as HandoffRow);
    })();

    const channel = supabase
      .channel(`handoff:${requestId}`)
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

  // Wire local + remote streams to <video> elements.
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

  // Tick the call duration once connected.
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

  // Auto-transition to post-call when ended OR when the agent has stamped a payment link + completed.
  useEffect(() => {
    if (room.state === "ended" || room.state === "failed") {
      setPhase("post");
    }
  }, [room.state]);
  useEffect(() => {
    if (request && (request.status === "completed" || request.status === "abandoned") && phase === "in") {
      setPhase("post");
    }
  }, [request, phase]);

  const cartProjection = useMemo(() => projectCartSnapshot(request?.cart_snapshot), [request?.cart_snapshot]);

  async function joinFromPreCall(opts: { video: boolean; cameraDeviceId?: string; microphoneDeviceId?: string }) {
    setPhase("in");
    try {
      await room.join(opts);
    } catch {
      setPhase("pre");
    }
  }

  async function hangUp() {
    await room.leave("client");
    setPhase("post");
  }

  if (phase === "pre") {
    return (
      <PreCallScreen
        locale={locale}
        title={dict.preCallTitle}
        subtitle={dict.preCallSub}
        rightPanel={
          requestErr ? (
            <p className="text-rose-300">{requestErr}</p>
          ) : (
            <CartSidebar items={cartProjection.items} totalAmount={cartProjection.totalAmount} totalLabel={cartProjection.totalLabel} />
          )
        }
        onJoin={joinFromPreCall}
      />
    );
  }

  if (phase === "in") {
    return (
      <main className="fixed inset-0 bg-slate-950 text-white">
        {/* Remote video full screen */}
        <video ref={remoteVideoRef} playsInline autoPlay className="absolute inset-0 w-full h-full object-cover bg-slate-900" />
        {room.state !== "connected" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-5xl mb-3">⏳</div>
              <p className="text-white/80 font-bold">{dict.inCallStatus.connecting}</p>
            </div>
          </div>
        ) : null}

        {/* Local PIP */}
        <div className="absolute top-4 right-4 w-32 h-44 sm:w-40 sm:h-56 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-slate-900">
          <video ref={localVideoRef} playsInline autoPlay muted className={`w-full h-full object-cover ${room.cameraEnabled ? "" : "opacity-0"}`} />
          {!room.cameraEnabled ? (
            <div className="absolute inset-0 flex items-center justify-center text-3xl bg-slate-900">📵</div>
          ) : null}
        </div>

        {/* Status + quality + cart sidebar (collapsible on mobile) */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <StatusBadge state={room.state} locale={locale} durationSec={callDuration} />
          <div className="rounded-full bg-black/40 backdrop-blur border border-white/15 px-3 py-1.5">
            <QualityBars quality={room.quality} />
          </div>
        </div>

        <aside className="hidden lg:block absolute right-4 bottom-28 top-56 w-80 overflow-y-auto">
          <CartSidebar items={cartProjection.items} totalAmount={cartProjection.totalAmount} totalLabel={cartProjection.totalLabel} variant="light" />
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

        {room.error ? (
          <div className="absolute bottom-32 inset-x-0 text-center px-6">
            <p className="inline-block bg-rose-600/90 text-white text-sm font-semibold rounded-full px-4 py-2">{room.error}</p>
          </div>
        ) : null}
      </main>
    );
  }

  // post-call
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
        <div className="text-6xl mb-4">🙏</div>
        <h1 className="text-3xl font-black mb-3">{dict.postCallTitle}</h1>
        <p className="text-white/70 mb-8">{dict.postCallDesc}</p>

        {request?.payment_link_url ? (
          <Link
            href={request.payment_link_url}
            className="block rounded-2xl px-6 py-4 text-lg font-black text-slate-900 mb-4 transition hover:scale-[1.01]"
            style={{ background: "linear-gradient(135deg, #E6B85A, #C9941F)" }}
          >
            💳 {dict.goToPayment}
          </Link>
        ) : (
          <p className="text-amber-300 text-sm mb-4">⏳ {dict.inCallStatus.connecting}</p>
        )}

        <button
          type="button"
          onClick={() => {
            setPhase("pre");
            startedAtRef.current = null;
            setCallDuration(0);
            router.refresh();
          }}
          className="text-sm text-white/60 hover:text-white underline"
        >
          {dict.resumeCall}
        </button>
      </div>
    </main>
  );
}
