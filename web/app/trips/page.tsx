"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/lib/authStore";
import { useTripsStore } from "@/lib/store/tripsStore";

const GOLD = "#E6B85A";
const BLUE = "#0F6CF5";
const GREEN = "#10B981";

interface RealBooking {
  id: string;
  destination: string;
  departure_date?: string;
  return_date?: string;
  travelers?: number;
  total_price?: number;
  status: string;
  payment_status?: string;
  notes?: string;
  created_at: string;
}

export default function TripsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { trips } = useTripsStore((s: any) => ({ trips: s.trips }));
  const [mounted, setMounted] = useState(false);
  const [realBookings, setRealBookings] = useState<RealBooking[]>([]);

  // Load real bookings from Supabase
  useEffect(() => {
    if (!user?.email) return;
    fetch("/api/my-bookings")
      .then(r => r.json())
      .then(d => { if (d.bookings?.length) setRealBookings(d.bookings); })
      .catch(() => undefined);
  }, [user?.email]);

  useEffect(() => { setMounted(true); }, []);

  const statusColor = (s: string) => {
    if (!s || s === "planning" || s === "new") return BLUE;
    if (s === "confirmed" || s === "booked") return GREEN;
    if (s === "Ready" || s === "proposal") return GOLD;
    if (s === "cancelled") return "#ef4444";
    return "#94a3b8";
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
      background: "#f8fafc",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      paddingBottom: "calc(96px + env(safe-area-inset-bottom))",
      paddingTop: "calc(env(safe-area-inset-top) + 0px)",
      color: "#0B1B4D",
    }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .trip-card:active { transform: scale(0.975) !important; opacity:0.88; }
      `}</style>

      {/* White sticky header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid #e2e8f0",
        paddingTop: "calc(env(safe-area-inset-top) + 10px)",
        paddingBottom: 12,
        paddingLeft: 20, paddingRight: 20,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>MY TRIPS</div>
          <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.02em", color: "#0B1B4D" }}>✈️ Journeys</div>
        </div>
        <button onClick={() => router.push("/chat")} style={{
          background: BLUE, border: "none", borderRadius: 14, padding: "10px 16px",
          fontSize: 13, fontWeight: 800, color: "#fff", cursor: "pointer",
          boxShadow: "0 4px 16px rgba(15,108,245,0.3)",
          WebkitTapHighlightColor: "transparent",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ fontSize: 15 }}>+</span> New Trip
        </button>
      </div>

      <div style={{ padding: "20px 16px 0" }}>
        {/* Stats bar */}
        {mounted && trips.length > 0 && (
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Total", value: trips.length, color: BLUE },
              { label: "Active", value: trips.filter((t: any) => !t.status || t.status === "planning" || t.status === "new").length, color: GREEN },
              { label: "Proposals", value: trips.filter((t: any) => t.status === "Ready" || t.status === "proposal").length, color: GOLD },
            ].map((stat) => (
              <div key={stat.label} style={{
                flex: 1, background: "#fff", border: "1px solid #e2e8f0",
                borderRadius: 14, padding: "10px 12px", textAlign: "center",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.05em", textTransform: "uppercase", marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Real confirmed bookings from Supabase ── */}
        {realBookings.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>CONFIRMED BOOKINGS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {realBookings.map(b => (
                <div key={b.id} style={{
                  background: "#fff", border: "1.5px solid #d1fae5",
                  borderRadius: 20, padding: "18px 20px",
                  boxShadow: "0 2px 12px rgba(16,185,129,0.08)",
                  animation: "fadeUp 0.4s ease both",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: "#0B1B4D" }}>{b.destination || "Trip"}</div>
                    <div style={{ background: "#d1fae5", color: "#065f46", fontSize: 11, fontWeight: 800, borderRadius: 20, padding: "4px 12px" }}>
                      ✓ Confirmed
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
                    {b.departure_date ? `Depart: ${new Date(b.departure_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : "Dates TBD"}
                    {b.return_date ? ` · Return: ${new Date(b.return_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}
                    {b.travelers ? ` · ${b.travelers} traveler${b.travelers > 1 ? "s" : ""}` : ""}
                    {b.total_price ? ` · $${Number(b.total_price).toLocaleString()}` : ""}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => router.push("/documents")} style={{
                      background: `linear-gradient(135deg, ${GOLD}, #C9941F)`, border: "none", borderRadius: 12,
                      padding: "10px 16px", fontSize: 12, fontWeight: 800, color: "#0B1B4D", cursor: "pointer", flex: 1,
                    }}>📄 Documents</button>
                    <button onClick={() => router.push("/chat")} style={{
                      background: BLUE, border: "none", borderRadius: 12,
                      padding: "10px 16px", fontSize: 12, fontWeight: 800, color: "#fff", cursor: "pointer", flex: 1,
                    }}>💬 Lina</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trips list */}
        {!mounted || trips.length === 0 ? (
          <div style={{
            background: "#fff", border: "1px solid #e2e8f0",
            borderRadius: 24, padding: "48px 24px", textAlign: "center",
            animation: "fadeUp 0.4s ease both",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✈️</div>
            <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 8, color: "#0B1B4D" }}>No trips yet</div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 28, lineHeight: 1.5 }}>
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
                    background: "#fff",
                    border: `1px solid ${isReady ? "rgba(230,184,90,0.4)" : "#e2e8f0"}`,
                    borderRadius: 20, padding: "18px",
                    cursor: "pointer", textAlign: "left", width: "100%",
                    WebkitTapHighlightColor: "transparent",
                    animation: `fadeUp 0.35s ease ${i * 0.07}s both`,
                    transition: "transform 0.15s ease, opacity 0.15s ease",
                    boxShadow: isReady ? "0 4px 16px rgba(230,184,90,0.15)" : "0 2px 8px rgba(0,0,0,0.06)",
                  }}>

                  {/* Status + date row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{
                      background: `${statusColor(trip.status)}15`,
                      border: `1px solid ${statusColor(trip.status)}30`,
                      borderRadius: 30, padding: "3px 10px",
                      fontSize: 10, fontWeight: 800,
                      color: statusColor(trip.status),
                      letterSpacing: "0.04em",
                    }}>
                      {statusLabel(trip.status || "planning")}
                    </div>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>
                      {trip.updated_at ? new Date(trip.updated_at).toLocaleDateString("en", { month: "short", day: "numeric" }) :
                       trip.created_at ? new Date(trip.created_at).toLocaleDateString("en", { month: "short", day: "numeric" }) : ""}
                    </span>
                  </div>

                  {/* Destination */}
                  <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 8, letterSpacing: "-0.01em", color: "#0B1B4D" }}>
                    {trip.destination || trip.title || trip.id?.slice(0, 8) || "New Trip"}
                  </div>

                  {/* Details chips */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: isReady ? 12 : 0 }}>
                    {trip.departure_date && (
                      <span style={{ fontSize: 11, color: "#64748b", background: "#f1f5f9", borderRadius: 8, padding: "3px 8px" }}>
                        📅 {new Date(trip.departure_date).toLocaleDateString("en", { month: "short", day: "numeric", year: "2-digit" })}
                      </span>
                    )}
                    {trip.travelers && (
                      <span style={{ fontSize: 11, color: "#64748b", background: "#f1f5f9", borderRadius: 8, padding: "3px 8px" }}>
                        👥 {trip.travelers}
                      </span>
                    )}
                    {trip.budget && (
                      <span style={{ fontSize: 11, color: "#64748b", background: "#f1f5f9", borderRadius: 8, padding: "3px 8px" }}>
                        💰 ${Number(trip.budget).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Proposal CTA */}
                  {isReady && (
                    <div style={{
                      borderTop: "1px solid rgba(230,184,90,0.2)", paddingTop: 10,
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: GOLD }}>📋 View Proposal</span>
                      <span style={{ fontSize: 14, color: GOLD }}>→</span>
                    </div>
                  )}
                  {!isReady && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>Continue planning →</span>
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
