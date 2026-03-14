export const dynamic = "force-dynamic";
"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

const GOLD = "#E6B85A";
const BLUE = "#0F6CF5";
const NAVY = "#0B1B4D";

function ConfirmationContent() {
  const params = useSearchParams();
  const router = useRouter();
  const bookingRef = params?.get("ref") || `ZNV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const tripName = params?.get("trip") || "Your Trip";
  const total = params?.get("total") || "";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020810 0%, #0B1B4D 60%, #0F1E5A 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Orbs */}
      <div style={{ position: "absolute", top: "15%", left: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(15,108,245,0.15) 0%, transparent 70%)", filter: "blur(50px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "15%", right: "10%", width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)", filter: "blur(50px)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 500, position: "relative", zIndex: 1, textAlign: "center" }}>
        {/* Success icon */}
        <div style={{
          width: 100, height: 100, borderRadius: "50%",
          background: "rgba(16,185,129,0.15)",
          border: "2px solid rgba(16,185,129,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
          fontSize: 48,
          animation: "pulse 2s infinite",
        }}>
          ✅
        </div>

        <div style={{ fontSize: 32, fontWeight: 800, color: "#fff", marginBottom: 8, letterSpacing: "-0.02em" }}>
          Booking Confirmed!
        </div>
        <div style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", marginBottom: 32 }}>
          Your trip has been successfully booked. Lina will follow up shortly.
        </div>

        {/* Booking card */}
        <div style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 24,
          padding: "28px 24px",
          marginBottom: 24,
          backdropFilter: "blur(20px)",
        }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Booking Reference</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: GOLD, letterSpacing: "0.08em", marginBottom: 20, fontFamily: "monospace" }}>{bookingRef}</div>

          {tripName && (
            <div style={{ marginBottom: 12, padding: "12px 16px", background: "rgba(255,255,255,0.04)", borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Trip</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>{tripName}</div>
            </div>
          )}

          {total && (
            <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.04)", borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Total Paid</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: GOLD }}>{total}</div>
            </div>
          )}
        </div>

        {/* What happens next */}
        <div style={{
          background: "rgba(15,108,245,0.1)",
          border: "1px solid rgba(15,108,245,0.2)",
          borderRadius: 16,
          padding: "20px",
          marginBottom: 24,
          textAlign: "left",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: BLUE, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>What happens next</div>
          {[
            { icon: "📧", text: "Confirmation email sent to your inbox" },
            { icon: "📞", text: "Lina will call you within 24 hours" },
            { icon: "📋", text: "Full itinerary will be shared via email" },
            { icon: "💳", text: "Receipt available in your account" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: i < 3 ? 10 : 0 }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
          <button
            onClick={() => router.push("/chat")}
            style={{
              width: "100%", padding: "16px",
              background: `linear-gradient(135deg, ${NAVY}, ${BLUE})`,
              border: "none", borderRadius: 14,
              color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer",
            }}
          >
            💬 Chat with Lina
          </button>
          <button
            onClick={() => router.push("/proposals")}
            style={{
              width: "100%", padding: "16px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 14,
              color: "rgba(255,255,255,0.8)", fontSize: 16, fontWeight: 600, cursor: "pointer",
            }}
          >
            My Trips & Proposals
          </button>
        </div>

        <div style={{ marginTop: 24, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
          Questions? Contact us at info@zeniva.ca ✈️
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #020810, #0B1B4D)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#fff", fontSize: 18 }}>Loading...</div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
