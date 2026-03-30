"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAuthStore, isHQ } from "@/src/lib/authStore";
import { getSupabaseClient } from "@/src/lib/supabase/client";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center" style={{ height: 600 }}>
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  ),
});

/* ── Types ── */
interface Partner {
  id: string;
  name: string;
  type: "agency" | "agent" | "lead";
  city: string;
  lat: number;
  lng: number;
  agents?: number;
  status?: string;
  created_at: string;
}

/* ── City coordinates ── */
const CITY_COORDS: Record<string, [number, number]> = {
  montreal: [45.5017, -73.5673],
  montréal: [45.5017, -73.5673],
  quebec: [46.8139, -71.208],
  québec: [46.8139, -71.208],
  laval: [45.6066, -73.7124],
  gatineau: [45.4765, -75.7013],
  sherbrooke: [45.4042, -71.8929],
  toronto: [43.6532, -79.3832],
  ottawa: [45.4215, -75.6972],
  vancouver: [49.2827, -123.1207],
  calgary: [51.0447, -114.0719],
  halifax: [44.6488, -63.5752],
  longueuil: [45.5312, -73.5185],
  terrebonne: [45.7053, -73.6373],
  "trois-rivières": [46.3432, -72.5418],
  "trois-rivieres": [46.3432, -72.5418],
  lévis: [46.8032, -71.1779],
  levis: [46.8032, -71.1779],
  saguenay: [48.4279, -71.0548],
  repentigny: [45.7422, -73.4502],
  brossard: [45.4584, -73.4551],
  drummondville: [45.8838, -72.4843],
  "saint-jean-sur-richelieu": [45.3071, -73.2628],
  rimouski: [48.449, -68.5236],
  victoriaville: [46.05, -71.9667],
  granby: [45.4, -72.7333],
  blainville: [45.6697, -73.8771],
  winnipeg: [49.8951, -97.1384],
  edmonton: [53.5461, -113.4938],
  mississauga: [43.589, -79.6441],
  hamilton: [43.2557, -79.8711],
  "quebec city": [46.8139, -71.208],
};

function getCityCoords(city: string): [number, number] {
  const key = (city || "").trim().toLowerCase();
  if (CITY_COORDS[key]) return CITY_COORDS[key];
  // Slight random offset around Quebec for unknown cities
  return [46.8 + (Math.random() - 0.5) * 0.6, -71.2 + (Math.random() - 0.5) * 0.6];
}

/* ── Styling constants ── */
const TYPE_COLORS: Record<string, string> = {
  agency: "#3B82F6",
  agent: "#10B981",
  lead: "#F59E0B",
};

const TYPE_LABELS: Record<string, string> = {
  agency: "Agency",
  agent: "Agent",
  lead: "Signed Lead",
};

const TYPE_BG: Record<string, string> = {
  agency: "bg-blue-100 text-blue-700",
  agent: "bg-green-100 text-green-700",
  lead: "bg-amber-100 text-amber-700",
};

