import React from "react";

export default function Label({ children }: React.PropsWithChildren) {
  return (
    <div className="text-xs font-semibold uppercase tracking-[1.5px] text-slate-400">
      {children}
    </div>
  );
}
