// Server component — force-dynamic prevents static prerender (/_global-error workUnitAsyncStorage fix)
export const dynamic = "force-dynamic";

export default function GlobalError() {
  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif", padding: "2rem", textAlign: "center" }}>
        <h2>Something went wrong</h2>
        <p>An unexpected error occurred.</p>
        <a href="/" style={{ color: "#0F6CF5" }}>← Go home</a>
      </body>
    </html>
  );
}
