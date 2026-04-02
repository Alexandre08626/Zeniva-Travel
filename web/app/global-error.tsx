"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#F7F9FC", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0B1228", marginBottom: "0.5rem" }}>
            Une erreur est survenue
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#6B7280", marginBottom: "1.5rem" }}>
            Veuillez rafraichir la page ou reessayer.
          </p>
          <button
            onClick={() => reset()}
            style={{ padding: "0.625rem 1.5rem", background: "#0F6CF5", color: "#fff", border: "none", borderRadius: "0.5rem", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}
          >
            Reessayer
          </button>
        </div>
      </body>
    </html>
  );
}
