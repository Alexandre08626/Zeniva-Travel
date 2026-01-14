import React from "react";

export default function Pill({
  children,
  variant = "light",
}: React.PropsWithChildren<{ variant?: "light" | "dark" }>) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-2 text-xs font-extrabold ${
        variant === "dark" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-900"
      }`}
    >
      {children}
    </span>
  );
}
