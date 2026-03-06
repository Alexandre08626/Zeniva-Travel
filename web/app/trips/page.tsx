"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/lib/authStore";
import { useTripsStore } from "@/lib/store/tripsStore";

const GOLD = "#E6B85A";
const BLUE = "#0F6CF5";
const GREEN = "#10B981";

export default function TripsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { trips } = useTripsStore((s: any) => ({ trips: s.trips }));
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const statusColor = (s: string) => {
    if (!s || s === "planning" || s === "new") return BLUE;
    if (s === "confirmed" || s === "booked") return GREEN;
    if (s === "Ready" || s === "proposal") return GOLD;
    if (s === "cancelled") return "#ef4444";
    return "rgba(255,255,255,0.3)";
  };
  const statusLabel = (s: string) => {
    if (!s || s === "planning" || s === "new") return "Planning";
    if (s === "Ready") return "Proposal Ready ✨";
    if (s === "confirmed") return "Confirmed ✓";
    if (s === "booked") return "Booked ✓";
    if (s === "cancelled") return "Cancelled";
    return s;
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #040D1A 0%, #030812 100%)",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      paddingBottom: "calc(96px + env(safe-area-inset-bottom))",
      paddingTop: "calc(env(safe-area-inset-top) + 16px)",
      color: "#fff",
    }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .trip-card:active { transform: scale(0.975) !important; opacity:0.88; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "16px 20px 24px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
            MY TRIPS
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1 }}>
            ✈️ Journeys
          </div>
        </div>
        <button onClick={() => router.push("/chat")} style={{
          background: `linear-gradient(135deg, ${BLUE} 0%, #0948CC 100%)`,
          border: "none", borderRadius: 14, padding: "11px 18px",
          fontSize: 13, fontWeight: 800, color: "#fff", cursor: "pointer",
          boxShadow: "0 4px 20px rgba(15,108,245,0.4)",
          WebkitTapHighlightColor: "transparent",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ fontSize: 15 }}>+</span> New Trip
        </button>
      </div>

      {/* Stats bar */}
      {mounted && trips.length > 0 && (
        <div style={{ padding: "0 20px 20px", display: "flex", gap: 12 }}>
          {[
            { label: "Total", value: trips.length, color: BLUE },
            { label: "Active", value: trips.filter((t: any) => !t.status || t.status === "planning" || t.status === "new").length, color: GREEN },
            { label: "Proposals", value: trips.filter((t: any) => t.status === "Ready" || t.status === "proposal").length, color: GOLD },
          ].map((stat) => (
            <div key={stat.label} style={{
              flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14, padding: "10px 12px", textAlign: "center",
            }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em", textTransform: "uppercase", marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Trips list */}
      <div style={{ padding: "0 16px" }}>
        {!mounted || trips.length === 0 ? (
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px dashed rgba(255,255,255,0.1)",
            borderRadius: 24, padding: "48px 24px", textAlign: "center",
            animation: "fadeUp 0.4s ease both",
          }}>
            <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.6 }}>✈️</div>
            <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>No trips yet</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 28, lineHeight: 1.5 }}>
              Tell Lina where you want to go and she'll plan everything
            </div>
            <button onClick={() => router.push("/chat")} style={{
              background: `linear-gradient(135deg, ${GOLD}, #C9941F)`,
              border: "none", borderRadius: 16, padding: "16px 32px",
              fontSize: 15, fontWeight: 800, color: "#0B1B4D", cursor: "pointer",
              boxShadow: "0 4px 20px rgba(230,184,90,0.3)",
              WebkitTapHighlightColor: "transparent",
            }}>
              💬 Chat with Lina
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {trips.map((trip: any, i: number) => {
              const isReady = trip.status === "Ready" || trip.status === "proposal";
              return (
                <button key={trip.id || i} className="trip-card"
                  onClick={() => router.push(`/chat/${trip.id}`)}
                  style={{
                    background: isReady
                      ? "linear-gradient(135deg, rgba(230,184,90,0.08), rgba(15,108,245,0.06))"
                      : "rgba(255,255,255,0.04)",
                    border: `1px solid ${isReady ? "rgba(230,184,90,0.2)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 20, padding: "18px",
                    cursor: "pointer", textAlign: "left", width: "100%",
                    WebkitTapHighlightColor: "transparent",
                    animation: `fadeUp 0.35s ease ${i * 0.07}s both`,
                    transition: "transform 0.15s ease, opacity 0.15s ease",
                    position: "relative", overflow: "hidden",
                  }}>

                  {/* Status + date row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{
                      background: `${statusColor(trip.status)}18`,
                      border: `1px solid ${statusColor(trip.status)}35`,
                      borderRadius: 30, padding: "3px 10px",
                      fontSize: 10, fontWeight: 800,
                      color: statusColor(trip.status),
                      letterSpacing: "0.04em",
                    }}>
                      {statusLabel(trip.status || "planning")}
                    </div>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
                      {trip.updated_at ? new Date(trip.updated_at).toLocaleDateString("en", { month: "short", day: "numeric" }) :
                       trip.created_at ? new Date(trip.created_at).toLocaleDateString("en", { month: "short", day: "numeric" }) : ""}
                    </span>
                  </div>

                  {/* Destination / Title */}
                  <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 8, letterSpacing: "-0.01em" }}>
                    {trip.destination || trip.title || trip.id?.slice(0, 8) || "New Trip"}
                  </div>

                  {/* Details chips */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: isReady ? 12 : 0 }}>
                    {trip.departure_date && (
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "3px 8px" }}>
                        📅 {new Date(trip.departure_date).toLocaleDateString("en", { month: "short", day: "numeric", year: "2-digit" })}
                      </span>
                    )}
                    {trip.travelers && (
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "3px 8px" }}>
                        👥 {trip.travelers}
                      </span>
                    )}
                    {trip.budget && (
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "3px 8px" }}>
                        💰 ${Number(trip.budget).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Proposal CTA */}
                  {isReady && (
                    <div style={{
                      borderTop: "1px solid rgba(230,184,90,0.15)",
                      paddingTop: 10,
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: GOLD }}>📋 View Proposal</span>
                      <span style={{ fontSize: 14, color: GOLD }}>→</span>
                    </div>
                  )}
                  {!isReady && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>Continue planning →</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