export default function NetworkMapPage() {
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);

  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "agency" | "agent" | "lead">("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { client } = getSupabaseClient();

        // Fetch active agencies
        const { data: agencies } = await client
          .from("agencies")
          .select("id, name, city, created_at, status")
          .eq("status", "active")
          .order("created_at", { ascending: false });

        const agencyPartners: Partner[] = (agencies || []).map(
          (a: { id: string; name: string; city?: string; created_at: string; status?: string }) => {
            const city = a.city || "";
            const [lat, lng] = getCityCoords(city);
            return {
              id: a.id,
              name: a.name,
              type: "agency" as const,
              city,
              lat,
              lng,
              status: a.status,
              created_at: a.created_at,
            };
          }
        );

        // Fetch agents with an agency
        const { data: agents } = await client
          .from("profiles")
          .select("id, full_name, city, created_at, agency_name")
          .not("agency_name", "is", null)
          .order("created_at", { ascending: false });

        const agentPartners: Partner[] = (agents || []).map(
          (a: { id: string; full_name: string; city?: string; created_at: string; agency_name?: string }) => {
            const city = a.city || "";
            const [lat, lng] = getCityCoords(city);
            return {
              id: a.id,
              name: a.full_name || "Unnamed Agent",
              type: "agent" as const,
              city,
              lat,
              lng,
              created_at: a.created_at,
            };
          }
        );

        // Fetch signed leads
        const { data: leads } = await client
          .from("leads_business")
          .select("id, business_name, city, created_at, status")
          .eq("status", "signed")
          .order("created_at", { ascending: false });

        const leadPartners: Partner[] = (leads || []).map(
          (l: { id: string; business_name: string; city?: string; created_at: string; status?: string }) => {
            const city = l.city || "";
            const [lat, lng] = getCityCoords(city);
            return {
              id: l.id,
              name: l.business_name || "Unnamed Lead",
              type: "lead" as const,
              city,
              lat,
              lng,
              status: l.status,
              created_at: l.created_at,
            };
          }
        );

        setPartners([...agencyPartners, ...agentPartners, ...leadPartners]);
      } catch {
        setPartners([]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  /* ── Derived data ── */
  const filtered = partners.filter((p) => {
    if (filter === "all") return true;
    return p.type === filter;
  });

  const totalAgencies = partners.filter((p) => p.type === "agency").length;
  const totalAgents = partners.filter((p) => p.type === "agent").length;
  const totalLeads = partners.filter((p) => p.type === "lead").length;

  const cityMap = new Map<string, Partner[]>();
  filtered.forEach((p) => {
    const city = p.city || "Unknown";
    if (!cityMap.has(city)) cityMap.set(city, []);
    cityMap.get(city)!.push(p);
  });
  const cityGroups = Array.from(cityMap.entries())
    .map(([city, members]) => ({ city, members }))
    .sort((a, b) => b.members.length - a.members.length);

  const uniqueCities = new Set(filtered.map((p) => p.city || "Unknown")).size;
  const maxCount = cityGroups.length > 0 ? cityGroups[0].members.length : 1;

  const filterButtons: { key: typeof filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "agency", label: "Agency" },
    { key: "agent", label: "Agent" },
    { key: "lead", label: "Signed Lead" },
  ];

  return (
    <div className="min-h-screen bg-[#F3F6FB] p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">Network Map</h1>
        <p className="text-slate-500 text-sm mt-1">Partners by city and region</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="text-2xl font-black text-slate-800">{partners.length}</div>
          <div className="text-xs text-slate-500 mt-1">Total Partners</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="text-2xl font-black text-blue-600">{totalAgencies}</div>
          <div className="text-xs text-slate-500 mt-1">Agencies</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="text-2xl font-black text-green-600">{totalAgents}</div>
          <div className="text-xs text-slate-500 mt-1">Agents</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="text-2xl font-black text-purple-600">{uniqueCities}</div>
          <div className="text-xs text-slate-500 mt-1">Cities</div>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-700 font-medium">
            {filtered.length} partners across {uniqueCities} cities
          </p>
          <div className="flex gap-2">
            {filterButtons.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  filter === f.key
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-4">
            <MapView partners={filtered} typeColors={TYPE_COLORS} typeLabels={TYPE_LABELS} />
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mb-8 px-1">
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: TYPE_COLORS[key] }}
                />
                <span className="text-xs text-slate-600 font-medium">{label}</span>
              </div>
            ))}
          </div>

          {/* City breakdown */}
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">City Breakdown</h2>
          </div>

          {cityGroups.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
              <div className="text-slate-500 text-sm">No partners registered yet.</div>
            </div>
          ) : (
            <div className="space-y-3">
              {cityGroups.map((group) => (
                <div
                  key={group.city}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{group.city}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                        {group.members.length}
                      </span>
                    </div>
                  </div>

                  {/* Horizontal bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max((group.members.length / maxCount) * 100, 5)}%`,
                      }}
                    />
                  </div>

                  {/* Partner entries */}
                  <div className="space-y-2">
                    {group.members.map((partner) => (
                      <div
                        key={partner.id}
                        className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-900 font-medium">{partner.name}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              TYPE_BG[partner.type] || "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {TYPE_LABELS[partner.type] || partner.type}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          {new Date(partner.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
