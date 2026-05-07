"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NoAgentFallback from "./NoAgentFallback.client";
import { getHandoffDict, type HandoffLocale } from "./handoffDict";

const GRAD_TEAL = "#0EA5A4";
const GRAD_VIOLET = "#7C3AED";
const GRAD_MAGENTA = "#EC4899";

interface AvailabilitySnapshot {
  available_agents: number;
  pending_requests: number;
  estimated_wait_minutes: number | null;
}

export interface HumanHandoffModalProps {
  locale: HandoffLocale;
  cartSnapshot: Record<string, unknown>;
  clientName?: string;
  clientEmail?: string;
  clientId?: string;
  sourcePage?: string;
  onClose: () => void;
}

type Mode = "choice" | "no_agent" | "submitting";

export default function HumanHandoffModal({
  locale,
  cartSnapshot,
  clientName,
  clientEmail,
  clientId,
  sourcePage,
  onClose,
}: HumanHandoffModalProps) {
  const router = useRouter();
  const dict = getHandoffDict(locale);
  const [availability, setAvailability] = useState<AvailabilitySnapshot | null>(null);
  const [mode, setMode] = useState<Mode>("choice");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/handoff/availability", { cache: "no-store" });
        const json = await res.json();
        if (alive && json?.ok) {
          setAvailability({
            available_agents: json.available_agents || 0,
            pending_requests: json.pending_requests || 0,
            estimated_wait_minutes: json.estimated_wait_minutes ?? null,
          });
        }
      } catch {
        if (alive) setAvailability({ available_agents: 0, pending_requests: 0, estimated_wait_minutes: null });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // ESC + body scroll lock.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mode === "choice") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [mode, onClose]);

  async function pickContactMethod(method: "chat" | "call") {
    if (availability && availability.available_agents === 0) {
      setMode("no_agent");
      return;
    }
    setMode("submitting");
    setError(null);
    try {
      const res = await fetch("/api/handoff/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_method: method,
          cart_snapshot: cartSnapshot,
          client_name: clientName,
          client_email: clientEmail,
          client_id: clientId,
          source_page: sourcePage,
          locale,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Failed to start handoff");
      }
      if (method === "call") {
        router.push(`/call/handoff/${encodeURIComponent(json.id)}?locale=${locale}`);
      } else {
        // Existing chat experience picks up the handoff via a query param.
        router.push(`/chat?handoff=${encodeURIComponent(json.id)}&locale=${locale}`);
      }
    } catch (err: any) {
      setMode("choice");
      setError(err?.message || "Something went wrong, please retry.");
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && mode === "choice") onClose();
      }}
    >
      <div
        className="relative w-full sm:max-w-xl rounded-3xl border border-white/15 shadow-2xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${GRAD_TEAL} 0%, ${GRAD_VIOLET} 55%, ${GRAD_MAGENTA} 100%)`,
        }}
      >
        {/* Inner glass panel */}
        <div className="m-[1px] rounded-3xl bg-white/95 backdrop-blur p-6 sm:p-8">
          {mode === "choice" || mode === "submitting" ? (
            <>
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{dict.modalTitle}</h2>
                  <p className="text-slate-600 mt-1.5">{dict.modalSub}</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  disabled={mode === "submitting"}
                  className="rounded-full bg-slate-100 hover:bg-slate-200 w-9 h-9 flex items-center justify-center text-slate-600 transition disabled:opacity-50"
                >
                  ✕
                </button>
              </div>

              <AvailabilityPill availability={availability} dict={dict} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                <ChoiceCard
                  icon="🗨️"
                  title={dict.optionChat}
                  desc={dict.optionChatDesc}
                  onClick={() => pickContactMethod("chat")}
                  disabled={mode === "submitting"}
                  accent={GRAD_VIOLET}
                />
                <ChoiceCard
                  icon="📹"
                  title={dict.optionCall}
                  desc={dict.optionCallDesc}
                  onClick={() => pickContactMethod("call")}
                  disabled={mode === "submitting"}
                  accent={GRAD_MAGENTA}
                />
              </div>

              {error ? (
                <p className="mt-4 text-sm font-semibold text-red-600 text-center">{error}</p>
              ) : null}

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={mode === "submitting"}
                  className="text-sm font-bold text-slate-500 hover:text-slate-900 transition disabled:opacity-50"
                >
                  {dict.cancel}
                </button>
              </div>
            </>
          ) : (
            <NoAgentFallback
              locale={locale}
              cartSnapshot={cartSnapshot}
              defaultName={clientName}
              defaultEmail={clientEmail}
              sourcePage={sourcePage}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function AvailabilityPill({
  availability,
  dict,
}: {
  availability: AvailabilitySnapshot | null;
  dict: ReturnType<typeof getHandoffDict>;
}) {
  if (availability === null) {
    return (
      <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 inline-flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
        {dict.loadingAvailability}
      </div>
    );
  }
  const online = availability.available_agents > 0;
  return (
    <div
      className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold inline-flex items-center gap-2 ${
        online
          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
          : "bg-amber-50 border-amber-200 text-amber-800"
      }`}
    >
      <span
        className={`inline-block w-2 h-2 rounded-full ${online ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}
      />
      {online ? dict.agentsAvailable(availability.available_agents) : dict.noneAvailable}
      {online && availability.estimated_wait_minutes != null
        ? ` · ${dict.estimatedWait(availability.estimated_wait_minutes)}`
        : ""}
    </div>
  );
}

function ChoiceCard({
  icon,
  title,
  desc,
  onClick,
  disabled,
  accent,
}: {
  icon: string;
  title: string;
  desc: string;
  onClick: () => void;
  disabled?: boolean;
  accent: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group relative text-left rounded-2xl border-2 border-slate-200 hover:border-slate-300 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div
        className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full opacity-70 group-hover:opacity-100"
        style={{ background: accent }}
      />
      <div className="text-4xl mb-2">{icon}</div>
      <h3 className="text-lg font-black text-slate-900 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
    </button>
  );
}
