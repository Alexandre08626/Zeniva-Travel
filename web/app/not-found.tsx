export const dynamic = "force-static";

export default function NotFound() {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui,sans-serif", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✈️</div>
          <h1 style={{ fontWeight: 800, fontSize: 28, color: "#0B1B4D", margin: "0 0 8px" }}>404 — Page Not Found</h1>
          <p style={{ color: "#64748b", marginBottom: 24 }}>This page doesn&apos;t exist or has been moved.</p>
          <a href="/" style={{ background: "#0F6CF5", color: "white", textDecoration: "none", borderRadius: 9999, padding: "12px 28px", fontWeight: 700 }}>
            ← Back to Zeniva Travel
          </a>
        </div>
      </body>
    </html>
  );
}
