"use client";
import { useEffect, useRef, useState } from "react";

export default function VillaShareButton({
  slug,
  title,
  className,
}: {
  slug: string;
  title?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [shortUrl, setShortUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);

  // Lazy-fetch the short URL the first time the panel opens.
  useEffect(() => {
    if (!open || shortUrl || loading) return;
    setLoading(true);
    fetch("/api/share/villa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    })
      .then(r => r.json())
      .then(d => { if (d?.shortUrl) setShortUrl(d.shortUrl); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, shortUrl, loading, slug]);

  // Close on outside click / ESC.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleClick = async () => {
    // On mobile / supported browsers, try the native share sheet first
    // — but fetch the short URL synchronously inside the click so the
    // gesture doesn't get lost.
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        let url = shortUrl;
        if (!url) {
          const res = await fetch("/api/share/villa", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug }),
          });
          const d = await res.json();
          url = d?.shortUrl || "";
          if (url) setShortUrl(url);
        }
        if (url) {
          await navigator.share({
            title: title || "Zeniva Travel",
            text: title ? `${title} on Zeniva Travel` : "Zeniva Travel",
            url,
          });
          return;
        }
      } catch {
        // user cancelled or share failed — fall through to popover
      }
    }
    setOpen(o => !o);
  };

  const copy = async () => {
    if (!shortUrl) return;
    try {
      await navigator.clipboard.writeText(shortUrl);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = shortUrl;
      ta.style.cssText = "position:fixed;left:-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const subject = encodeURIComponent(title ? `${title} — Zeniva Travel` : "Zeniva Travel");
  const body = encodeURIComponent(
    title
      ? `Check out this stay on Zeniva Travel:\n\n${title}\n${shortUrl || ""}`
      : `Check out this stay on Zeniva Travel:\n\n${shortUrl || ""}`,
  );

  return (
    <div className="relative inline-block" ref={popRef}>
      <button
        type="button"
        onClick={handleClick}
        className={className || "rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition"}
      >
        Share
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
            Short link
          </p>
          {loading || !shortUrl ? (
            <div className="rounded-lg bg-slate-50 px-3 py-3 text-xs text-slate-400">
              Generating link…
            </div>
          ) : (
            <>
              <div className="flex items-stretch gap-2">
                <input
                  readOnly
                  value={shortUrl}
                  onFocus={(e) => e.currentTarget.select()}
                  className="flex-1 min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <button
                  type="button"
                  onClick={copy}
                  className={`rounded-lg px-3 py-2 text-xs font-bold transition ${copied ? "bg-green-500 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <a
                  href={`mailto:?subject=${subject}&body=${body}`}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  ✉ Email
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent((title ? `${title} — ` : "") + shortUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  💬 WhatsApp
                </a>
                <a
                  href={`sms:?body=${encodeURIComponent((title ? `${title} — ` : "") + shortUrl)}`}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  📱 SMS
                </a>
              </div>

              <p className="mt-3 text-[10px] text-slate-400 text-center">
                Same destination — just a prettier link to paste anywhere.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
