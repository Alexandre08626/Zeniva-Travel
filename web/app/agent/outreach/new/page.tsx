"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import EmailEditor from "../components/EmailEditor";

interface Contact { id: string; email?: string; contact_email?: string; first_name?: string; last_name?: string; contact_name?: string; company_name?: string; city?: string; province?: string; phone?: string; contact_phone?: string; agent_type?: string; status: string; }
interface Template { id: string; name: string; subject: string; html_body: string; preview_text: string | null; }

const STEPS = ["Audience", "Compose", "Preview", "Send"];
const AUDIENCE_LABELS: Record<string, string> = { agencies: "Agencies", leads: "Traveler Leads", clients: "Zeniva Clients", agents: "Agent Leads" };
const AUDIENCE_STATUS: Record<string, string[]> = { agencies: ["new", "contacted", "demo_scheduled", "negotiating", "signed", "lost"], leads: ["new", "contacted", "followed_up", "qualified", "converted", "lost"], clients: ["client"], agents: ["new", "contacted", "qualified", "lost"] };
const AUDIENCE_VARS: Record<string, string[]> = { agencies: ["FIRST_NAME", "LAST_NAME", "FULL_NAME", "EMAIL", "COMPANY_NAME", "CITY", "PROVINCE", "PHONE"], leads: ["FIRST_NAME", "LAST_NAME", "FULL_NAME", "EMAIL", "PHONE"], clients: ["FIRST_NAME", "LAST_NAME", "FULL_NAME", "EMAIL", "PHONE"], agents: ["FIRST_NAME", "LAST_NAME", "FULL_NAME", "EMAIL", "PHONE"] };

function buildVariables(c: Contact, audience: string): Record<string, string> {
  if (audience === "agencies") { const parts = (c.contact_name || "").split(" "); return { FIRST_NAME: parts[0] || "", LAST_NAME: parts.slice(1).join(" "), FULL_NAME: c.contact_name || "", EMAIL: c.contact_email || "", COMPANY_NAME: c.company_name || "", CITY: c.city || "", PROVINCE: c.province || "", PHONE: c.contact_phone || "" }; }
  return { FIRST_NAME: c.first_name || "", LAST_NAME: c.last_name || "", FULL_NAME: [c.first_name, c.last_name].filter(Boolean).join(" "), EMAIL: c.email || "", PHONE: c.phone || "" };
}

function replaceVars(html: string, vars: Record<string, string>) { let r = html; for (const [k, v] of Object.entries(vars)) { r = r.replace(new RegExp("\\{\\{" + k + "\\}\\}", "g"), v || ""); } r = r.replace(/\{\{[A-Z_]+\}\}/g, ""); return r; }
function getName(c: Contact, a: string) { return a === "agencies" ? c.contact_name || "\u2014" : [c.first_name, c.last_name].filter(Boolean).join(" ") || "\u2014"; }
function getEmail(c: Contact, a: string) { return a === "agencies" ? c.contact_email : c.email; }

