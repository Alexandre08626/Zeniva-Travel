"use client";

import { usePathname, useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  const isRoot = pathname === "/" || pathname === "/agent";
  if (isRoot) return null;

  const handleClick = () => {
    // Go back when possible, otherwise land on home.
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="fixed left-3 top-3 z-50 flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur hover:border-slate-300"
      aria-label="Go back"
    >
      <span className="text-lg leading-none">←</span>
      <span>Back</span>
    </button>
  );
}
