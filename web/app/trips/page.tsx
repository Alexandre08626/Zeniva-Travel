"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../src/lib/authStore";
import { useTripsStore } from "../../src/lib/tripsStore";

const GOLD = "#E6B85A";
const BLUE = "#0F6CF5";

export default function TripsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { trips, loadTrips } = useTripsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadTrips();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusColor = (status: string) => {
    if (!status || status === "planning") return BLUE;
    if (status === "confirmed" || status === "booked") return "#10B981";
    if (status === "proposal") return GOLD;
    return "rgba(255,255,255,0.3)";
  };

  const statusLabel = (status: string) => {
    if (!status || status === "planning") return "Planning";
    if (status === "confirmed") return "Confirmed ✓";
    if (status === "booked") return "Booked ✓";
    if (status === "proposal") return "Proposal Ready";
    return status;
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#030812",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      paddingBottom: "calc(88px + env(safe-area-inset-bottom))",
      paddingTop: "calc(env(safe-area-inset-top) + 56px)",
      color: "#fff",
    }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .trip-card:active { transform: scale(0.97); opacity:0.85; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "0 20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>My</div>
          <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.02em" }}>Trips & Proposals ✈️</div>
        </div>
        <button onClick={() => router.push("/chat")} style={{
          background: `linear-gradient(135deg, ${BLUE}, #0B3FAA)`,
          border: "none", borderRadius: 14, padding: "10px 16px",
          fontSize: 13, fontWeight: 800, color: "#fff", cursor: "pointer",
          boxShadow: `0 4px 16px rgba(15,108,245,0.35)`,
          WebkitTapHighlightColor: "transparent",
        }}>
          + New Trip
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "0 16px" }}>
        {!mounted || trips.length === 0 ? (
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 20, padding: "40px 24px", textAlign: "center",
            animation: "fadeUp 0.4s ease both",
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✈️</div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>No trips yet</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>
              Chat with Lina to start planning your dream trip
            </div>
            <button onClick={() => router.push("/chat")} style={{
              background: `linear-gradient(135deg, ${GOLD}, #C9941F)`,
              border: "none", borderRadius: 14, padding: "14px 28px",
              fontSize: 14, fontWeight: 800, color: "#0B1B4D", cursor: "pointer",
            }}>
              💬 Chat with Lina
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {trips.map((trip: any, i: number) => (
              <button key={trip.id || i} className="trip-card" onClick={() => router.push(`/chat/${trip.id}`)} style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 18, padding: "16px",
                cursor: "pointer", textAlign: "left", width: "100%",
                WebkitTapHighlightColor: "transparent",
                animation: `fadeUp 0.35s ease ${i * 0.06}s both`,
                transition: "transform 0.15s ease, opacity 0.15s ease",
              }}>
                {/* Status badge */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{
                    background: `${statusColor(trip.status)}20`,
                    border: `1px solid ${statusColor(trip.status)}40`,
                    borderRadius: 30, padding: "3px 10px",
                    fontSize: 10, fontWeight: 800, color: statusColor(trip.status),
                    letterSpacing: "0.04em",
                  }}>
                    {statusLabel(trip.status || "planning")}
                  </div>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
                    {trip.updated_at ? new Date(trip.updated_at).toLocaleDateString("en", { month: "short", day: "numeric" }) : ""}
                  </span>
                </div>

                {/* Destination */}
                <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>
                  {trip.destination || trip.title || "New Trip"}
                </div>
                {/* Details */}
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {trip.departure_date && <span>📅 {new Date(trip.departure_date).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</span>}
                  {trip.travelers && <span>👥 {trip.travelers} traveler{trip.travelers > 1 ? "s" : ""}</span>}
                  {trip.budget && <span>💰 ${trip.budget.toLocaleString()}</span>}
                </div>

                {/* Proposal button if ready */}
                {(trip.status === "proposal" || trip.proposal_id) && (
                  <div style={{
                    marginTop: 10, paddingTop: 10,
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: GOLD }}>📋 View Proposal →</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
