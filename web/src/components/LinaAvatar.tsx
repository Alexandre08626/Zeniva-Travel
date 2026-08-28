"use client";
// Lina AI avatar — bouton rond avec photo/icône Lina.
interface LinaAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
}

export default function LinaAvatar({ size = "md", style, className, onClick }: LinaAvatarProps) {
  const px =
    size === "xl" ? 72 : size === "lg" ? 56 : size === "md" ? 40 : 28;
  const radius = px / 2;
  return (
    <button
      type="button"
      aria-label="Lina AI"
      onClick={onClick}
      className={className}
      style={{
        width: px,
        height: px,
        borderRadius: radius,
        overflow: "hidden",
        border: "2px solid rgba(15,108,245,0.35)",
        boxShadow: "0 4px 16px rgba(11,27,77,0.25)",
        background: "linear-gradient(135deg,#0F6CF5,#0B1B4D)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "none",
        cursor: onClick ? "pointer" : "default",
        padding: 0,
        ...style,
      }}
    >
      <img
        src="/agents/lina.png"
        alt="Lina"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        onError={(e) => {
          const t = e.currentTarget;
          t.style.display = "none";
        }}
      />
    </button>
  );
}
