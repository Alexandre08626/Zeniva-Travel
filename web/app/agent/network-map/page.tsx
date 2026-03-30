"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getSupabaseClient } from "@/src/lib/supabase/client";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] rounded-2xl bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 text-sm">
      Loading map...
    </div>
  ),
});

/* ── Types ── */
interface MapPin {
  id: string;
  name: string;
  type: string;
  city: string;
  lat: number;
  lng: number;
  extra?: string;
  created_at: string;
}

/* ── City coordinates (Canadian cities for agents/agencies) ── */
const CITY_COORDS: Record<string, [number, number]> = {
  montreal: [45.5017, -73.5673],
  "montréal": [45.5017, -73.5673],
  quebec: [46.8139, -71.208],
  "québec": [46.8139, -71.208],
  "quebec city": [46.8139, -71.208],
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
  "lévis": [46.8032, -71.1779],
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
};

/* ── Destination coordinates (travel destinations for traveler leads) ── */
const DEST_COORDS: Record<string, [number, number]> = {
  mexico: [23.6345, -102.5528],
  cancun: [21.1619, -86.8515],
  "punta cana": [18.5601, -68.3725],
  disney: [28.3852, -81.5639],
  paris: [48.8566, 2.3522],
  tulum: [20.2114, -87.4654],
  bali: [-8.3405, 115.092],
  "dominican republic": [18.7357, -70.1627],
  bahamas: [25.0343, -77.3963],
  "st. lucia": [13.9094, -60.9789],
  "saint vincent": [13.2528, -61.1971],
  "fort lauderdale": [26.1224, -80.1373],
  hollywood: [26.0112, -80.1495],
  "pompano beach": [26.2379, -80.1248],
  "playa del carmen": [20.6296, -87.0739],
  cuba: [21.5218, -77.7812],
  jamaica: [18.1096, -77.2975],
  aruba: [12.5093, -69.9688],
  "costa rica": [9.7489, -83.7534],
  hawaii: [19.8968, -155.5828],
  maldives: [3.2028, 73.2207],
  greece: [39.0742, 21.8243],
  italy: [41.8719, 12.5674],
  spain: [40.4168, -3.7038],
  portugal: [38.7223, -9.1393],
  london: [51.5074, -0.1278],
  japan: [36.2048, 138.2529],
  thailand: [15.87, 100.9925],
  vietnam: [14.0583, 108.2772],
};

function getCityCoords(city: string): [number, number] {
  const key = (city || "").trim().toLowerCase();
  if (CITY_COORDS[key]) return CITY_COORDS[key];
  // Slight random offset around Quebec for unknown cities
  return [46.8 + (Math.random() - 0.5) * 0.6, -71.2 + (Math.random() - 0.5) * 0.6];
}

function getDestCoords(dest: string): [number, number] {
  const key = (dest || "").trim().toLowerCase();
  if (DEST_COORDS[key]) return DEST_COORDS[key];
  if (CITY_COORDS[key]) return CITY_COORDS[key];
  // Default with slight random offset over Caribbean
  return [20 + (Math.random() - 0.5) * 2, -60 + (Math.random() - 0.5) * 2];
}

/* ── Styling constants ── */
const typeColors: Record<string, string> = {
  agency: "#3B82F6",
  agent: "#10B981",
  traveler: "#F59E0B",
  lead: "#8B5CF6",
};

const typeLabels: Record<string, string> = {
  agency: "Agency Partner",
  agent: "Travel Agent",
  traveler: "Traveler Lead",
  lead: "Signed B2B Lead",
};

type FilterKey = "all" | "agency" | "agent" | "traveler" | "lead";

