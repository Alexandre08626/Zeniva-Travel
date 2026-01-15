"use client";
import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useRequireRole } from "../../../src/lib/roleGuards";
import { addAudit, useAuthStore } from "../../../src/lib/authStore";
import { PREMIUM_BLUE, MUTED_TEXT, ACCENT_GOLD } from "../../../src/design/tokens";
import { askOpenAI } from "../../../src/lib/askOpenAI";
import LinaAvatar from "../../../src/components/LinaAvatar";

import { Role } from "../../../src/lib/authStore";

const allowedRoles: Role[] = ["hq", "admin", "travel-agent", "finance", "support"];

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

type DossierStatus = "LEAD" | "IN_PROGRESS" | "SENT" | "APPROVED" | "BOOKED" | "ARCHIVED";
type TripType = "Flights" | "Hotels" | "Package" | "Group" | "Yacht";

type Dossier = {
  id: string;
  client: string;
  destination: string;
  status: DossierStatus;
  tripType: TripType;
  assigned: string;
  updatedAt: string;
  travelStart: string;
  travelEnd: string;
  pax: number;
  budget: string;
  nextStep: string;
  preferences: string;
};

type Message = { id: string; role: "agent" | "lina"; text: string; ts: string };
type Task = { id: string; text: string; done: boolean };
type Proposal = {
  id: string;
  dossierId: string;
  clientName: string;
  destination: string;
  travelDates: string;
  pax: number;
  budget: string;
  itinerary: string[];
  totalPrice: string;
  createdAt: string;
  status: "draft" | "ready" | "sent";
};

const DOSSIERS: Dossier[] = [
  {
    id: "TRIP-104",
    client: "Dupuis / Cancun",
    destination: "Cancun",
    status: "IN_PROGRESS",
    tripType: "Package",
    assigned: "alice@zeniva.ca",
    updatedAt: "2026-01-09T14:00:00Z",
    travelStart: "2026-02-12",
    travelEnd: "2026-02-19",
    pax: 2,
    budget: "$6,500",
    nextStep: "Awaiting client approval",
    preferences: "Boutique resort, nonstop flights, balcony room",
  },
  {
    id: "YCHT-55",
    client: "HQ / Med Yacht",
    destination: "Mediterranean",
    status: "SENT",
    tripType: "Yacht",
    assigned: "marco@zeniva.ca",
    updatedAt: "2026-01-08T17:30:00Z",
    travelStart: "2026-06-05",
    travelEnd: "2026-06-12",
    pax: 6,
    budget: "$48,000",
    nextStep: "Client to pick crew + APA",
    preferences: "Modern 30m yacht, chef onboard",
  },
  {
    id: "TRIP-099",
    client: "NovaTech",
    destination: "Tokyo",
    status: "APPROVED",
    tripType: "Flights",
    assigned: "sara@zeniva.ca",
    updatedAt: "2026-01-07T10:10:00Z",
    travelStart: "2026-03-02",
    travelEnd: "2026-03-10",
    pax: 3,
    budget: "$9,800",
    nextStep: "Issue tickets and send docs",
    preferences: "Business class, alliance loyalty, aisle seats",
  },
];

const TASKS: Record<string, Task[]> = {
  "TRIP-104": [
    { id: "t1", text: "Send proposal v2", done: false },
    { id: "t2", text: "Add transfers option", done: false },
    { id: "t3", text: "Collect passport copies", done: false },
  ],
  "YCHT-55": [
    { id: "t4", text: "Confirm crew availability", done: false },
    { id: "t5", text: "APA estimate", done: true },
  ],
  "TRIP-099": [
    { id: "t6", text: "Ticket issuance", done: false },
    { id: "t7", text: "Send travel docs", done: false },
  ],
};

const SHORTLIST: Record<string, { type: string; title: string; price: string; selected?: boolean }[]> = {
  "TRIP-104": [
    { type: "Flight", title: "YUL → CUN nonstop", price: "$820", selected: true },
    { type: "Hotel", title: "Andaz Mayakoba King", price: "$3,900", selected: true },
    { type: "Excursion", title: "Chichen Itza private", price: "$420" },
  ],
  "YCHT-55": [
    { type: "Yacht", title: "30m modern – 4 cabins", price: "$42,500", selected: true },
  ],
  "TRIP-099": [
    { type: "Flight", title: "YUL → HND business", price: "$3,200", selected: true },
  ],
};

