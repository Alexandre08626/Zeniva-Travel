"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

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

interface RawPin {
  id: string;
  name: string;
  type: "agency" | "agent" | "traveler" | "lead";
  city: string;
  extra?: string;
  created_at: string;
}

interface ApiResponse {
  ok: boolean;
  pins: RawPin[];
  counts: {
    agencies: number;
    agents: number;
    travelers: number;
    leads: number;
    total: number;
  };
}

/* ── Comprehensive coordinate lookup ── */
const COORDS: Record<string, [number, number]> = {
  // Quebec/Canada cities (where agents/agencies are)
  "montreal": [45.5017, -73.5673], "quebec": [46.8139, -71.2080], "laval": [45.6066, -73.7124],
  "gatineau": [45.4765, -75.7013], "sherbrooke": [45.4042, -71.8929], "terrebonne": [45.7005, -73.6372],
  "boisbriand": [45.6166, -73.8386], "monteregie": [45.5, -73.2], "markham": [43.8561, -79.3370],
  "toronto": [43.6532, -79.3832], "ottawa": [45.4215, -75.6972], "vancouver": [49.2827, -123.1207],
  "calgary": [51.0447, -114.0719], "victoria": [48.4284, -123.3656], "halifax": [44.6488, -63.5752],
  // Travel destinations (where travelers are going)
  "mexico": [23.6345, -102.5528], "cancun": [21.1619, -86.8515], "punta cana": [18.5601, -68.3725],
  "disney": [28.3852, -81.5639], "paris": [48.8566, 2.3522], "tulum": [20.2114, -87.4654],
  "bali": [-8.3405, 115.0920], "dominican republic": [18.7357, -70.1627], "bahamas": [25.0343, -77.3963],
  "st. lucia": [13.9094, -60.9789], "saint vincent": [13.2528, -61.1971], "sandals saint vincent": [13.2528, -61.1971],
  "sandals st. lucia": [13.9094, -60.9789], "fort lauderdale": [26.1224, -80.1373],
  "hollywood": [26.0112, -80.1495], "pompano beach": [26.2379, -80.1248], "playa del carmen": [20.6296, -87.0739],
  "cuba": [21.5218, -77.7812], "jamaica": [18.1096, -77.2975], "hawaii": [19.8968, -155.5828],
  "puerto rico": [18.2208, -66.5901], "london": [51.5074, -0.1278], "japan": [36.2048, 138.2529],
  "dubai": [25.2048, 55.2708], "florida": [27.6648, -81.5158], "wisconsin": [43.7844, -88.7879],
  "america": [39.8283, -98.5795], "ciudad de mexico": [19.4326, -99.1332], "mexico city": [19.4326, -99.1332],
  "disney cruise": [28.3852, -81.5639], "disneyland": [33.8121, -117.9190],
  "amanpulo": [11.5, 119.8], "philippines": [12.8797, 121.7740], "young harris": [34.9334, -83.8471],
  "aika": [35.6762, 139.6503],
};

function getCoords(city: string): [number, number] {
  const key = (city || "").trim().toLowerCase();
  if (!key) return [20 + (Math.random() - 0.5) * 2, -60 + (Math.random() - 0.5) * 2];

  // Exact match
  if (COORDS[key]) return COORDS[key];

  // Fuzzy: check if any known key is contained in the city string, or vice versa
  for (const [k, v] of Object.entries(COORDS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }

  // Default with random offset
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
  lead: "B2B Lead",
};

type FilterKey = "all" | "agency" | "agent" | "traveler" | "lead";

export default function NetworkMapPage() {
  const [pins, setPins] = useState<MapPin[]>([]);
  const [counts, setCounts] = useState({ agencies: 0, agents: 0, travelers: 0, leads: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/network-map");
        const data: ApiResponse = await res.json();

        if (!data.ok) {
          setPins([]);
          return;
        }

        setCounts(data.counts);

        const mapped: MapPin[] = data.pins.map((p) => {
          const [lat, lng] = getCoords(p.city);
          return { ...p, lat, lng };
        });

        setPins(mapped);
      } catch {
        setPins([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ── Derived data ── */
  const filtered = filter === "all" ? pins : pins.filter((p) => p.type === filter);

  const filterButtons: { key: FilterKey; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.total },
    { key: "agency", label: "Agencies", count: counts.agencies },
    { key: "agent", label: "Agents", count: counts.agents },
    { key: "traveler", label: "Travelers", count: counts.travelers },
    { key: "lead", label: "B2B Leads", count: counts.leads },
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="text-2xl font-black text-slate-800">{counts.total}</div>
          <div className="text-xs text-slate-500 mt-1">Total Pins</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="text-2xl font-black text-blue-600">{counts.agencies}</div>
          <div className="text-xs text-slate-500 mt-1">Agencies</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="text-2xl font-black text-green-600">{counts.agents}</div>
          <div className="text-xs text-slate-500 mt-1">Agents</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="text-2xl font-black text-amber-600">{counts.travelers}</div>
          <div className="text-xs text-slate-500 mt-1">Travelers</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="text-2xl font-black text-purple-600">{counts.leads}</div>
          <div className="text-xs text-slate-500 mt-1">B2B Leads</div>
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
