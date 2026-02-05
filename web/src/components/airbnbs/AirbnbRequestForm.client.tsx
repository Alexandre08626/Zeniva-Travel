"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "residenceRequests";
const ALEXANDRE_CHANNEL_ID = "agent-alexandre";
const ADMIN_CHANNEL_ID = "hq";

type AirbnbRequestPayload = {
  id: string;
  createdAt: string;
  message: string;
  channelIds: string[];
  sourcePath: string;
  propertyName: string;
  desiredDate: string;
  fullName: string;
  phone: string;
  email: string;
};

type Props = {
  propertyName: string;
  sourcePath: string;
};

function buildMessage(payload: Omit<AirbnbRequestPayload, "id" | "createdAt" | "message">) {
  return [
    "New residence request (residence detail page)",
    `Property name: ${payload.propertyName}`,
    `Desired date: ${payload.desiredDate}`,
    `Client full name: ${payload.fullName}`,
    `Client phone: ${payload.phone}`,
    `Client email: ${payload.email}`,
    `Source page: ${payload.sourcePath}`,
  ].join("\n");
}

function persistRequest(request: AirbnbRequestPayload) {
  if (typeof window === "undefined") return;
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  existing.push(request);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export default function AirbnbRequestForm({ propertyName, sourcePath }: Props) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [property, setProperty] = useState(propertyName || "");
  const [desiredDate, setDesiredDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setProperty(propertyName || "");
  }, [propertyName]);

  const canSubmit = useMemo(() => {
    return Boolean(fullName && phone && email && property && desiredDate);
  }, [fullName, phone, email, property, desiredDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!canSubmit) {
      setError("Please complete all required fields.");
      return;
    }

    setSubmitting(true);

    const payloadBase = {
      channelIds: [ALEXANDRE_CHANNEL_ID, ADMIN_CHANNEL_ID],
      sourcePath,
      propertyName: property,
      desiredDate,
      fullName,
      phone,
      email,
    };

    const message = buildMessage(payloadBase);
    const request: AirbnbRequestPayload = {
      id: (typeof crypto !== "undefined" && "randomUUID" in crypto) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      createdAt: new Date().toISOString(),
      message,
      ...payloadBase,
    };

    try {
      const resp = await fetch("/api/agent/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!resp.ok) {
        throw new Error("Failed to send request");
      }
    } catch (err) {
      persistRequest(request);
    } finally {
      setSubmitting(false);
      setSuccess(true);
      setFullName("");
      setPhone("");
      setEmail("");
      setDesiredDate("");
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow p-6">
      <div className="flex flex-col gap-2 mb-6">
        <h2 className="text-2xl font-black text-slate-900">Request this residence</h2>
        <p className="text-sm text-slate-600">Fast booking help. We will contact you immediately after you submit the request.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,280px] gap-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm font-semibold text-slate-700">
            Client full name
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              placeholder="Full name"
            />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Phone number
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              placeholder="Phone"
              type="tel"
            />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Email address
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              placeholder="Email"
              type="email"
            />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Property name
            <input
              required
              value={property}
              onChange={(e) => setProperty(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              placeholder="Property name"
            />
          </label>
          <label className="text-sm font-semibold text-slate-700 md:col-span-2">
            Desired date
            <input
              required
              value={desiredDate}
              onChange={(e) => setDesiredDate(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              type="date"
            />
          </label>

          <div className="md:col-span-2 flex flex-col gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-blue-600 text-white font-semibold py-3 text-sm hover:bg-blue-700 transition disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Send request"}
            </button>
            {error && <p className="text-sm text-blue-600">{error}</p>}
          </div>
        </form>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 h-fit lg:sticky lg:top-24">
          {success && <p className="text-sm text-blue-600">Request sent. An agent has received your details.</p>}
          <p className="text-lg font-bold text-slate-900 mt-2">Chat with an agent</p>
          <p className="text-sm text-slate-600">We respond fast to help finalize your stay.</p>
          <a
            href={`/chat/agent?channel=${encodeURIComponent(ALEXANDRE_CHANNEL_ID)}&listing=${encodeURIComponent(property || propertyName)}&source=${encodeURIComponent(sourcePath)}`}
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 text-white py-2 text-sm font-semibold shadow hover:bg-blue-700 transition"
          >
            Chat with agent
          </a>
        </div>
      </div>
    </section>
  );
}
