"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html>
      <body style={{ background: "#0B1B4D", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", margin: 0, fontFamily: "system-ui,sans-serif" }}>
        <div style={{ textAlign: "center", color: "white", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✈️</div>
          <h2 style={{ margin: "0 0 8px", fontWeight: 800, fontSize: 24 }}>Something went wrong</h2>
          <p style={{ margin: "0 0 24px", opacity: 0.6 }}>Our team has been notified.</p>
          <button onClick={reset} style={{ background: "#0F6CF5", color: "white", border: "none", borderRadius: 9999, padding: "12px 28px", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
