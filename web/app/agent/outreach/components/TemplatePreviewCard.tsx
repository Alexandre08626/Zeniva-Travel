"use client";

import { useState } from "react";

interface TemplatePreviewCardProps {
  html: string;
  subject: string;
  suggestedName: string;
  onSaved?: () => void;
}

export default function TemplatePreviewCard({ html, subject, suggestedName, onSaved }: TemplatePreviewCardProps) {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(suggestedName);
  const [audienceType, setAudienceType] = useState("all");
  const [editSubject, setEditSubject] = useState(subject);
  const [showHtml, setShowHtml] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSave = async () => {
    if (!name || !editSubject) return;
    setSaving(true);
    try {
      const res = await fetch("/api/outreach/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          subject: editSubject,
          html_body: html,
          audience_type: audienceType,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setShowSaveModal(false);
        onSaved?.();
      }
    } catch { /* silent */ } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-2 rounded-xl border border-violet-200 bg-violet-50/50 overflow-hidden">
      {/* Preview */}
      <div className="bg-white p-1">
        <iframe
          srcDoc={html}
          title="Template Preview"
          sandbox="allow-same-origin"
          className="w-full border-0 rounded-lg"
          style={{ height: 320 }}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-violet-200">
        {!saved ? (
          <button
            onClick={() => setShowSaveModal(true)}
            className="px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-semibold hover:bg-violet-700"
          >
            Save as Template
          </button>
        ) : (
          <span className="text-xs font-semibold text-emerald-600">Saved!</span>
        )}
        <button
          onClick={() => setShowHtml(!showHtml)}
          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
        >
          {showHtml ? "Hide HTML" : "View HTML"}
        </button>
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
        >
          {copied ? "Copied!" : "Copy HTML"}
        </button>
      </div>

      {/* Raw HTML view */}
      {showHtml && (
        <div className="px-3 pb-3">
          <pre className="bg-slate-900 text-slate-200 text-xs p-3 rounded-lg overflow-x-auto max-h-48 overflow-y-auto font-mono">
            {html}
          </pre>
        </div>
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Save Template</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Template Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  placeholder="e.g. Welcome Travel Email"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Subject Line</label>
                <input
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Audience</label>
                <select
                  value={audienceType}
                  onChange={(e) => setAudienceType(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                >
                  <option value="all">All</option>
                  <option value="travelers">Travelers</option>
                  <option value="agents">Agents</option>
                  <option value="agencies">Agencies</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-5">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !name || !editSubject}
                className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Template"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