const CONVERSATIONS: Record<string, Message[]> = {
  "TRIP-104": [
    { id: "m1", role: "agent", text: "Resuming Cancun build. Need best nonstop + boutique resort.", ts: "09:10" },
    { id: "m2", role: "lina", text: "Loaded dossier TRIP-104. Next step: client approval on proposal v2. Want me to draft the follow-up?", ts: "09:10" },
  ],
  "YCHT-55": [
    { id: "m3", role: "agent", text: "Client asked for crew profiles.", ts: "08:40" },
    { id: "m4", role: "lina", text: "Crew shortlist ready. I can attach APA estimate and send to client.", ts: "08:41" },
  ],
  "TRIP-099": [
    { id: "m5", role: "agent", text: "Need to issue tickets today.", ts: "10:12" },
    { id: "m6", role: "lina", text: "I prefilled ticketing info. Ready to send docs after issuance.", ts: "10:13" },
  ],
};

const FILTERS = {
  status: ["LEAD", "IN_PROGRESS", "SENT", "APPROVED", "BOOKED", "ARCHIVED"] as DossierStatus[],
  tripType: ["Flights", "Hotels", "Package", "Group", "Yacht"] as TripType[],
};

const QUICK_ACTIONS = [
  "Créer nouveau voyage",
  "Rechercher vols",
  "Rechercher hôtels",
  "Construire package",
  "Générer proposition",
  "Télécharger proposition",
  "Envoyer au client",
];


