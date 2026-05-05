"use client";

export default function PrintPitchButton({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const styles =
    tone === "dark"
      ? {
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.25)",
          color: "white",
        }
      : {
          background: "white",
          border: "1px solid #CBD5E1",
          color: "#0B1228",
        };

  return (
    <button
      type="button"
      onClick={handlePrint}
      aria-label="Download this pitch as PDF"
      className="pitch-print-btn"
      style={{
        appearance: "none",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 16px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        transition: "transform 120ms ease, opacity 120ms ease",
        ...styles,
      }}
    >
      <span aria-hidden style={{ fontSize: 14, lineHeight: 1 }}>
        ⬇
      </span>
      Download PDF
    </button>
  );
}
