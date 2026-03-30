"use client";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

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

interface MapViewProps {
  partners: Partner[];
  typeColors: Record<string, string>;
  typeLabels: Record<string, string>;
}

export default function MapView({ partners, typeColors, typeLabels }: MapViewProps) {
  return (
    <MapContainer
      center={[46.8, -71.2]}
      zoom={6}
      style={{ height: 600, width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {partners.map((p) => (
        <CircleMarker
          key={p.id}
          center={[p.lat, p.lng]}
          radius={p.type === "agency" ? 10 : 7}
          pathOptions={{
            color: typeColors[p.type] || "#3B82F6",
            fillColor: typeColors[p.type] || "#3B82F6",
            fillOpacity: 0.8,
            weight: 2,
          }}
        >
          <Popup>
            <div style={{ minWidth: 160 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>
                {typeLabels[p.type] || p.type} &bull; {p.city}
              </div>
              {p.agents && (
                <div style={{ fontSize: 12, color: "#64748b" }}>{p.agents} agents</div>
              )}
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                Joined {new Date(p.created_at).toLocaleDateString()}
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
