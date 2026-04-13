"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Template { id: string; name: string; subject: string; html_body: string; preview_text: string | null; audience_type: string; is_default: boolean; created_at: string; }

const audienceColors: Record<string, string> = { travelers: "bg-emerald-100 text-emerald-700", agents: "bg-blue-100 text-blue-700", agencies: "bg-violet-100 text-violet-700", all: "bg-slate-100 text-slate-700" };

function stripHtml(html: string) {
  if (typeof document !== "undefined") { const tmp = document.createElement("div"); tmp.innerHTML = html; return (tmp.textContent || "").slice(0, 120); }
  return html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").slice(0, 120);
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", subject: "", preview_text: "", audience_type: "all", html_body: "" });
  const [saving, setSaving] = useState(false);

  const showToastMsg = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try { const res = await fetch("/api/outreach/templates"); if (res.ok) { const data = await res.json(); setTemplates(data.templates || []); } } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const handleCreate = async () => {
    if (!form.name || !form.subject || !form.html_body) return;
    setSaving(true);
    try { const res = await fetch("/api/outreach/templates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); if (res.ok) { showToastMsg("Template created"); setShowCreate(false); setForm({ name: "", subject: "", preview_text: "", audience_type: "all", html_body: "" }); fetchTemplates(); } } catch { showToastMsg("Failed"); } finally { setSaving(false); }
  };

  const handleDuplicate = async (t: Template) => {
    await fetch("/api/outreach/templates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Copy of " + t.name, subject: t.subject, html_body: t.html_body, preview_text: t.preview_text, audience_type: t.audience_type }) });
    fetchTemplates(); showToastMsg("Template duplicated");
  };

  const handleDelete = (id: string) => { if (!confirm("Delete this template?")) return; setTemplates((prev) => prev.filter((t) => t.id !== id)); showToastMsg("Template deleted"); };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {toast && <div className="fixed top-4 right-4 z-50 bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg">{toast}</div>}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-900">Email Templates</h2>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700">+ Create Template</button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1, 2, 3].map((i) => <div key={i} className="h-48 bg-white rounded-xl border border-slate-200 animate-pulse" />)}</div>
      ) : templates.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center"><div className="text-4xl mb-3">{"\ud83d\udcdd"}</div><p className="text-lg font-semibold text-slate-700">No templates yet</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <div key={t.id} className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-slate-900 text-sm truncate flex-1">{t.name}</h3>
                <div className="flex gap-1 ml-2 flex-shrink-0">
                  {t.is_default && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">Default</span>}
                  <span className={"px-2 py-0.5 rounded-full text-[10px] font-bold " + (audienceColors[t.audience_type] || audienceColors.all)}>{t.audience_type}</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-1 font-medium truncate">{t.subject}</p>
              <p className="text-xs text-slate-400 mb-3 flex-1">{stripHtml(t.html_body)}...</p>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-[11px] text-slate-400">{new Date(t.created_at).toLocaleDateString("en-CA")}</span>
                <div className="flex gap-2">
                  <Link href={"/agent/outreach/new?templateId=" + t.id} className="text-xs text-violet-600 hover:text-violet-800 font-semibold">Use</Link>
                  <button onClick={() => handleDuplicate(t)} className="text-xs text-slate-500 hover:text-slate-700 font-semibold">Duplicate</button>
                  {!t.is_default && <button onClick={() => handleDelete(t.id)} className="text-xs text-red-500 hover:text-red-700 font-semibold">Delete</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Create Template</h3>
            <div className="space-y-3">
              <div><label className="text-xs font-semibold text-slate-600 uppercase">Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none" /></div>
              <div><label className="text-xs font-semibold text-slate-600 uppercase">Subject</label><input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none" /></div>
              <div><label className="text-xs font-semibold text-slate-600 uppercase">Audience</label><select value={form.audience_type} onChange={(e) => setForm({ ...form, audience_type: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"><option value="all">All</option><option value="travelers">Travelers</option><option value="agents">Agents</option><option value="agencies">Agencies</option></select></div>
              <div><label className="text-xs font-semibold text-slate-600 uppercase">HTML Body</label><textarea value={form.html_body} onChange={(e) => setForm({ ...form, html_body: e.target.value })} rows={10} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-violet-500 focus:outline-none" /></div>
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleCreate} disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg disabled:opacity-50">{saving ? "Creating..." : "Save Template"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
