"use client";

import dynamic from "next/dynamic";

// These components use next/navigation hooks (usePathname, useRouter)
// They must be loaded client-side only to avoid /_global-error prerender crash
const BackButtonDynamic = dynamic(() => import("./BackButton.client"), { ssr: false });
const LinaAssistantDockDynamic = dynamic(() => import("./LinaAssistantDock"), { ssr: false });
const AppShellDynamic = dynamic(() => import("./AppShell.client"), { ssr: false });
const LinaFloatingChatDynamic = dynamic(() => import("../../components/LinaFloatingChat"), { ssr: false });

export function DynamicBackButton() { return <BackButtonDynamic />; }
export function DynamicLinaAssistantDock() { return <LinaAssistantDockDynamic />; }
export function DynamicAppShell() { return <AppShellDynamic />; }
export function DynamicLinaFloatingChat() { return <LinaFloatingChatDynamic />; }
