"use client";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

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

interface MapViewProps {
  pins: MapPin[];
  typeColors: Record<string, string>;
  typeLabels: Record<string, string>;
}

export default function MapView({ pins, typeColors, typeLabels }: MapViewProps) {
  return (
    <MapContainer center={[25, -40]} zoom={3} style={{ height: 600, width: "100%" }} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; OpenStreetMap &copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/voyager/{z}/{x}/{y}{r}.png"
      />
      {pins.map((p) => (
        <CircleMarker key={p.id} center={[p.lat, p.lng]}
          radius={p.type === "agency" ? 12 : p.type === "agent" ? 9 : p.type === "traveler" ? 7 : 6}
          pathOptions={{ color: typeColors[p.type] || "#3B82F6", fillColor: typeColors[p.type] || "#3B82F6", fillOpacity: 0.7, weight: 2 }}>
          <Popup>
            <div style={{ minWidth: 160 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>{typeLabels[p.type] || p.type} &bull; {p.city}</div>
              {p.extra && <div style={{ fontSize: 12, color: "#64748b" }}>{p.extra}</div>}
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{new Date(p.created_at).toLocaleDateString()}</div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
