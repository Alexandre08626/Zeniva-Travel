"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface OutreachContextType {
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  chatContext: { campaignId?: string; campaignName?: string } | null;
  setChatContext: (ctx: { campaignId?: string; campaignName?: string } | null) => void;
}

const OutreachCtx = createContext<OutreachContextType>({
  chatOpen: false,
  setChatOpen: () => {},
  chatContext: null,
  setChatContext: () => {},
});

export function OutreachProvider({ children }: { children: ReactNode }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState<{ campaignId?: string; campaignName?: string } | null>(null);
  return (
    <OutreachCtx.Provider value={{ chatOpen, setChatOpen, chatContext, setChatContext }}>
      {children}
    </OutreachCtx.Provider>
  );
}

export function useOutreach() {
  return useContext(OutreachCtx);
}
