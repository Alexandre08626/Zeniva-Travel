"use client";
import { useState, useEffect, useRef } from "react";

const BLUE = "#0F6CF5";
const NAVY = "#0B1B4D";
const GOLD = "#E6B85A";
const GREEN = "#10B981";
const LIGHT = "#f8fafc";

type InvoiceItem = { description: string; qty: number; unitPrice: number };
type Invoice = {
  id: string;
  type: "outgoing" | "incoming";
  client_name?: string;
  client_email?: string;
  amount: number;
  currency: string;
  status: "draft" | "sent" | "paid" | "overdue" | "pending" | "cancelled";
  items: InvoiceItem[];
  notes?: string;
  due_date?: string;
  paid_at?: string;
  created_at: string;
  booking_id?: string;
  booking_ref?: string;
  trip_name?: string;
  trip_dates?: string;
  client_phone?: string;
  client_address?: string;
};

function fmt(n: number, cur = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: cur, minimumFractionDigits: 2 }).format(n);
}
function fmtDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

const STATUS_COLOR: Record<string, string> = {
  draft: "#94a3b8",
  sent: BLUE,
  paid: GREEN,
  overdue: "#ef4444",
  pending: GOLD,
  cancelled: "#64748b",
};

export default function InvoiceViewPage() {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Invoice>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const invoiceId = typeof window !== "undefined" ? window.location.pathname.split("/").pop() : "";
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  useEffect(() => {
    if (!invoiceId) return;
    // Try Supabase first
    fetch(`${SUPABASE_URL}/rest/v1/invoices?id=eq.${invoiceId}&select=*`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data[0]) {
          setInvoice(data[0]);
          setEditForm(data[0]);
        } else {
          // Fallback: demo invoice for testing
          const demo: Invoice = {
            id: invoiceId || "INV-2026-001",
            type: "outgoing",
            client_name: "Client Name",
            client_email: "client@email.com",
            amount: 7677,
            currency: "USD",
            status: "sent",
            items: [
              { description: "ZeniStay AIKA — 7 nights (March 21–28, 2026)", qty: 1, unitPrice: 7677 },
            ],
            notes: "Thank you for choosing Zeniva Travel. We look forward to making your trip unforgettable.",
            due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
            created_at: new Date().toISOString(),
          };
          setInvoice(demo);
          setEditForm(demo);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [invoiceId]);

  const handleSave = async () => {
    if (!invoice) return;
    setSaving(true);
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/invoices?id=eq.${invoice.id}`, {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(editForm),
      });
      setInvoice({ ...invoice, ...editForm } as Invoice);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: LIGHT }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
        <p style={{ color: "#64748b" }}>Loading invoice...</p>
      </div>
    </div>
  );

  if (!invoice) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p>Invoice not found.</p>
    </div>
  );

  const subtotal = invoice.items?.reduce((s, i) => s + i.qty * i.unitPrice, 0) || invoice.amount;
  const taxes = 0; // No taxes for now
  const total = subtotal + taxes;

  return (
    <div style={{ minHeight: "100vh", background: LIGHT, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .invoice-container { box-shadow: none !important; }
        }
      `}</style>

      {/* Action Bar */}
      <div className="no-print" style={{ background: NAVY, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => window.history.back()} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, padding: "8px 14px", color: "white", cursor: "pointer", fontSize: 13 }}>
            ← Back
          </button>
          <span style={{ color: "white", fontWeight: 700 }}>Invoice #{invoice.id.slice(0, 8).toUpperCase()}</span>
          <span style={{ background: STATUS_COLOR[invoice.status], color: "white", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
            {invoice.status.toUpperCase()}
          </span>
          {saved && <span style={{ color: GREEN, fontSize: 13, fontWeight: 700 }}>✓ Saved!</span>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {!editing ? (
            <>
              <button onClick={() => setEditing(true)} style={{ background: GOLD, color: NAVY, border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                ✏️ Edit
              </button>
              <button onClick={handlePrint} style={{ background: BLUE, color: "white", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                🖨️ Print / PDF
              </button>
              <button onClick={() => {
                const url = window.location.href;
                navigator.clipboard.writeText(url);
                alert("Invoice link copied!");
              }} style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
                🔗 Share Link
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { setEditing(false); setEditForm(invoice); }} style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} style={{ background: GREEN, color: "white", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                {saving ? "Saving..." : "💾 Save Changes"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* INVOICE DOCUMENT */}
      <div ref={printRef} className="invoice-container" style={{ maxWidth: 820, margin: "32px auto", background: "white", borderRadius: 16, boxShadow: "0 4px 32px rgba(0,0,0,0.10)", overflow: "hidden" }}>
        
        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${NAVY}, #1a2f6e)`, padding: "40px 48px", color: "white", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.5px" }}>✈️ Zeniva Travel</div>
            <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>Zeniva Travel LLC · Delaware, USA</div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>info@zeniva.ca · +1 (332) 290-0021</div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>zenivatravel.com</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 4 }}>INVOICE</div>
            <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "monospace" }}>
              #{(editForm.id || invoice.id).slice(0, 8).toUpperCase()}
            </div>
            <div style={{ marginTop: 12, background: STATUS_COLOR[editForm.status || invoice.status], borderRadius: 6, padding: "4px 12px", display: "inline-block", fontSize: 12, fontWeight: 700 }}>
              {(editForm.status || invoice.status).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Bill To + Dates */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ padding: "28px 48px", borderRight: "1px solid #f1f5f9" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" as const, marginBottom: 10, letterSpacing: "0.08em" }}>Bill To</div>
            {editing ? (
              <div style={{ display: "grid", gap: 8 }}>
                {[
                  { label: "Client Name", key: "client_name", ph: "Full name" },
                  { label: "Email", key: "client_email", ph: "email@example.com" },
                  { label: "Phone", key: "client_phone", ph: "+1 (xxx) xxx-xxxx" },
                  { label: "Address", key: "client_address", ph: "City, Country" },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 10, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 2 }}>{f.label}</label>
                    <input value={(editForm as Record<string,string>)[f.key] || ""} onChange={e => setEditForm(p => ({...p, [f.key]: e.target.value}))}
                      placeholder={f.ph} style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 6, padding: "6px 8px", fontSize: 13, boxSizing: "border-box" as const }} />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div style={{ fontWeight: 800, fontSize: 16, color: NAVY }}>{editForm.client_name || "—"}</div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{editForm.client_email || ""}</div>
                {editForm.client_phone && <div style={{ fontSize: 13, color: "#64748b" }}>{editForm.client_phone}</div>}
                {editForm.client_address && <div style={{ fontSize: 13, color: "#64748b" }}>{editForm.client_address}</div>}
              </>
            )}
          </div>
          <div style={{ padding: "28px 48px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" as const, marginBottom: 10, letterSpacing: "0.08em" }}>Invoice Details</div>
            <div style={{ display: "grid", gap: 6 }}>
              {[
                { label: "Date", value: fmtDate(invoice.created_at) },
                { label: "Due Date", value: editing ? null : fmtDate(editForm.due_date) },
                { label: "Booking Ref", value: editing ? null : (editForm.booking_ref || editForm.booking_id || "—") },
                { label: "Trip", value: editing ? null : (editForm.trip_name || "—") },
              ].map(r => r.value !== null ? (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "#94a3b8" }}>{r.label}</span>
                  <span style={{ fontWeight: 600, color: NAVY }}>{r.value}</span>
                </div>
              ) : null)}
              {editing && (
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 2 }}>Due Date</label>
                  <input type="date" value={editForm.due_date?.slice(0,10) || ""} onChange={e => setEditForm(p => ({...p, due_date: e.target.value}))}
                    style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 6, padding: "6px 8px", fontSize: 13, boxSizing: "border-box" as const }} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div style={{ padding: "32px 48px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: LIGHT }}>
                {["Description", "Qty", "Unit Price", "Total"].map((h, i) => (
                  <th key={h} style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, textAlign: i === 0 ? "left" as const : "right" as const, letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(editing ? editForm.items || invoice.items : invoice.items)?.map((item, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "14px 12px" }}>
                    {editing ? (
                      <input value={item.description} onChange={e => {
                        const items = [...(editForm.items || invoice.items)];
                        items[i] = { ...items[i], description: e.target.value };
                        setEditForm(p => ({...p, items}));
                      }} style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 6, padding: "6px 8px", fontSize: 13 }} />
                    ) : (
                      <span style={{ fontSize: 14, color: "#374151" }}>{item.description}</span>
                    )}
                  </td>
                  <td style={{ padding: "14px 12px", textAlign: "right" as const }}>
                    {editing ? (
                      <input type="number" value={item.qty} onChange={e => {
                        const items = [...(editForm.items || invoice.items)];
                        items[i] = { ...items[i], qty: parseInt(e.target.value) || 1 };
                        setEditForm(p => ({...p, items}));
                      }} style={{ width: 60, border: "1px solid #e2e8f0", borderRadius: 6, padding: "6px 8px", fontSize: 13, textAlign: "right" as const }} />
                    ) : (
                      <span style={{ fontSize: 14, color: "#374151" }}>{item.qty}</span>
                    )}
                  </td>
                  <td style={{ padding: "14px 12px", textAlign: "right" as const }}>
                    {editing ? (
                      <input type="number" value={item.unitPrice} onChange={e => {
                        const items = [...(editForm.items || invoice.items)];
                        items[i] = { ...items[i], unitPrice: parseFloat(e.target.value) || 0 };
                        setEditForm(p => ({...p, items}));
                      }} style={{ width: 100, border: "1px solid #e2e8f0", borderRadius: 6, padding: "6px 8px", fontSize: 13, textAlign: "right" as const }} />
                    ) : (
                      <span style={{ fontSize: 14, color: "#374151" }}>{fmt(item.unitPrice, invoice.currency)}</span>
                    )}
                  </td>
                  <td style={{ padding: "14px 12px", textAlign: "right" as const, fontWeight: 700, color: NAVY }}>
                    {fmt(item.qty * item.unitPrice, invoice.currency)}
                  </td>
                </tr>
              ))}
              {editing && (
                <tr>
                  <td colSpan={4} style={{ padding: "8px 12px" }}>
                    <button onClick={() => setEditForm(p => ({...p, items: [...(p.items || []), { description: "", qty: 1, unitPrice: 0 }]}))}
                      style={{ background: LIGHT, border: "1px dashed #e2e8f0", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", color: BLUE, fontWeight: 600 }}>
                      + Add Line Item
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
            <div style={{ minWidth: 280 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 14, color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>
                <span>Subtotal</span><span>{fmt(subtotal, invoice.currency)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 14, color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>
                <span>Taxes</span><span>$0.00</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", fontSize: 18, fontWeight: 900, color: NAVY }}>
                <span>TOTAL</span><span style={{ color: BLUE }}>{fmt(total, invoice.currency)}</span>
              </div>
              {invoice.status === "paid" && (
                <div style={{ background: "#dcfce7", borderRadius: 8, padding: "8px 12px", textAlign: "center" as const, fontSize: 13, fontWeight: 700, color: "#065f46" }}>
                  ✓ PAID {fmtDate(invoice.paid_at)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div style={{ padding: "0 48px 32px", borderTop: "1px solid #f1f5f9", paddingTop: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" as const, marginBottom: 8, letterSpacing: "0.08em" }}>Notes</div>
          {editing ? (
            <textarea value={editForm.notes || ""} onChange={e => setEditForm(p => ({...p, notes: e.target.value}))} rows={3}
              style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px", fontSize: 13, boxSizing: "border-box" as const, resize: "vertical" as const }} />
          ) : (
            <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{editForm.notes || "Thank you for choosing Zeniva Travel. We look forward to making your trip unforgettable."}</p>
          )}
        </div>

        {/* Footer */}
        <div style={{ background: LIGHT, padding: "20px 48px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>
            Zeniva Travel LLC · Delaware, USA · EIN: [your EIN]<br />
            info@zeniva.ca · zenivatravel.com · +1 (332) 290-0021
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", textAlign: "right" as const }}>
            Powered by ZeniPay™<br />
            Invoice generated {new Date().toLocaleDateString("en-US")}
          </div>
        </div>
      </div>

      {/* Bottom margin */}
      <div style={{ height: 60 }} />
    </div>
  );
}
