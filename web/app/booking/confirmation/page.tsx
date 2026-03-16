export const dynamic = "force-dynamic";

const BLUE = "#0F6CF5";
const NAVY = "#0B1B4D";
const GOLD = "#E6B85A";
const GREEN = "#10B981";

export default function BookingConfirmationPage({
  searchParams,
}: {
  searchParams: { ref?: string; trip?: string; total?: string; payment?: string };
}) {
  const bookingRef = searchParams.ref || "ZNV-CONFIRMED";
  const tripName = searchParams.trip || "Your Trip";
  const total = searchParams.total || "";
  const paymentStatus = searchParams.payment || "completed";

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, #020810 0%, ${NAVY} 60%, #0F1E5A 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif", padding: 20 }}>
      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 48, maxWidth: 520, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>✈️</div>
        <div style={{ background: `${paymentStatus === "failed" ? "#ef444422" : GOLD + "22"}`, border: `1px solid ${paymentStatus === "failed" ? "#ef444444" : GOLD + "44"}`, borderRadius: 12, padding: "10px 20px", display: "inline-block", marginBottom: 24 }}>
          <span style={{ color: paymentStatus === "failed" ? "#ef4444" : GOLD, fontWeight: 700, fontSize: 13 }}>
            {paymentStatus === "failed" ? "❌ Payment Issue" : "✅ Booking Confirmed"}
          </span>
        </div>
        <h1 style={{ color: "white", fontSize: 28, fontWeight: 800, margin: "0 0 8px" }}>
          {paymentStatus === "failed" ? "Payment Not Completed" : "You're all set!"}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", margin: "0 0 32px", fontSize: 15 }}>{decodeURIComponent(tripName)}</p>
        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 24, marginBottom: 24, textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Booking Reference</span>
            <span style={{ color: GOLD, fontWeight: 800, fontFamily: "monospace" }}>{bookingRef}</span>
          </div>
          {total && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Total</span>
              <span style={{ color: "white", fontWeight: 700 }}>{total.startsWith("$") ? total : `$${total}`}</span>
            </div>
          )}
        </div>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 24 }}>
          {paymentStatus === "failed"
            ? "Please contact info@zeniva.ca or try a different payment method."
            : "A confirmation email will be sent within 24 hours. Our team will finalize your travel details."}
        </p>
        <a href="/" style={{ display: "block", background: `linear-gradient(135deg, ${BLUE}, ${NAVY})`, color: "white", textDecoration: "none", borderRadius: 9999, padding: "14px 32px", fontWeight: 800, fontSize: 15 }}>
          ✈️ Back to Zeniva Travel
        </a>
      </div>
    </div>
  );
}