export default function NewCampaignPage() {
  const [step, setStep] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const [audience, setAudience] = useState("agencies");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [subject, setSubject] = useState("");
  const [htmlBody, setHtmlBody] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [fromName, setFromName] = useState("Alexandre Blais");
  const [fromEmail, setFromEmail] = useState("info@zeniva.ca");

  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [previewContact, setPreviewContact] = useState<Contact | null>(null);

  const [showAiCompose, setShowAiCompose] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiTone, setAiTone] = useState("professionnel et engageant");
  const [aiLoading, setAiLoading] = useState(false);

  const [campaignName, setCampaignName] = useState("");
  const [sendOption, setSendOption] = useState<"now" | "schedule" | "draft">("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState({ sent: 0, total: 0 });
  const [sendComplete, setSendComplete] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try { const params = new URLSearchParams({ audience, page: String(page), limit: String(limit) }); if (search) params.set("search", search); if (statusFilter !== "all") params.set("status", statusFilter); const res = await fetch("/api/outreach/contacts?" + params.toString()); if (res.ok) { const data = await res.json(); setContacts(data.contacts || []); setTotal(data.total || 0); } } catch { /* silent */ } finally { setLoading(false); }
  }, [audience, page, limit, search, statusFilter]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);
  useEffect(() => { setPage(1); }, [audience, search, statusFilter, limit]);
  useEffect(() => { fetch("/api/outreach/templates").then((r) => r.json()).then((d) => setTemplates(d.templates || [])).catch(() => {}); }, []);

  useEffect(() => { if (!templateId) return; const t = templates.find((x) => x.id === templateId); if (t) { setSubject(t.subject); setHtmlBody(t.html_body); setPreviewText(t.preview_text || ""); } }, [templateId, templates]);
  useEffect(() => { if (!campaignName && subject) setCampaignName(subject.slice(0, 50) + " - " + new Date().toLocaleDateString("en-CA")); }, [subject, campaignName]);

  const selectedCount = selectAll ? total : selected.size;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  function toggleContact(id: string) { setSelected((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; }); }
  function togglePageAll() { const all = contacts.every((c) => selected.has(c.id)); setSelected((prev) => { const n = new Set(prev); contacts.forEach((c) => { if (all) n.delete(c.id); else n.add(c.id); }); return n; }); }
  function getPreviewHtml() { if (previewContact) return replaceVars(htmlBody, buildVariables(previewContact, audience)); return htmlBody.replace(/\{\{[A-Z_]+\}\}/g, ""); }

  async function handleAiCompose() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/outreach/ai-compose", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: aiPrompt, audience, tone: aiTone }) });
      if (res.ok) {
        const data = await res.json();
        if (data.html) setHtmlBody(data.html);
        if (data.subject) setSubject(data.subject);
        setShowAiCompose(false);
        showToast("Email genere par Sofia AI");
      } else {
        const err = await res.json();
        showToast(err.error || "Erreur AI");
      }
    } catch { showToast("Erreur de connexion"); } finally { setAiLoading(false); }
  }

  async function handleSendTest() {
    try { const res = await fetch("/api/outreach/send-test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ html: getPreviewHtml(), subject, to: "info@zeniva.ca" }) }); showToast(res.ok ? "Test sent to info@zeniva.ca" : "Failed"); } catch { showToast("Failed"); }
  }

  async function handleSend() {
    setShowConfirm(false); setSending(true);
    const recs = (selectAll ? contacts : contacts.filter((c) => selected.has(c.id))).map((c) => ({ email: getEmail(c, audience) || "", name: getName(c, audience), company_name: c.company_name || null, variables: buildVariables(c, audience), source_table: audience === "agencies" ? "leads_business" : audience === "clients" ? "clients" : audience === "leads" ? "leads" : "agents", source_id: c.id })).filter((r) => r.email);
    setSendProgress({ sent: 0, total: recs.length });
    const status = sendOption === "now" ? "sending" : sendOption === "schedule" ? "scheduled" : "draft";
    try {
      const campRes = await fetch("/api/outreach/campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: campaignName, template_id: templateId || null, subject, html_body: htmlBody, preview_text: previewText, from_name: fromName, from_email: fromEmail, audience_type: audience, audience_filters: {}, status, scheduled_at: sendOption === "schedule" ? scheduleDate : null, recipients: recs }) });
      const campData = await campRes.json();
      if (!campRes.ok) {
        if (campRes.status === 401) { showToast("Session expired — please log in again"); window.location.href = "/login"; return; }
        showToast("Failed to create campaign: " + (campData.error || "Unknown error")); setSending(false); return;
      }
      if (sendOption === "now") { const sendRes = await fetch("/api/outreach/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ campaignId: campData.campaign.id }) }); const sendData = await sendRes.json(); setSendProgress({ sent: sendData.sent || 0, total: recs.length }); showToast((sendData.sent || 0) + " emails sent"); }
      else showToast(sendOption === "schedule" ? "Scheduled" : "Draft saved");
      setSendComplete(true);
    } catch { showToast("Error"); } finally { setSending(false); }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {toast && <div className="fixed top-4 right-4 z-50 bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg">{toast}</div>}

        <div className="flex items-center gap-4 mb-6">
          <Link href="/agent/outreach" className="text-slate-400 hover:text-slate-600 text-xl">{"\u2190"}</Link>
          <div><h1 className="text-2xl font-bold text-slate-900">New Campaign</h1><p className="text-sm text-slate-500">Create and send an email campaign</p></div>
        </div>

        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={"w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold " + (i <= step ? "bg-violet-600 text-white" : "bg-slate-200 text-slate-500")}>{i < step ? "\u2713" : i + 1}</div>
              <span className={"text-sm font-semibold " + (i <= step ? "text-violet-600" : "text-slate-400")}>{s}</span>
              {i < STEPS.length - 1 && <div className={"w-8 h-0.5 " + (i < step ? "bg-violet-600" : "bg-slate-200")} />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div>
            <div className="flex gap-2 mb-4">
              {(["agencies", "leads", "clients", "agents"] as const).map((a) => (<button key={a} onClick={() => { setAudience(a); setSelected(new Set()); setSelectAll(false); setStatusFilter("all"); }} className={"px-4 py-2 rounded-xl text-sm font-semibold " + (audience === a ? "bg-violet-600 text-white" : "bg-white border border-slate-200 text-slate-600")}>{AUDIENCE_LABELS[a]}</button>))}
            </div>
            <div className="flex flex-wrap gap-3 mb-4">
              <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 w-64" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"><option value="all">All statuses</option>{(AUDIENCE_STATUS[audience] || []).map((s) => <option key={s} value={s}>{s}</option>)}</select>
              <span className="text-sm text-violet-600 font-semibold self-center">{selectedCount} selected of {total}</span>
              <button onClick={() => { setSelectAll(!selectAll); setSelected(new Set()); }} className="text-sm text-violet-600 hover:text-violet-800 font-semibold self-center underline">{selectAll ? "Deselect all" : "Select all matching"}</button>
            </div>
            {totalPages > 1 && (<div className="flex items-center justify-between mb-3"><div className="flex gap-2">{[25, 50, 100].map((n) => (<button key={n} onClick={() => setLimit(n)} className={"px-3 py-1 rounded text-xs font-semibold " + (limit === n ? "bg-violet-600 text-white" : "bg-white border border-slate-200 text-slate-600")}>{n}</button>))}</div><div className="flex gap-2 items-center"><button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 rounded text-sm bg-white border border-slate-200 disabled:opacity-40">Prev</button><span className="text-sm text-slate-500">{"Page " + page + " of " + totalPages}</span><button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1 rounded text-sm bg-white border border-slate-200 disabled:opacity-40">Next</button></div></div>)}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-4">
              {loading ? (<div className="p-6 space-y-3">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />)}</div>) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200"><tr><th className="px-4 py-3 w-10"><input type="checkbox" checked={contacts.length > 0 && contacts.every((c) => selected.has(c.id))} onChange={togglePageAll} /></th><th className="text-left px-4 py-3 font-semibold text-slate-600">Name</th><th className="text-left px-4 py-3 font-semibold text-slate-600">Email</th>{audience === "agencies" && <th className="text-left px-4 py-3 font-semibold text-slate-600">Company</th>}<th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th></tr></thead>
                    <tbody>{contacts.map((c) => (<tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50"><td className="px-4 py-3"><input type="checkbox" checked={selectAll || selected.has(c.id)} onChange={() => toggleContact(c.id)} /></td><td className="px-4 py-3 font-medium text-slate-900">{getName(c, audience)}</td><td className="px-4 py-3 text-slate-600">{getEmail(c, audience) || "\u2014"}</td>{audience === "agencies" && <td className="px-4 py-3 text-slate-600">{c.company_name || "\u2014"}</td>}<td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">{c.status}</span></td></tr>))}</tbody>
                  </table>
                </div>
              )}
            </div>
            {totalPages > 1 && (<div className="flex items-center justify-between mb-6"><div className="flex gap-2">{[25, 50, 100].map((n) => (<button key={n} onClick={() => setLimit(n)} className={"px-3 py-1 rounded text-xs font-semibold " + (limit === n ? "bg-violet-600 text-white" : "bg-white border border-slate-200 text-slate-600")}>{n}</button>))}</div><div className="flex gap-2 items-center"><button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 rounded text-sm bg-white border border-slate-200 disabled:opacity-40">Prev</button><span className="text-sm text-slate-500">{"Page " + page + " of " + totalPages}</span><button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1 rounded text-sm bg-white border border-slate-200 disabled:opacity-40">Next</button></div></div>)}
            <div className="flex justify-end"><button onClick={() => setStep(1)} disabled={selectedCount === 0} className="px-6 py-2.5 bg-violet-600 text-white rounded-xl font-semibold text-sm hover:bg-violet-700 disabled:opacity-40">Next: Compose</button></div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <EmailEditor
              htmlBody={htmlBody} setHtmlBody={setHtmlBody}
              subject={subject} setSubject={setSubject}
              previewText={previewText} setPreviewText={setPreviewText}
              fromName={fromName} setFromName={setFromName}
              fromEmail={fromEmail} setFromEmail={setFromEmail}
              audience={audience} audienceVars={AUDIENCE_VARS[audience] || []}
              templateId={templateId} setTemplateId={setTemplateId}
              templates={templates}
              onAiCompose={() => setShowAiCompose(true)}
            />
            <div className="flex justify-between">
              <button onClick={() => setStep(0)} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm">Back</button>
              <button onClick={() => setStep(2)} disabled={!subject || !htmlBody} className="px-6 py-2.5 bg-violet-600 text-white rounded-xl font-semibold text-sm hover:bg-violet-700 disabled:opacity-40">Next: Preview</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  <button onClick={() => setPreviewMode("desktop")} className={"px-3 py-1.5 rounded-lg text-sm font-semibold " + (previewMode === "desktop" ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600")}>Desktop</button>
                  <button onClick={() => setPreviewMode("mobile")} className={"px-3 py-1.5 rounded-lg text-sm font-semibold " + (previewMode === "mobile" ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600")}>Mobile</button>
                </div>
                <div className="flex items-center gap-3">
                  <select value={previewContact?.id || ""} onChange={(e) => setPreviewContact(contacts.find((x) => x.id === e.target.value) || null)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm"><option value="">No personalization</option>{contacts.slice(0, 10).map((c) => <option key={c.id} value={c.id}>{getName(c, audience)}</option>)}</select>
                  <button onClick={handleSendTest} className="px-3 py-1.5 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700">Send Test</button>
                </div>
              </div>
              <div className="flex justify-center bg-slate-100 rounded-lg p-4">
                <iframe srcDoc={getPreviewHtml()} title="Preview" style={{ width: previewMode === "desktop" ? 620 : 375, height: 600, border: "1px solid #e2e8f0", borderRadius: 8, background: "white" }} />
              </div>
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm">Back</button>
              <button onClick={() => setStep(3)} className="px-6 py-2.5 bg-violet-600 text-white rounded-xl font-semibold text-sm hover:bg-violet-700">Next: Review</button>
            </div>
          </div>
        )}

        {step === 3 && !sendComplete && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Campaign Summary</h2>
              <div className="space-y-3">
                <div><label className="text-xs font-semibold text-slate-600 uppercase">Campaign Name</label><input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none" /></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 border-t border-b border-slate-100">
                  <div><p className="text-xs text-slate-500">Audience</p><p className="font-semibold text-slate-900 text-sm">{audience}</p></div>
                  <div><p className="text-xs text-slate-500">Recipients</p><p className="font-semibold text-slate-900 text-sm">{selectedCount}</p></div>
                  <div><p className="text-xs text-slate-500">Subject</p><p className="font-semibold text-slate-900 text-sm truncate">{subject}</p></div>
                  <div><p className="text-xs text-slate-500">From</p><p className="font-semibold text-slate-900 text-sm">{fromName}</p></div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold text-slate-700">Send Options</p>
                {(["now", "schedule", "draft"] as const).map((opt) => (<label key={opt} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50"><input type="radio" name="sendOption" checked={sendOption === opt} onChange={() => setSendOption(opt)} className="accent-violet-600" /><span className="text-sm font-medium text-slate-700">{opt === "now" ? "Send Now" : opt === "schedule" ? "Schedule" : "Save as Draft"}</span></label>))}
                {sendOption === "schedule" && <input type="datetime-local" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="mt-2 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none" />}
              </div>
            </div>
            {sending && (<div className="bg-white rounded-xl border border-slate-200 p-6"><p className="text-sm font-semibold text-slate-700 mb-2">{"Sending... " + sendProgress.sent + " / " + sendProgress.total}</p><div className="w-full bg-slate-200 rounded-full h-2"><div className="bg-violet-600 h-2 rounded-full transition-all" style={{ width: sendProgress.total > 0 ? (sendProgress.sent / sendProgress.total * 100) + "%" : "0%" }} /></div></div>)}
            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm">Back</button>
              <button onClick={() => sendOption === "now" ? setShowConfirm(true) : handleSend()} disabled={sending || !campaignName} className="px-6 py-2.5 bg-violet-600 text-white rounded-xl font-semibold text-sm hover:bg-violet-700 disabled:opacity-40">{sendOption === "now" ? "Send Now" : sendOption === "schedule" ? "Schedule" : "Save Draft"}</button>
            </div>
          </div>
        )}

        {sendComplete && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="text-4xl mb-3">{"\u2705"}</div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">{sendOption === "now" ? "Campaign Sent!" : sendOption === "schedule" ? "Scheduled!" : "Draft Saved!"}</h2>
            <p className="text-sm text-slate-500 mb-6">{sendOption === "now" ? sendProgress.sent + " emails delivered." : "Your campaign has been saved."}</p>
            <Link href="/agent/outreach" className="inline-block px-6 py-2.5 bg-violet-600 text-white rounded-xl font-semibold text-sm hover:bg-violet-700">View Campaigns</Link>
          </div>
        )}

        {showAiCompose && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 flex items-center justify-center text-white font-bold text-sm">S</div>
                <div><h3 className="text-lg font-bold text-slate-900">Sofia AI Compose</h3><p className="text-xs text-slate-500">Decris ton email et Sofia le genere</p></div>
              </div>
              <div className="space-y-3">
                <div><label className="text-xs font-semibold text-slate-600 uppercase">Decris ton email</label><textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} rows={4} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none" placeholder="Ex: Promotion ete 2026, forfaits tout-inclus au Mexique a partir de 899$, offre limitee..." /></div>
                <div><label className="text-xs font-semibold text-slate-600 uppercase">Ton</label><select value={aiTone} onChange={(e) => setAiTone(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"><option value="professionnel et engageant">Professionnel</option><option value="chaleureux et amical">Chaleureux</option><option value="urgent et persuasif">Urgent / Promo</option><option value="luxueux et exclusif">Luxe / Premium</option><option value="decontracte et fun">Decontracte</option></select></div>
                <div className="flex flex-wrap gap-1"><span className="text-[10px] text-slate-400 uppercase font-semibold mr-1">Audience:</span><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700">{audience}</span><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">{selectedCount + " contacts"}</span></div>
              </div>
              <div className="flex gap-3 justify-end mt-5">
                <button onClick={() => setShowAiCompose(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Annuler</button>
                <button onClick={handleAiCompose} disabled={aiLoading || !aiPrompt.trim()} className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 rounded-lg disabled:opacity-50 flex items-center gap-2">{aiLoading ? (<><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Sofia redige...</>) : "Generer l'email"}</button>
              </div>
            </div>
          </div>
        )}

        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Confirm Send</h3>
              <p className="text-sm text-slate-600 mb-4">{"You are about to send to " + selectedCount + " contacts. This cannot be undone."}</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowConfirm(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button onClick={handleSend} className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg">Send Now</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