export default function LinaCommandCenter() {
  useRequireRole(allowedRoles, "/login");
  const user = useAuthStore((s) => s.user);
  const me = (user?.email || "").toLowerCase();

  const [search, setSearch] = useState("");
  const [searchCategory, setSearchCategory] = useState<string>("flights");
  const [searchLoading, setSearchLoading] = useState(false);

  // --- AGENT SEARCH HANDLER ---
  async function handleAgentSearch() {
    if (!selected) return;
    setSearchLoading(true);
    let endpoint = '';
    let method: 'GET' | 'POST' = 'GET';
    let url = '';
    let body: string | undefined = undefined;
    // Basic parsing: you can improve this to extract more details from the search string
    const destination = selected.destination || '';
    const pax = selected.pax || 2;
    const travelStart = selected.travelStart || '';
    const travelEnd = selected.travelEnd || '';
    try {
      if (searchCategory === 'flights') {
        endpoint = '/api/partners/duffel';
        url = `${endpoint}?origin=YUL&destination=${encodeURIComponent(destination)}&date=${travelStart}`;
        method = 'GET';
      } else if (searchCategory === 'hotels') {
        endpoint = '/api/partners/hotelbeds';
        url = `${endpoint}?destination=${encodeURIComponent(destination)}&checkIn=${travelStart}&checkOut=${travelEnd}&guests=${pax}`;
        method = 'GET';
      } else if (searchCategory === 'excursions') {
        endpoint = '/api/partners/hotelbeds/activities';
        url = endpoint;
        method = 'POST';
        body = JSON.stringify({ destination, from: travelStart, to: travelEnd, adults: pax });
      } else if (searchCategory === 'transfers') {
        endpoint = '/api/partners/hotelbeds/transfers';
        url = endpoint;
        method = 'POST';
        body = JSON.stringify({ pickupLocation: destination, dropoffLocation: destination, pickupDate: travelStart, pickupTime: '10:00', adults: pax });
      } else {
        setSearchLoading(false);
        return;
      }
      const res = await fetch(url, {
        method,
        headers: method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
        body: body,
      });
      const data = await res.json();
      // Transform API response to Proposal type (simplified for demo)
      let proposal: Proposal | null = null;
      if (searchCategory === 'flights' && data.result?.offers?.length) {
        const offer = data.result.offers[0];
        proposal = {
          id: uid(),
          dossierId: selected.id,
          clientName: selected.client,
          destination: selected.destination,
          travelDates: `${selected.travelStart} - ${selected.travelEnd}`,
          pax: selected.pax,
          budget: selected.budget,
          itinerary: [
            `Flight: ${offer.slices?.[0]?.origin} → ${offer.slices?.[0]?.destination} (${offer.slices?.[0]?.departure_date})`,
            `Airline: ${offer.owner?.name || offer.owner?.iata_code}`
          ],
          totalPrice: offer.total_amount + ' ' + offer.total_currency,
          createdAt: new Date().toISOString(),
          status: 'draft',
        };
      } else if (searchCategory === 'hotels' && data?.hotels?.length) {
        const hotel = data.hotels[0];
        proposal = {
          id: uid(),
          dossierId: selected.id,
          clientName: selected.client,
          destination: selected.destination,
          travelDates: `${selected.travelStart} - ${selected.travelEnd}`,
          pax: selected.pax,
          budget: selected.budget,
          itinerary: [
            `Hotel: ${hotel.name} (${hotel.categoryName})`,
            `Address: ${hotel.address?.content}`
          ],
          totalPrice: hotel.minRate?.price + ' ' + hotel.minRate?.currency,
          createdAt: new Date().toISOString(),
          status: 'draft',
        };
      } else if (searchCategory === 'excursions' && data?.activities?.length) {
        const act = data.activities[0];
        proposal = {
          id: uid(),
          dossierId: selected.id,
          clientName: selected.client,
          destination: selected.destination,
          travelDates: `${selected.travelStart} - ${selected.travelEnd}`,
          pax: selected.pax,
          budget: selected.budget,
          itinerary: [
            `Excursion: ${act.name}`,
            `Location: ${act.destination?.name}`
          ],
          totalPrice: act.minRate?.price + ' ' + act.minRate?.currency,
          createdAt: new Date().toISOString(),
          status: 'draft',
        };
      } else if (searchCategory === 'transfers' && data?.transfers?.length) {
        const tr = data.transfers[0];
        proposal = {
          id: uid(),
          dossierId: selected.id,
          clientName: selected.client,
          destination: selected.destination,
          travelDates: `${selected.travelStart} - ${selected.travelEnd}`,
          pax: selected.pax,
          budget: selected.budget,
          itinerary: [
            `Transfer: ${tr.type} ${tr.vehicle?.name}`
          ],
          totalPrice: tr.price?.amount + ' ' + tr.price?.currency,
          createdAt: new Date().toISOString(),
          status: 'draft',
        };
      }
      if (proposal) {
        setProposals(prev => ({ ...prev, [selected.id]: proposal }));
      }
    } catch (err) {
      // Optionally show error to user
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert('Erreur lors de la recherche: ' + errorMessage);
    } finally {
      setSearchLoading(false);
    }
  }
  const [statusFilter, setStatusFilter] = useState<DossierStatus | "ALL">("IN_PROGRESS");
  const [typeFilter, setTypeFilter] = useState<TripType | "ALL">("ALL");
  const [assignedFilter, setAssignedFilter] = useState<"me" | "any">("me");
  const [selectedId, setSelectedId] = useState<string | null>(DOSSIERS.find((d) => d.assigned === me)?.id || DOSSIERS[0].id);
  const [messages, setMessages] = useState<Record<string, Message[]>>(CONVERSATIONS);
  const [tasks, setTasks] = useState<Record<string, Task[]>>(TASKS);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [proposals, setProposals] = useState<Record<string, Proposal>>({
    "TRIP-104": {
      id: uid(),
      dossierId: "TRIP-104",
      clientName: "Dupuis / Cancun",
      destination: "Cancun",
      travelDates: "2026-02-12 - 2026-02-19",
      pax: 2,
      budget: "$6,500",
      itinerary: [
        "✈️ Vol direct Montréal-Cancun avec Air Canada",
        "🏨 Hôtel boutique 5* avec balcon vue mer",
        "🚗 Transfert privé aéroport-hôtel",
        "🍽️ Dîner romantique au coucher du soleil"
      ],
      totalPrice: "$4,850 CAD",
      createdAt: new Date().toISOString(),
      status: 'draft',
    }
  });

  // Mode state: 'normal', 'hybrid', 'lina'
  const [mode, setMode] = useState<'normal' | 'hybrid' | 'lina'>('hybrid');

  const filtered = useMemo(() => {
    return DOSSIERS.filter((d) => {
      const matchesSearch = [d.client, d.destination, d.id].some((v) => v.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = statusFilter === "ALL" ? true : d.status === statusFilter;
      const matchesType = typeFilter === "ALL" ? true : d.tripType === typeFilter;
      const matchesAssigned = assignedFilter === "any" ? true : d.assigned.toLowerCase() === me;
      return matchesSearch && matchesStatus && matchesType && matchesAssigned;
    });
  }, [search, statusFilter, typeFilter, assignedFilter, me]);

  const selected = useMemo(() => filtered.find((d) => d.id === selectedId) || filtered[0] || null, [filtered, selectedId]);

  // Ajout message : si pas de dossier sélectionné, stocke dans 'global'
  const addMsg = (role: "agent" | "lina", text: string, targetId?: string) => {
    const id = targetId || (selected ? selected.id : 'global');
    const entry: Message = { id: uid(), role, text, ts: new Date().toLocaleTimeString().slice(0, 5) };
    setMessages((prev) => ({ ...prev, [id]: [...(prev[id] || []), entry] }));
    if (id !== 'global') addAudit(`lina:${role}`, "dossier", id, { text });
  };

  const handleSend = async (text: string) => {
    const trimmed = text.trim().toLowerCase();
    if (!trimmed) return;

    // Si pas de dossier sélectionné, on travaille en mode global
    const currentId = selected ? selected.id : 'global';
    addMsg("agent", text, currentId);
    setInput("");
    setStreaming(true);
    let response = "";
    let newDossierId: string | null = null;

    // Créer un nouveau voyage (même sans dossier sélectionné)
    if (trimmed.includes("créer") || trimmed.includes("nouveau") || trimmed.includes("new")) {
      const clientMatch = text.match(/(?:pour|client)\s+([^,]+)(?:\s*,\s*|\s+vers?\s*|\s+destination\s*)(.+)?/i);
      if (clientMatch) {
        const clientName = clientMatch[1].trim();
        const destination = clientMatch[2]?.trim() || "À définir";
        const newId = `TRIP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        const newDossier: Dossier = {
          id: newId,
          client: clientName,
          destination: destination,
          status: "LEAD",
          tripType: "Package",
          assigned: me,
          updatedAt: new Date().toISOString(),
          travelStart: "",
          travelEnd: "",
          pax: 2,
          budget: "",
          nextStep: "Collect travel details",
          preferences: "",
        };

        DOSSIERS.push(newDossier);
        setSelectedId(newId);
        newDossierId = newId;

        response = `✅ Nouveau dossier créé : ${newId}\n\n👤 Client: ${clientName}\n🎯 Destination: ${destination}\n\nPour commencer, dites-moi :\n• Les dates souhaitées (ex: "15-22 mars 2026")\n• Le nombre de passagers\n• Le budget approximatif\n• Les préférences (vols, hôtel, activités)`;
        addMsg("lina", response, newDossierId || currentId);
        setStreaming(false);
        return;
      }
    }

    // Si pas de dossier sélectionné, Lina répond en mode global avec OpenAI
    if (!selected) {
      try {
        const apiKey = process.env.OPENAI_API_KEY || "";
        const prompt = `Réponds toujours en français. L'utilisateur a écrit : "${text}". Si la demande concerne la création d'un voyage, explique comment faire.`;
        response = await askOpenAI(prompt, apiKey);
      } catch {
        response = "[Erreur OpenAI]";
      }
      addMsg("lina", response, "global");
      setStreaming(false);
      return;
    }

    // Si dossier sélectionné, Lina répond en français avec OpenAI et contexte dossier
    try {
      const apiKey = process.env.OPENAI_API_KEY || "";
      const dossierContext = selected ? `Dossier: ${selected.id}, Client: ${selected.client}, Destination: ${selected.destination}, Statut: ${selected.status}, Dates: ${selected.travelStart} - ${selected.travelEnd}, Pax: ${selected.pax}, Budget: ${selected.budget}` : "";
      const prompt = `Tu es Lina, assistante de voyage. Réponds toujours en français. Contexte: ${dossierContext}. L'utilisateur a écrit : "${text}".`;
      response = await askOpenAI(prompt, apiKey);
    } catch {
      response = "[Erreur OpenAI]";
    }

    addMsg("lina", response, selected.id);
    setStreaming(false);
    return;
  };

  const toggleTask = (taskId: string) => {
    if (!selected) return;
    setTasks((prev) => ({
      ...prev,
      [selected.id]: (prev[selected.id] || []).map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
    }));
  };

  const statusColor = (status: DossierStatus) => {
    if (status === "BOOKED") return "bg-emerald-600 text-white";
    if (status === "APPROVED") return "bg-blue-600 text-white";
    if (status === "SENT") return "bg-amber-500 text-white";
    if (status === "IN_PROGRESS") return "bg-slate-800 text-white";
    if (status === "LEAD") return "bg-slate-200 text-slate-800";
    return "bg-slate-500 text-white";
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#0b1220", position: 'relative' }}>
      {/* Mode normal button, always visible in top right */}
      <div style={{ position: 'fixed', top: 24, right: 32, zIndex: 2000, display: 'flex', gap: 12 }}>
        <button
          style={{ background: mode === 'normal' ? '#1a2340' : '#fff', color: mode === 'normal' ? '#fff' : '#222', borderRadius: 8, padding: '10px 18px', fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: 'none' }}
          onClick={() => setMode('normal')}
        >
          Mode normal
        </button>
        <button
          style={{ background: mode === 'lina' ? '#1a2340' : '#fff', color: mode === 'lina' ? '#fff' : '#222', borderRadius: 8, padding: '10px 18px', fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: 'none' }}
          onClick={() => setMode('lina')}
        >
          Lina AI Mode
        </button>
        <button
          style={{ background: mode === 'hybrid' ? '#1a2340' : '#fff', color: mode === 'hybrid' ? '#fff' : '#222', borderRadius: 8, padding: '10px 18px', fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: 'none' }}
          onClick={() => setMode('hybrid')}
        >
          Hybrid
        </button>
      </div>

      {/* Overlay command bar for normal mode ONLY if mode === 'normal' */}
      {mode === 'normal' ? (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(245,247,250,0.98)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            background: 'linear-gradient(120deg, #f5f7fa 60%, #e9f0fb 100%)',
            borderRadius: 24,
            boxShadow: '0 8px 32px rgba(24,31,54,0.10)',
            padding: 40,
            minWidth: 520,
            maxWidth: '96vw',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: '1.5px solid #e3e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24 }}>
              <LinaAvatar size="lg" style={{ border: '2px solid #fff', boxShadow: '0 2px 8px #e3e8f0', width: 80, height: 80 }} />
              <div>
                <div style={{ fontWeight: 900, fontSize: 26, color: '#1a2340', letterSpacing: 0.2 }}>Production-grade control</div>
                <div style={{ color: '#6b7a90', fontWeight: 500, fontSize: 15, marginTop: 2 }}>Hybrid bar for manual provider search + Lina AI. Every action audited and tied to a dossier.</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
              <button style={{ background: '#f5f7fa', color: '#1a2340', border: '1.5px solid #e3e8f0', borderRadius: 8, padding: '8px 16px', fontWeight: 700 }}>Compare best nonstop flights</button>
              <button style={{ background: '#f5f7fa', color: '#1a2340', border: '1.5px solid #e3e8f0', borderRadius: 8, padding: '8px 16px', fontWeight: 700 }}>Draft proposal</button>
              <button style={{ background: '#f5f7fa', color: '#1a2340', border: '1.5px solid #e3e8f0', borderRadius: 8, padding: '8px 16px', fontWeight: 700 }}>Audit-logged</button>
              <button style={{ background: '#f5f7fa', color: '#1a2340', border: '1.5px solid #e3e8f0', borderRadius: 8, padding: '8px 16px', fontWeight: 700 }}>Attach to client</button>
              <button style={{ background: '#f5f7fa', color: '#1a2340', border: '1.5px solid #e3e8f0', borderRadius: 8, padding: '8px 16px', fontWeight: 700 }}>No auto-book</button>
              <button style={{ background: '#f5f7fa', color: '#1a2340', border: '1.5px solid #e3e8f0', borderRadius: 8, padding: '8px 16px', fontWeight: 700 }}>Voice-ready</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, width: '100%' }}>
              <input
                autoFocus
                type="text"
                placeholder="/ Build a 7-day Cancun luxury trip for 2 adults, budget 5k"
                style={{ flex: 1, fontSize: 20, padding: '16px 22px', borderRadius: 12, border: '1.5px solid #e3e8f0', background: '#fff', fontWeight: 600, color: '#1a2340' }}
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={async e => { if (e.key === 'Enter') await handleAgentSearch(); }}
                disabled={searchLoading}
              />
              <button
                style={{ background: 'linear-gradient(90deg, #1e90ff 0%, #0050c8 100%)', color: '#fff', border: 'none', borderRadius: 12, padding: '16px 32px', fontWeight: 800, fontSize: 20, marginLeft: 8, boxShadow: '0 2px 8px #e3e8f0' }}
                onClick={handleAgentSearch}
                disabled={searchLoading}
              >
                {searchLoading ? 'Recherche...' : 'Start search'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
              {[
                { key: 'flights', label: 'Flights' },
                { key: 'hotels', label: 'Hotels' },
                { key: 'resorts', label: 'Resorts' },
                { key: 'excursions', label: 'Excursions' },
                { key: 'transfers', label: 'Transfers' },
                { key: 'cars', label: 'Cars' },
                { key: 'yachts', label: 'Yachts' },
              ].map(btn => (
                <button
                  key={btn.key}
                  style={{ background: searchCategory === btn.key ? '#0050c8' : '#1a2340', color: '#fff', border: 'none', borderRadius: 20, padding: '8px 22px', fontWeight: 700, opacity: searchLoading ? 0.6 : 1 }}
                  onClick={() => setSearchCategory(btn.key)}
                  disabled={searchLoading}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <button
              style={{ marginTop: 10, background: '#e3e8f0', color: '#1a2340', border: 'none', borderRadius: 8, padding: '8px 24px', fontWeight: 700 }}
              onClick={() => setMode('hybrid')}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl px-5 py-8 space-y-4">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="h-20 w-20 rounded-full border border-slate-700 bg-slate-800 overflow-hidden shrink-0">
              <LinaAvatar size="lg" className="h-full w-full" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Lina Command Center · Agent</p>
              <h1 className="text-3xl md:text-4xl font-black text-white">Resume and build dossiers</h1>
              <p className="text-sm" style={{ color: MUTED_TEXT }}>
                Dossier-centric workbench. Same-day/next-day resume, no navigation needed. Lina only works on the selected dossier.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-200">
            <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5">{user?.email} · {user?.role?.toUpperCase()}</span>
            <Link href="/call" className="rounded-full border border-emerald-500 bg-emerald-600 px-3 py-1.5 text-white">Call Lina (agent)</Link>
          </div>
        </header>

        <div className="grid gap-3 lg:grid-cols-[320px,1.2fr,1fr]">
          {/* Left: Dossier navigator */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Dossiers</p>
                <p className="text-sm font-bold text-white">My active dossiers</p>
              </div>
              <span className="rounded-full bg-emerald-600 px-2 py-[2px] text-[11px] font-bold text-white">Audit on</span>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, destination, dossier #"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
            />
            <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-200">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as DossierStatus | "ALL")}
                className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
              >
                <option value="ALL">All statuses</option>
                {FILTERS.status.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as TripType | "ALL")}
                className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
              >
                <option value="ALL">All trip types</option>
                {FILTERS.tripType.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <select
                value={assignedFilter}
                onChange={(e) => setAssignedFilter(e.target.value as "me" | "any")}
                className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
              >
                <option value="me">Assigned to me</option>
                <option value="any">Any agent (admin)</option>
              </select>
              <select className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none" defaultValue="recent">
                <option value="recent">Last updated</option>
                <option value="travel">Travel date</option>
              </select>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {filtered.map((d) => {
                const active = selected?.id === d.id;
                return (
                  <div
                    key={d.id}
                    className="rounded-xl border px-3 py-2 text-sm cursor-pointer transition"
                    onClick={() => setSelectedId(d.id)}
                    style={{
                      borderColor: active ? PREMIUM_BLUE : "#1e293b",
                      backgroundColor: active ? "#111827" : "#0f172a",
                      color: "white",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold">{d.client}</div>
                      <span className={`rounded-full px-2 py-[2px] text-[10px] font-bold ${statusColor(d.status)}`}>{d.status}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">{d.destination} • {d.tripType}</div>
                    <div className="text-[11px] text-slate-500">Updated {new Date(d.updatedAt).toLocaleString()}</div>
                    <div className="mt-1 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Agent: {d.assigned}</span>
                      <button
                        className="rounded-full border border-slate-700 bg-slate-900 px-2 py-[2px] text-[10px] font-bold"
                        onClick={(e) => { e.stopPropagation(); setSelectedId(d.id); }}
                      >
                        Resume
                      </button>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && <p className="text-xs text-slate-400">No dossiers match filters.</p>}
            </div>
          </div>

          {/* Center: Lina chat bound to dossier */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 flex flex-col gap-3" style={{ minHeight: "75vh" }}>
            {/* En-tête dossier si sélectionné */}
            {selected && (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{selected.client}</p>
                    <h2 className="text-xl font-black text-white">{selected.destination} • {selected.id}</h2>
                    <p className="text-xs" style={{ color: MUTED_TEXT }}>Status {selected.status} • Next step: {selected.nextStep}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                    <span className={`rounded-full px-3 py-1 ${statusColor(selected.status)}`}>{selected.status}</span>
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">Pax {selected.pax}</span>
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">Budget {selected.budget}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950 p-3 shadow-sm">
                  <div className="h-20 w-20 rounded-full border border-slate-700 bg-slate-800 overflow-hidden">
                    <LinaAvatar size="lg" className="h-full w-full" />
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-white">Lina est en ligne</p>
                    <p className="text-[12px]" style={{ color: MUTED_TEXT }}>Actions et réponses restent dans ce dossier.</p>
                  </div>
                  <span className="ml-auto rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white">Dossier verrouillé</span>
                </div>

                <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                  {QUICK_ACTIONS.map((qa) => (
                    <button
                      key={qa}
                      onClick={() => handleSend(qa)}
                      className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-200 hover:border-slate-500"
                    >
                      {qa}
                    </button>
                  ))}
                </div>
              </>
            )}
            {/* Messages area - global if no dossier, else scoped */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
              {(selected ? (messages[selected.id] || []) : (messages['global'] || [])).map((m) => (
                <div key={m.id} className="rounded-xl border border-slate-800 bg-slate-900 p-3 shadow-sm">
                  <div className="flex items-center justify-between text-[11px] font-semibold" style={{ color: MUTED_TEXT }}>
                    <span>{m.role === "lina" ? "Lina" : "You"}</span>
                    <span>{m.ts}</span>
                  </div>
                  <div className="mt-1 whitespace-pre-line text-sm font-semibold" style={{ color: m.role === "lina" ? ACCENT_GOLD : "white" }}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            {/* Input form - toujours actif */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
              className="flex-shrink-0 space-y-2 border-t border-slate-800 pt-3 mt-2"
            >
              <div className="text-[11px] font-semibold text-slate-400">
                Tapez votre message à Lina (recherche, création de voyage, proposition...)
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Écrivez à Lina..."
                  className="flex-1 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-slate-600"
                  disabled={streaming}
                />
                <button
                  type="submit"
                  disabled={streaming}
                  className="rounded-2xl px-6 py-3 text-sm font-extrabold text-white"
                  style={{ backgroundColor: PREMIUM_BLUE, opacity: streaming ? 0.5 : 1 }}
                >
                  {streaming ? "Envoi..." : "Envoyer"}
                </button>
              </div>
            </form>
          </div>

          {/* Right: Dossier workspace */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
            {selected ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Workspace</p>
                    <h3 className="text-lg font-black text-white">Overview</h3>
                    <p className="text-xs" style={{ color: MUTED_TEXT }}>Client profile, trip summary, next steps.</p>
                  </div>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-[11px] font-semibold text-slate-200">No navigation needed</span>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-slate-200 space-y-2">
                  <div className="font-semibold text-white">Client profile</div>
                  <p>Preferences: {selected.preferences}</p>
                  <p>Travel dates: {selected.travelStart} → {selected.travelEnd}</p>
                  <p>Pax: {selected.pax} · Budget: {selected.budget}</p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-slate-200 space-y-2">
                  <div className="font-semibold text-white">Shortlist / Selected</div>
                  <div className="space-y-1">
                    {(SHORTLIST[selected.id] || []).map((item) => (
                      <div key={item.title} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-3 py-2">
                        <div>
                          <p className="text-white text-sm font-semibold">{item.title}</p>
                          <p className="text-[11px] text-slate-400">{item.type}</p>
                        </div>
                        <div className="text-right text-sm font-bold text-white">
                          {item.price}
                          {item.selected && <span className="ml-2 rounded-full bg-emerald-600 px-2 py-[2px] text-[10px] font-bold text-white">Selected</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-slate-200 space-y-2">
                  <div className="font-semibold text-white">Next actions</div>
                  <div className="space-y-1">
                    {(tasks[selected.id] || []).map((t) => (
                      <label key={t.id} className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2">
                        <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} />
                        <span className={t.done ? "line-through text-slate-500" : "text-white"}>{t.text}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-slate-200 space-y-2">
                  <div className="font-semibold text-white flex items-center justify-between">
                    <span>Propositions</span>
                    {proposals[selected.id] && (
                      <span className="text-emerald-400 text-xs font-normal">📄 PDF prêt à télécharger</span>
                    )}
                  </div>
                  {proposals[selected.id] ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-400 font-medium">✅ Proposition prête</span>
                        <span className="text-xs text-slate-400">
                          {new Date(proposals[selected.id].createdAt).toLocaleDateString('fr-CA')}
                        </span>
                      </div>
                      <div className="text-xs bg-slate-800 p-3 rounded-lg">
                        <p>📍 <strong>{proposals[selected.id].destination}</strong></p>
                        <p>📅 {proposals[selected.id].travelDates}</p>
                        <p>👥 {proposals[selected.id].pax} passagers</p>
                        <p>💰 <strong className="text-emerald-400">{proposals[selected.id].totalPrice}</strong></p>
                      </div>
                      <div className="border-t border-slate-700 pt-3">
                        <button
                          onClick={async () => {
                            try {
                              alert('🔄 Génération du PDF en cours...');
                              const proposalToSend = {
                                ...proposals[selected.id],
                                shortlist: SHORTLIST[selected.id] || []
                              };
                              const response = await fetch('/api/proposals/generate-pdf', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(proposalToSend)
                              });

                              if (response.ok) {
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `Proposition-${proposals[selected.id].clientName}-${proposals[selected.id].destination}.pdf`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                window.URL.revokeObjectURL(url);
                                alert('✅ PDF téléchargé avec succès ! 📄\nLe fichier a été sauvegardé dans vos téléchargements.');
                              } else {
                                const errorText = await response.text();
                                alert('❌ Erreur lors de la génération du PDF: ' + errorText);
                              }
                            } catch (error) {
                              alert('❌ Erreur lors du téléchargement: ' + (error instanceof Error ? error.message : String(error)));
                            }
                          }}
                          className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white text-sm font-bold rounded-lg hover:from-emerald-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-emerald-500 hover:border-blue-500 transform hover:scale-105"
                        >
                          🚀 📥 TÉLÉCHARGER LE PDF PROFESSIONNEL
                        </button>
                        <p className="text-xs text-slate-400 text-center mt-2">
                          Cliquez pour obtenir un PDF élégant avec Lina
                        </p>
                        <button
                          onClick={() => handleSend("Envoyer au client")}
                          className="px-2 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700"
                        >
                          📧 Envoyer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-slate-400">Aucune proposition générée</p>
                      <button
                        onClick={() => handleSend("Générer proposition")}
                        className="px-3 py-1 bg-amber-600 text-white text-xs rounded hover:bg-amber-700"
                      >
                        🎯 Générer proposition
                      </button>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-slate-200 space-y-2">
                  <div className="font-semibold text-white">Réservations & Documents</div>
                  <ul className="space-y-1">
                    <li>• Réservations: holds autorisés, confirmations ici</li>
                    <li>• Documents: upload passeports, factures, itinéraire</li>
                    <li>• Activité: audit complet par dossier</li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="text-sm text-slate-300">Pick a dossier to load workspace.</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}