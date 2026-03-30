"use client";

import React, { useEffect, useState, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Lead {
  id: string;
  type: "travel_agent" | "travel_agency";
  contact_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  company_name: string | null;
  website: string | null;
  number_of_agents: number | null;
  current_suppliers: string | null;
  city: string | null;
  province: string | null;
  status: string;
  source: string | null;
  priority: string;
  estimated_setup_value: number | null;
  estimated_monthly_value: number | null;
  notes: string | null;
  last_contacted_at: string | null;
  next_followup_at: string | null;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
}

type LeadStatus = "new" | "contacted" | "demo_scheduled" | "demo_done" | "negotiating" | "signed" | "lost";
type LeadPriority = "low" | "medium" | "high" | "urgent";

const STATUSES: LeadStatus[] = ["new", "contacted", "demo_scheduled", "demo_done", "negotiating", "signed", "lost"];
const PRIORITIES: LeadPriority[] = ["low", "medium", "high", "urgent"];
const SOURCES = ["website", "referral", "cold_call", "event", "linkedin", "google", "other"];

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  demo_scheduled: "Demo Scheduled",
  demo_done: "Demo Done",
  negotiating: "Negotiating",
  signed: "Signed",
  lost: "Lost",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  demo_scheduled: "bg-orange-100 text-orange-800",
  demo_done: "bg-purple-100 text-purple-800",
  negotiating: "bg-amber-100 text-amber-800",
  signed: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */

function fmt$(v: number | null | undefined) {
  if (v == null) return "--";
  return "$" + v.toLocaleString();
}

function fmtDate(d: string | null | undefined) {
  if (!d) return "--";
  return new Date(d).toLocaleDateString("en-CA");
}

function isOverdue(d: string | null | undefined) {
  if (!d) return false;
  return new Date(d) < new Date();
}

function calcEstimatedValues(type: string, numberOfAgents: number) {
  if (type === "travel_agency") {
    return {
      estimated_setup_value: 1999 + (numberOfAgents || 1) * 399,
      estimated_monthly_value: (numberOfAgents || 1) * 97,
    };
  }
  return { estimated_setup_value: 199, estimated_monthly_value: 97 };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function BusinessLeadsCRM() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);

  /* ----- Fetch ----- */
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== "all") params.set("type", filterType);
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (filterPriority !== "all") params.set("priority", filterPriority);
      const res = await fetch("/api/leads-business?" + params.toString());
      const json = await res.json();
      setLeads(json.leads || []);
    } catch {
      console.error("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus, filterPriority]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  /* ----- Stats ----- */
  const totalLeads = leads.length;
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const newThisWeek = leads.filter((l) => new Date(l.created_at) >= weekAgo).length;
  const demosScheduled = leads.filter((l) => l.status === "demo_scheduled").length;
  const pipelineValue = leads.reduce((s, l) => s + (l.estimated_setup_value || 0), 0);
  const signedCount = leads.filter((l) => l.status === "signed").length;
  const conversionRate = totalLeads > 0 ? ((signedCount / totalLeads) * 100).toFixed(1) : "0.0";

  /* ----- Delete handler ----- */
  async function handleDelete() {
    if (!deletingLead) return;
    await fetch(`/api/leads-business/${deletingLead.id}`, { method: "DELETE" });
    setDeletingLead(null);
    fetchLeads();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Business Leads CRM</h1>
          <p className="text-gray-500 text-sm mt-1">Manage travel agent and agency leads</p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: "Total Leads", value: totalLeads },
            { label: "New This Week", value: newThisWeek },
            { label: "Demos Scheduled", value: demosScheduled },
            { label: "Pipeline Value", value: fmt$(pipelineValue) },
            { label: "Conversion Rate", value: conversionRate + "%" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">{s.label}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap items-center gap-3">
          {/* Type toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            {[
              { val: "all", label: "All" },
              { val: "travel_agent", label: "Travel Agents" },
              { val: "travel_agency", label: "Travel Agencies" },
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => setFilterType(opt.val)}
                className={
                  "px-3 py-1.5 " +
                  (filterType === opt.val ? "bg-teal-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50")
                }
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Status dropdown */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white"
          >
            <option value="all">All Statuses</option>
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {STATUS_LABELS[st]}
              </option>
            ))}
          </select>

          {/* Priority dropdown */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white"
          >
            <option value="all">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>

          <div className="flex-1" />

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Add Lead
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Name / Company</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Priority</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Agents #</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Est. Value</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Last Contacted</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Next Follow-up</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                      No leads found. Click &quot;Add Lead&quot; to create one.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setEditingLead(lead)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{lead.contact_name}</div>
                        {lead.company_name && (
                          <div className="text-xs text-gray-500">{lead.company_name}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          {lead.type === "travel_agent" ? "Agent" : "Agency"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            "inline-block px-2 py-0.5 rounded text-xs font-medium " +
                            (STATUS_COLORS[lead.status] || "bg-gray-100 text-gray-700")
                          }
                        >
                          {STATUS_LABELS[lead.status] || lead.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            "inline-block px-2 py-0.5 rounded text-xs font-medium " +
                            (PRIORITY_COLORS[lead.priority] || "bg-gray-100 text-gray-700")
                          }
                        >
                          {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{lead.number_of_agents ?? "--"}</td>
                      <td className="px-4 py-3 text-gray-700">{fmt$(lead.estimated_setup_value)}</td>
                      <td className="px-4 py-3 text-gray-700">{fmtDate(lead.last_contacted_at)}</td>
                      <td className="px-4 py-3">
                        <span className={isOverdue(lead.next_followup_at) ? "text-red-600 font-medium" : "text-gray-700"}>
                          {fmtDate(lead.next_followup_at)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingLead(lead);
                          }}
                          className="text-red-500 hover:text-red-700 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <AddLeadModal
          onClose={() => setShowAddModal(false)}
          onSaved={() => {
            setShowAddModal(false);
            fetchLeads();
          }}
        />
      )}

      {/* Edit Lead Modal */}
      {editingLead && (
        <EditLeadModal
          lead={editingLead}
          onClose={() => setEditingLead(null)}
          onSaved={() => {
            setEditingLead(null);
            fetchLeads();
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deletingLead && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Lead</h3>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to delete the lead for <strong>{deletingLead.contact_name}</strong>? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingLead(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Add Lead Modal                                                     */
/* ------------------------------------------------------------------ */

function AddLeadModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: "travel_agent" as string,
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    company_name: "",
    website: "",
    number_of_agents: 1,
    current_suppliers: "",
    city: "",
    source: "website",
    priority: "medium",
    notes: "",
  });

  const isAgency = form.type === "travel_agency";
  const est = calcEstimatedValues(form.type, form.number_of_agents);

  function upd(field: string, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave() {
    if (!form.contact_name.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/leads-business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          estimated_setup_value: est.estimated_setup_value,
          estimated_monthly_value: est.estimated_monthly_value,
        }),
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full my-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Lead</h3>

        {/* Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <div className="flex gap-4">
            {[
              { val: "travel_agent", label: "Travel Agent" },
              { val: "travel_agency", label: "Travel Agency" },
            ].map((opt) => (
              <label key={opt.val} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value={opt.val}
                  checked={form.type === opt.val}
                  onChange={() => upd("type", opt.val)}
                  className="accent-teal-600"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* Contact Name */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.contact_name}
            onChange={(e) => upd("contact_name", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder="Full name"
          />
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.contact_email}
              onChange={(e) => upd("contact_email", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              value={form.contact_phone}
              onChange={(e) => upd("contact_phone", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Agency-specific fields */}
        {isAgency && (
          <>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={form.company_name}
                onChange={(e) => upd("company_name", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="text"
                  value={form.website}
                  onChange={(e) => upd("website", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Agents</label>
                <input
                  type="number"
                  min={1}
                  value={form.number_of_agents}
                  onChange={(e) => upd("number_of_agents", parseInt(e.target.value) || 1)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Suppliers</label>
              <textarea
                value={form.current_suppliers}
                onChange={(e) => upd("current_suppliers", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                rows={2}
              />
            </div>
          </>
        )}

        {/* City & Source & Priority */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => upd("city", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <select
              value={form.source}
              onChange={(e) => upd("source", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
            >
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => upd("priority", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => upd("notes", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            rows={3}
          />
        </div>

        {/* Estimated Value */}
        <div className="bg-teal-50 rounded-lg p-3 mb-4 text-sm text-teal-800">
          <strong>Estimated Value:</strong> {fmt$(est.estimated_setup_value)} setup + {fmt$(est.estimated_monthly_value)}
          /mo
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.contact_name.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Lead"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Edit Lead Modal                                                    */
/* ------------------------------------------------------------------ */

function EditLeadModal({ lead, onClose, onSaved }: { lead: Lead; onClose: () => void; onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: lead.type,
    contact_name: lead.contact_name || "",
    contact_email: lead.contact_email || "",
    contact_phone: lead.contact_phone || "",
    company_name: lead.company_name || "",
    website: lead.website || "",
    number_of_agents: lead.number_of_agents || 1,
    current_suppliers: lead.current_suppliers || "",
    city: lead.city || "",
    province: lead.province || "",
    source: lead.source || "website",
    priority: lead.priority || "medium",
    status: lead.status || "new",
    notes: lead.notes || "",
    last_contacted_at: lead.last_contacted_at ? lead.last_contacted_at.slice(0, 10) : "",
    next_followup_at: lead.next_followup_at ? lead.next_followup_at.slice(0, 10) : "",
    estimated_setup_value: lead.estimated_setup_value || 0,
    estimated_monthly_value: lead.estimated_monthly_value || 0,
  });

  const isAgency = form.type === "travel_agency";

  function upd(field: string, value: string | number) {
    setForm((f) => {
      const next = { ...f, [field]: value };
      // Recalc estimated values when type or number_of_agents changes
      if (field === "type" || field === "number_of_agents") {
        const t = field === "type" ? (value as string) : next.type;
        const n = field === "number_of_agents" ? (value as number) : next.number_of_agents;
        const est = calcEstimatedValues(t, n);
        next.estimated_setup_value = est.estimated_setup_value;
        next.estimated_monthly_value = est.estimated_monthly_value;
      }
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/leads-business/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          last_contacted_at: form.last_contacted_at || null,
          next_followup_at: form.next_followup_at || null,
        }),
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full my-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Lead</h3>

        {/* Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <div className="flex gap-4">
            {[
              { val: "travel_agent", label: "Travel Agent" },
              { val: "travel_agency", label: "Travel Agency" },
            ].map((opt) => (
              <label key={opt.val} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="edit_type"
                  value={opt.val}
                  checked={form.type === opt.val}
                  onChange={() => upd("type", opt.val)}
                  className="accent-teal-600"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => upd("status", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {STATUS_LABELS[st]}
              </option>
            ))}
          </select>
        </div>

        {/* Contact Name */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.contact_name}
            onChange={(e) => upd("contact_name", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.contact_email}
              onChange={(e) => upd("contact_email", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              value={form.contact_phone}
              onChange={(e) => upd("contact_phone", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Agency-specific fields */}
        {isAgency && (
          <>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={form.company_name}
                onChange={(e) => upd("company_name", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="text"
                  value={form.website}
                  onChange={(e) => upd("website", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Agents</label>
                <input
                  type="number"
                  min={1}
                  value={form.number_of_agents}
                  onChange={(e) => upd("number_of_agents", parseInt(e.target.value) || 1)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Suppliers</label>
              <textarea
                value={form.current_suppliers}
                onChange={(e) => upd("current_suppliers", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                rows={2}
              />
            </div>
          </>
        )}

        {/* City, Province, Source, Priority */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => upd("city", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
            <input
              type="text"
              value={form.province}
              onChange={(e) => upd("province", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <select
              value={form.source}
              onChange={(e) => upd("source", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
            >
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => upd("priority", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date pickers */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Contacted</label>
            <input
              type="date"
              value={form.last_contacted_at}
              onChange={(e) => upd("last_contacted_at", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Next Follow-up</label>
            <input
              type="date"
              value={form.next_followup_at}
              onChange={(e) => upd("next_followup_at", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => upd("notes", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            rows={3}
          />
        </div>

        {/* Estimated Value */}
        <div className="bg-teal-50 rounded-lg p-3 mb-4 text-sm text-teal-800">
          <strong>Estimated Value:</strong> {fmt$(form.estimated_setup_value)} setup +{" "}
          {fmt$(form.estimated_monthly_value)}/mo
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.contact_name.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Update Lead"}
          </button>
        </div>
      </div>
    </div>
  );
}
