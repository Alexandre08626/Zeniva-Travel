"use client";
import { useEffect, useState } from "react";
import { useAuthStore, isAgent } from "../lib/authStore";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

async function doSubscribe(userEmail: string | null) {
  try {
    const reg = await navigator.serviceWorker.ready;
    // Check if already subscribed with valid endpoint
    const existing = await reg.pushManager.getSubscription();
    if (existing) {
      // Always re-register to keep user_email fresh in DB
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: existing.toJSON(), userEmail }),
      });
      return "renewed";
    }
    // Subscribe fresh
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
    });
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: sub.toJSON(), userEmail }),
    });
    return "new";
  } catch (e) {
    console.error("Push subscribe failed:", e);
    return "error";
  }
}

export default function PushNotifManager() {
  const user = useAuthStore((s) => s.user);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"idle" | "granted" | "denied" | "unsupported">("idle");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setStatus("unsupported"); return;
    }

    const perm = Notification.permission;

    if (perm === "granted") {
      // Auto-renew subscription silently — works in both PWA and browser
      const email = user?.email || null;
      doSubscribe(email).then(() => setStatus("granted"));
      return;
    }

    if (perm === "denied") {
      setStatus("denied"); return;
    }

    // Not yet asked — show prompt after 3s (only once)
    const seen = localStorage.getItem("zeniva_push_prompted");
    if (seen) return;
    setTimeout(() => setVisible(true), 3000);
  }, [mounted, user?.email]);

  const handleAllow = async () => {
    setVisible(false);
    localStorage.setItem("zeniva_push_prompted", "1");
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      await doSubscribe(user?.email || null);
      setStatus("granted");
    } else {
      setStatus("denied");
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem("zeniva_push_prompted", "1");
  };

  if (!mounted || !visible) return null;

  // Prompt banner
  return (
    <div style={{
      position: "fixed",
      bottom: "calc(env(safe-area-inset-bottom, 0px) + 90px)",
      left: 16, right: 16, zIndex: 9985,
      background: "white",
      border: "1.5px solid #e2e8f0",
      borderRadius: 20,
      padding: "16px 18px",
      boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
      display: "flex", alignItems: "center", gap: 14,
    }}>
      <div style={{
        width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg, #0F6CF5, #0B3FAA)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22,
      }}>🔔</div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#0B1B4D", marginBottom: 2 }}>
          Enable notifications
        </div>
        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>
          Get notified when clients write or Lina sends a proposal
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
        <button onClick={handleAllow} style={{
          background: "linear-gradient(135deg, #E6B85A, #C9941F)",
          border: "none", borderRadius: 10, padding: "8px 14px",
          fontSize: 12, fontWeight: 800, color: "#0B1B4D",
          cursor: "pointer", whiteSpace: "nowrap",
        }}>
          Allow ✓
        </button>
        <button onClick={handleDismiss} style={{
          background: "transparent", border: "1px solid #e2e8f0",
          borderRadius: 10, padding: "7px 14px",
          fontSize: 11, fontWeight: 600, color: "#94a3b8",
          cursor: "pointer",
        }}>
          Later
        </button>
      </div>
    </div>
  );
}
