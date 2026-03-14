"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "sans-serif", background: "#0B1B4D", color: "white" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Something went wrong</h2>
        <button
          onClick={() => reset()}
          style={{ padding: "0.75rem 1.5rem", background: "#3B82F6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
