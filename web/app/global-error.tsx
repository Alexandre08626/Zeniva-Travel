"use client";

// This must be a "use client" component per Next.js requirements
// It must NOT use any React hooks that trigger server context
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <head>
        <title>Error — Zeniva Travel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#0B1B4D",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          color: "white",
        }}
      >
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✈️</div>
          <h1 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 800 }}>
            Something went wrong
          </h1>
          <p style={{ margin: "0 0 28px", opacity: 0.6, fontSize: 14 }}>
            Our team has been notified. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#0F6CF5",
              color: "white",
              border: "none",
              borderRadius: 9999,
              padding: "12px 32px",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