export default function NetworkMapPage() {
  const [pins, setPins] = useState<MapPin[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { client } = getSupabaseClient();

        // 1. Agencies
        const { data: agencies } = await client
          .from("agencies")
          .select("id, name, city, config, domain, created_at")
          .order("created_at", { ascending: false });

        const agencyPins: MapPin[] = (agencies || []).map(
          (a: Record<string, unknown>) => {
            const cfg = (a.config as Record<string, unknown>) || {};
            const city = (cfg.city as string) || (a.city as string) || (a.domain as string) || "";
            const [lat, lng] = getCityCoords(city);
            return {
              id: a.id as string,
              name: (a.name as string) || "Unnamed Agency",
              type: "agency",
              city,
              lat,
              lng,
              created_at: a.created_at as string,
            };
          }
        );

        // 2. Agents (profiles with agency_name)
        const { data: agents } = await client
          .from("profiles")
          .select("id, full_name, city, created_at, agency_name")
          .not("agency_name", "is", null)
          .order("created_at", { ascending: false });

        const agentPins: MapPin[] = (agents || []).map(
          (a: Record<string, unknown>) => {
            const city = (a.city as string) || "";
            const [lat, lng] = getCityCoords(city);
            return {
              id: a.id as string,
              name: (a.full_name as string) || "Unnamed Agent",
              type: "agent",
              city,
              lat,
              lng,
              extra: a.agency_name as string,
              created_at: a.created_at as string,
            };
          }
        );

        // 3. Traveler leads (leads with destination)
        const { data: travelerLeads } = await client
          .from("leads")
          .select("id, first_name, last_name, destination, created_at")
          .not("destination", "is", null)
          .order("created_at", { ascending: false });

        const travelerPins: MapPin[] = (travelerLeads || []).map(
          (l: Record<string, unknown>) => {
            const dest = (l.destination as string) || "";
            const [lat, lng] = getDestCoords(dest);
            const firstName = (l.first_name as string) || "";
            const lastName = (l.last_name as string) || "";
            return {
              id: l.id as string,
              name: `${firstName} ${lastName}`.trim() || "Unnamed Traveler",
              type: "traveler",
              city: dest,
              lat,
              lng,
              extra: dest,
              created_at: l.created_at as string,
            };
          }
        );

        // 4. Signed B2B leads
        const { data: bizLeads } = await client
          .from("leads_business")
          .select("id, business_name, city, created_at, status")
          .eq("status", "signed")
          .order("created_at", { ascending: false });

        const bizPins: MapPin[] = (bizLeads || []).map(
          (l: Record<string, unknown>) => {
            const city = (l.city as string) || "";
            const [lat, lng] = getCityCoords(city);
            return {
              id: l.id as string,
              name: (l.business_name as string) || "Unnamed Lead",
              type: "lead",
              city,
              lat,
              lng,
              created_at: l.created_at as string,
            };
          }
        );

        setPins([...agencyPins, ...agentPins, ...travelerPins, ...bizPins]);
      } catch {
        setPins([]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  /* ── Derived data ── */
  const filtered = filter === "all" ? pins : pins.filter((p) => p.type === filter);

  const totalAgencies = pins.filter((p) => p.type === "agency").length;
  const totalAgents = pins.filter((p) => p.type === "agent").length;
  const totalTravelers = pins.filter((p) => p.type === "traveler").length;
  const totalLeads = pins.filter((p) => p.type === "lead").length;

  const filterButtons: { key: FilterKey; label: string; count: number }[] = [
    { key: "all", label: "All", count: pins.length },
    { key: "agency", label: "Agencies", count: totalAgencies },
    { key: "agent", label: "Agents", count: totalAgents },
    { key: "traveler", label: "Travelers", count: totalTravelers },
    { key: "lead", label: "B2B Leads", count: totalLeads },
  ];

  return (
    <div className="min-h-screen bg-[#F3F6FB] p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">Network Map</h1>
        <p className="text-slate-500 text-sm mt-1">
          Agencies, agents, and traveler leads across all regions
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="text-2xl font-black text-slate-800">{filtered.length}</div>
          <div className="text-xs text-slate-500 mt-1">Total Pins on Map</div>
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
          <div className="text-2xl font-black text-amber-600">{totalTravelers}</div>
          <div className="text-xs text-slate-500 mt-1">Traveler Leads</div>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filterButtons.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              filter === f.key
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Map */}
      {loading ? (
        <div className="w-full h-[600px] rounded-2xl bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 text-sm">
          Loading map...
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-4">
            <MapView pins={filtered} typeColors={typeColors} typeLabels={typeLabels} />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-6 mb-8 px-1">
            {Object.entries(typeLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: typeColors[key] }}
                />
                <span className="text-xs text-slate-600 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
