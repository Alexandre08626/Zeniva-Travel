"use client";
export const dynamic = "force-dynamic";

export default function GlobalError({ reset }: { reset?: () => void }) {
  return (
    <div style={{ padding: "2rem", textAlign: "center", fontFamily: "sans-serif" }}>
      <h2>Something went wrong</h2>
      <p>An unexpected error occurred.</p>
      {reset && (
        <button onClick={reset} style={{ marginTop: "1rem", padding: "0.5rem 1.5rem" }}>
          Try again
        </button>
      )}
      <div style={{ marginTop: "1rem" }}>
        <a href="/" style={{ color: "#0F6CF5" }}>Go home</a>
      </div>
    </div>
  );
}
