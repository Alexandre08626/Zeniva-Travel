"use client";
import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BRAND_BLUE, LIGHT_BG, TITLE_TEXT, MUTED_TEXT, ACCENT_GOLD } from "../../../src/design/tokens";
import { useTripsStore, generateProposal, getProposal } from "../../../lib/store/tripsStore";
import Pill from "../../../src/components/Pill";

export default function ProposalPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = Array.isArray(params.tripId) ? params.tripId[0] : params.tripId;
  const { trips } = useTripsStore((s) => ({ trips: s.trips }));
  const trip = trips.find((t) => t.id === tripId);
  const proposal = useMemo(() => getProposal(tripId), [tripId, trips]);

  const ensureProposal = () => {
    const p = proposal || generateProposal(tripId);
    router.refresh();
    return p;
  };

  const p = proposal || ensureProposal();

  if (!tripId) return null;

  return (
    <main className="min-h-screen" style={{ backgroundColor: LIGHT_BG }}>
      <div className="mx-auto max-w-6xl px-5 py-6 space-y-5">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/chat/${tripId}`} className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              ← Back to chat
            </Link>
            <Pill>Proposal for {trip?.title || "Trip"}</Pill>
          </div>
          <div className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>
            {p?.updatedAt ? `Updated ${new Date(p.updatedAt).toLocaleString()}` : "Draft"}
          </div>
        </header>

        <div className="overflow-hidden rounded-3xl bg-white shadow-lg border border-slate-100">
          <div className="relative h-64 w-full">
            <Image
              src={p?.images?.[0] || "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1400&q=80"}
              alt="Hero"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/10" />
            <div className="absolute bottom-6 left-6 text-white">
              <div className="text-sm font-semibold">{trip?.title || "Trip"}</div>
              <div className="text-3xl font-extrabold">{p?.title || "Proposal"}</div>
            </div>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4">
              {p?.sections?.map((section) => (
                <div key={section.title} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-extrabold" style={{ color: TITLE_TEXT }}>
                      {section.title}
                    </div>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold" style={{ color: ACCENT_GOLD }}>
                      Curated
                    </span>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm" style={{ color: MUTED_TEXT }}>
                    {section.items?.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full" style={{ backgroundColor: BRAND_BLUE }} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold" style={{ color: MUTED_TEXT }}>
                  Estimate
                </div>
                <div className="text-2xl font-extrabold" style={{ color: TITLE_TEXT }}>
                  {p?.priceEstimate || "On request"}
                </div>
                <div className="mt-2 text-xs" style={{ color: MUTED_TEXT }}>
                  Includes flights, stays, and curated experiences. Final pricing on confirmation.
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm space-y-3">
                <div className="text-sm font-semibold" style={{ color: MUTED_TEXT }}>
                  Actions
                </div>
                <button
                  onClick={() => router.push(`/chat/${tripId}`)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"
                  style={{ color: TITLE_TEXT }}
                >
                  Edit in Chat
                </button>
                <button
                  onClick={() => router.push("/call")}
                  className="w-full rounded-xl px-3 py-2 text-sm font-extrabold text-white"
                  style={{ backgroundColor: BRAND_BLUE }}
                >
                  Send to agent
                </button>
              </div>
            </aside>
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-sm" style={{ color: MUTED_TEXT }}>
            Notes: {p?.notes || "Draft generated from conversation."}
          </div>
        </div>
      </div>
    </main>
  );
}
