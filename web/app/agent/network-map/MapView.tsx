"use client";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface MapPin {
  id: string;
  name: string;
  type: string;
  city: string;
  lat: number;
  lng: number;
  [key: string]: any; // extra fields
}

interface MapViewProps {
  pins: MapPin[];
  typeColors: Record<string, string>;
  typeLabels: Record<string, string>;
  onPinClick?: (pin: MapPin) => void;
}

export default function MapView({ pins, typeColors, typeLabels, onPinClick }: MapViewProps) {
  return (
    <MapContainer
      center={[30, -40]}
      zoom={3}
      style={{ height: 700, width: "100%" }}
      scrollWheelZoom={true}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
      />
      {pins.map((p) => {
        const color = typeColors[p.type] || "#3B82F6";
        const radius = p.type === "agency" ? 14 : p.type === "lead" ? 12 : p.type === "agent" ? 10 : 8;

        return (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lng]}
            radius={radius}
            pathOptions={{
              color: "#fff",
              fillColor: color,
              fillOpacity: 0.85,
              weight: 3,
            }}
            eventHandlers={{
              click: () => onPinClick?.(p),
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={0.95} permanent={false}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>{p.city}</div>
            </Tooltip>
            <Popup maxWidth={320} minWidth={280}>
              <div style={{ padding: 4 }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%", background: color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 800, fontSize: 16,
                  }}>
                    {p.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: color, fontWeight: 600 }}>
                      {typeLabels[p.type] || p.type}
                    </div>
                  </div>
                </div>

                {/* Details based on type */}
                <div style={{ fontSize: 12, color: "#334155", lineHeight: 1.8 }}>
                  {/* Location */}
                  {p.city && (
                    <div>📍 <strong>{p.city}</strong></div>
                  )}

                  {/* Email */}
                  {p.email && !p.email.includes("zeniva-lead.com") && (
                    <div>✉️ <a href={"mailto:" + p.email} style={{ color: "#2563eb", textDecoration: "none" }}>{p.email}</a></div>
                  )}

                  {/* Phone */}
                  {p.phone && (
                    <div>📞 {p.phone}</div>
                  )}

                  {/* Website */}
                  {p.website && (
                    <div>🌐 <a href={"https://" + p.website.replace(/^https?:\/\//, "")} target="_blank" rel="noopener" style={{ color: "#2563eb", textDecoration: "none" }}>{p.website}</a></div>
                  )}

                  {/* Traveler specific */}
                  {p.type === "traveler" && (
                    <>
                      {p.destination && <div>✈️ Destination: <strong>{p.destination}</strong></div>}
                      {p.deal_value && <div>💰 Deal: <strong>${Number(p.deal_value).toLocaleString()}</strong></div>}
                      {p.source && <div>📍 Source: {p.source}</div>}
                      {p.status && <div>📊 Status: <span style={{
                        padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600,
                        background: p.status === "client" ? "#dcfce7" : p.status === "quoted" ? "#fef3c7" : "#dbeafe",
                        color: p.status === "client" ? "#166534" : p.status === "quoted" ? "#92400e" : "#1e40af",
                      }}>{p.status}</span></div>}
                      {p.language && <div>🗣️ Language: {p.language}</div>}
                    </>
                  )}

                  {/* Agency specific */}
                  {p.type === "agency" && (
                    <>
                      {p.status && <div>📊 Status: <span style={{
                        padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600,
                        background: p.status === "active" ? "#dcfce7" : "#fee2e2",
                        color: p.status === "active" ? "#166534" : "#991b1b",
                      }}>{p.status}</span></div>}
                    </>
                  )}

                  {/* Agent specific */}
                  {p.type === "agent" && (
                    <>
                      {p.agency && <div>🏢 Agency: {p.agency}</div>}
                      {p.specialties && Array.isArray(p.specialties) && p.specialties.length > 0 && (
                        <div>⭐ {p.specialties.join(", ")}</div>
                      )}
                      {p.languages && Array.isArray(p.languages) && p.languages.length > 0 && (
                        <div>🗣️ {p.languages.join(", ")}</div>
                      )}
                    </>
                  )}

                  {/* B2B Lead specific */}
                  {p.type === "lead" && (
                    <>
                      {p.contact && p.contact !== p.name && <div>👤 Contact: {p.contact}</div>}
                      {p.agents_count && <div>👥 Agents: <strong>{p.agents_count}</strong></div>}
                      {p.setup_value && <div>💰 Setup: <strong>${Number(p.setup_value).toLocaleString()}</strong></div>}
                      {p.priority && <div>🔥 Priority: <span style={{
                        padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600,
                        background: p.priority === "urgent" ? "#fee2e2" : p.priority === "high" ? "#fef3c7" : "#dbeafe",
                        color: p.priority === "urgent" ? "#991b1b" : p.priority === "high" ? "#92400e" : "#1e40af",
                      }}>{p.priority}</span></div>}
                      {p.status && <div>📊 Status: <span style={{
                        padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600,
                        background: p.status === "signed" ? "#dcfce7" : p.status === "contacted" ? "#fef3c7" : "#dbeafe",
                        color: p.status === "signed" ? "#166534" : p.status === "contacted" ? "#92400e" : "#1e40af",
                      }}>{p.status}</span></div>}
                      {p.source && <div>📍 Source: {p.source}</div>}
                      {p.suppliers && <div>🏷️ Suppliers: {p.suppliers}</div>}
                      {p.notes && <div style={{ marginTop: 4, padding: 6, background: "#f8fafc", borderRadius: 6, fontSize: 11, color: "#64748b" }}>📝 {p.notes.substring(0, 150)}{p.notes.length > 150 ? "..." : ""}</div>}
                      {p.next_followup && <div style={{ color: new Date(p.next_followup) < new Date() ? "#dc2626" : "#059669", fontWeight: 600 }}>📅 Follow-up: {new Date(p.next_followup).toLocaleDateString()}</div>}
                    </>
                  )}
                </div>

                {/* Footer */}
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #e2e8f0", fontSize: 11, color: "#94a3b8" }}>
                  Added {new Date(p.created_at).toLocaleDateString()}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
