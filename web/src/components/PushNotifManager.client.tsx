"use client";
import { useEffect, useState } from "react";
import { useIsApp } from "../hooks/useIsApp";
import { useAuthStore } from "../lib/authStore";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export default function PushNotifManager() {
  const isApp = useIsApp();
  const user = useAuthStore((s) => s.user);
  const [status, setStatus] = useState<"idle" | "prompt" | "granted" | "denied" | "unsupported">("idle");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isApp) return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setStatus("unsupported"); return;
    }
    const perm = Notification.permission;
    if (perm === "granted") { subscribe(); setStatus("granted"); return; }
    if (perm === "denied") { setStatus("denied"); return; }
    // Show prompt after 3s on first visit
    const seen = localStorage.getItem("zeniva_push_prompted");
    if (seen) return;
    setTimeout(() => setVisible(true), 3000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApp]);

  const subscribe = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      });
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub, userEmail: user?.email || null }),
      });
      setStatus("granted");
    } catch (e) {
      console.error("Push subscribe failed:", e);
    }
  };

  const handleAllow = async () => {
    setVisible(false);
    localStorage.setItem("zeniva_push_prompted", "1");
    const perm = await Notification.requestPermission();
    if (perm === "granted") { await subscribe(); setStatus("granted"); }
    else setStatus("denied");
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem("zeniva_push_prompted", "1");
  };

  if (!isApp || !visible || status !== "idle") return null;

  return (
    <div style={{
      position: "fixed", bottom: "calc(80px + env(safe-area-inset-bottom) + 8px)",
      left: 16, right: 16, zIndex: 9990,
      background: "rgba(10,16,36,0.96)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(230,184,90,0.2)",
      borderRadius: 20,
      padding: "18px 20px",
      boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
      display: "flex", alignItems: "center", gap: 14,
    }}>
      {/* Bell icon */}
      <div style={{
        width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg, rgba(15,108,245,0.3), rgba(11,27,77,0.5))",
        border: "1px solid rgba(15,108,245,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22,
      }}>🔔</div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 2 }}>
          Stay in the loop
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>
          Get notified when Lina replies or your agent sends a proposal
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
        <button onClick={handleAllow} style={{
          background: "linear-gradient(135deg, #E6B85A, #C9941F)",
          border: "none", borderRadius: 10, padding: "8px 14px",
          fontSize: 12, fontWeight: 800, color: "#0B1B4D",
          cursor: "pointer", whiteSpace: "nowrap",
          WebkitTapHighlightColor: "transparent",
        }}>
          Allow ✓
        </button>
        <button onClick={handleDismiss} style={{
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "7px 14px",
          fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)",
          cursor: "pointer",
          WebkitTapHighlightColor: "transparent",
        }}>
          Not now
        </button>
      </div>
    </div>
  );
}
