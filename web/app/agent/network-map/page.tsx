"use client";
import { useEffect, useState } from "react";
import { useAuthStore, isHQ } from "@/src/lib/authStore";
import { getSupabaseClient } from "@/src/lib/supabase/client";

interface Partner {
  id: string;
  name: string;
  type: "agency" | "agent";
  city: string;
  created_at: string;
}

interface CityGroup {
  city: string;
  partners: Partner[];
}

export default function NetworkMapPage() {
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);

  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "agencies" | "agents">("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { client } = getSupabaseClient();

        // Fetch agencies
        const { data: agencies } = await client
          .from("agencies")
          .select("id, name, created_at")
          .order("created_at", { ascending: false });

        const agencyPartners: Partner[] = (agencies || []).map((a: { id: string; name: string; created_at: string }) => ({
          id: a.id,
          name: a.name,
          type: "agency" as const,
          city: "",
          created_at: a.created_at,
        }));

        // Fetch agents from profiles
        const { data: agents } = await client
          .from("profiles")
          .select("id, full_name, city, created_at, role")
          .like("role", "%travel_agent%")
          .order("created_at", { ascending: false });

        const agentPartners: Partner[] = (agents || []).map((a: { id: string; full_name: string; city: string; created_at: string }) => ({
          id: a.id,
          name: a.full_name || "Unnamed Agent",
          type: "agent" as const,
          city: a.city || "",
          created_at: a.created_at,
        }));

        setPartners([...agencyPartners, ...agentPartners]);
      } catch {
        setPartners([]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = partners.filter((p) => {
    if (filter === "agencies") return p.type === "agency";
    if (filter === "agents") return p.type === "agent";
    return true;
  });

  // Group by city
  const cityMap = new Map<string, Partner[]>();
  filtered.forEach((p) => {
    const city = p.city || "Unknown";
    if (!cityMap.has(city)) cityMap.set(city, []);
    cityMap.get(city)!.push(p);
  });
  const cityGroups: CityGroup[] = Array.from(cityMap.entries())
    .map(([city, partners]) => ({ city, partners }))
    .sort((a, b) => b.partners.length - a.partners.length);

  const uniqueCities = new Set(filtered.map((p) => p.city || "Unknown")).size;
  const maxCount = cityGroups.length > 0 ? cityGroups[0].partners.length : 1;

  return (
    <div className="min-h-screen bg-[#F3F6FB] p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">Network Map</h1>
        <p className="text-slate-500 text-sm mt-1">
          Partners by city and region
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="text-2xl font-black text-blue-600">{filtered.length}</div>
          <div className="text-xs text-slate-500 mt-1">Total Partners</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="text-2xl font-black text-purple-600">{uniqueCities}</div>
          <div className="text-xs text-slate-500 mt-1">Cities</div>
        </div>
      </div>

      {/* Subtitle */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-700 font-medium">
            {filtered.length} partners across {uniqueCities} cities
          </p>
          <div className="flex gap-2">
            {(["all", "agencies", "agents"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                  filter === f
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f === "all" ? "All" : f === "agencies" ? "Agencies" : "Agents"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* City list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
          <div className="text-4xl mb-3">🗺️</div>
          <div className="text-slate-500 text-sm">
            No partners registered yet.
          </div>
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
                    {group.partners.length}
                  </span>
                </div>
              </div>

              {/* Concentration bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max((group.partners.length / maxCount) * 100, 5)}%` }}
                />
              </div>

              {/* Partner entries */}
              <div className="space-y-2">
                {group.partners.map((partner) => (
                  <div
                    key={partner.id}
                    className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-900 font-medium">{partner.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          partner.type === "agency"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {partner.type === "agency" ? "Agency" : "Agent"}
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
    </div>
  );
}
