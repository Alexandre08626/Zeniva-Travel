"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE } from "../../../../src/design/tokens";

export default function ReferralFormPage() {
  const params = useParams<{ code: string | string[]; slug: string | string[] }>();
  const code = Array.isArray(params?.code) ? params.code[0] : params?.code || "";
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug || "";

  const [formTitle, setFormTitle] = useState("Travel inquiry");
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");
  const [company, setCompany] = useState("");

  const shareUrl = useMemo(() => {
    if (!code || !slug) return "";
    const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zenivatravel.com";
    return `${base.replace(/\/$/, "")}/ref/${encodeURIComponent(code)}/${encodeURIComponent(slug)}`;
  }, [code, slug]);

  useEffect(() => {
    if (!code || !slug) return;
    setLoading(true);
    fetch(`/api/influencer/forms/public?code=${encodeURIComponent(code)}&slug=${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((payload) => {
        if (payload?.data?.title) setFormTitle(payload.data.title);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [code, slug]);

  useEffect(() => {
    if (!code) return;
    fetch("/api/influencer/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, slug, path: typeof window !== "undefined" ? window.location.pathname : "" }),
    }).catch(() => undefined);
  }, [code, slug]);

  const handleSubmit = async () => {
    setError(null);
    if (!name || !email || !destination) {
      setError("Name, email, and destination are required.");
      return;
    }

    try {
      const res = await fetch("/api/influencer/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          slug,
          name,
          email,
          phone,
          destination,
          startDate,
          endDate,
          budget,
          notes,
          company,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Unable to submit request");
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Unable to submit request");
    }
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F7F7FB" }}>
      <div className="mx-auto max-w-4xl px-5 py-10">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Zeniva Travel</p>
          <h1 className="mt-2 text-3xl font-black" style={{ color: TITLE_TEXT }}>{formTitle}</h1>
          <p className="mt-2 text-sm" style={{ color: MUTED_TEXT }}>
            Share your trip details. Our concierge team will reach out within 1 business day.
          </p>
          {shareUrl && (
            <p className="mt-3 text-xs text-slate-500">Form link: {shareUrl}</p>
          )}
        </header>

        {submitted ? (
          <section className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
            <h2 className="text-xl font-bold text-emerald-800">Request received</h2>
            <p className="mt-2 text-sm text-emerald-700">Thanks for reaching out. We will confirm next steps shortly.</p>
          </section>
        ) : (
          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            {loading && (
              <p className="text-sm" style={{ color: MUTED_TEXT }}>Loading form details…</p>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>
                Traveler name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Full name"
                />
              </label>
              <label className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>
                Email
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="name@email.com"
                />
              </label>
              <label className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>
                Phone (optional)
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="+1 555 555 5555"
                />
              </label>
              <label className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>
                Destination
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Paris, Maldives, Tokyo"
                />
              </label>
              <label className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>
                Start date
                <input
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  type="date"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>
                End date
                <input
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  type="date"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>
                Budget
                <input
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="$5,000 - $10,000"
                />
              </label>
            </div>

            <label className="mt-4 block text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              Notes
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                rows={4}
                placeholder="Tell us about the trip goals, preferences, or group size."
              />
            </label>

            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

            <button
              type="button"
              onClick={handleSubmit}
              className="mt-5 w-full rounded-full px-4 py-2 text-sm font-semibold text-white md:w-auto"
              style={{ backgroundColor: PREMIUM_BLUE }}
            >
              Submit request
            </button>
          </section>
        )}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 text-sm" style={{ color: MUTED_TEXT }}>
          <p>We respect your privacy. Your details are used only to craft your travel proposal.</p>
        </section>
      </div>
    </main>
  );
}
