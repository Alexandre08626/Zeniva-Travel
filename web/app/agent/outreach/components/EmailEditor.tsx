"use client";

import { useRef, useState, useEffect } from "react";
import { HTML_SNIPPETS } from "./HtmlSnippets";

interface EmailEditorProps {
  htmlBody: string;
  setHtmlBody: (v: string) => void;
  subject: string;
  setSubject: (v: string) => void;
  previewText: string;
  setPreviewText: (v: string) => void;
  fromName: string;
  setFromName: (v: string) => void;
  fromEmail: string;
  setFromEmail: (v: string) => void;
  audience: string;
  audienceVars: string[];
  templateId: string;
  setTemplateId: (v: string) => void;
  templates: { id: string; name: string; subject: string; html_body: string; preview_text: string | null }[];
  onAiCompose: () => void;
}

export default function EmailEditor({
  htmlBody, setHtmlBody, subject, setSubject,
  previewText, setPreviewText, fromName, setFromName,
  fromEmail, setFromEmail, audience, audienceVars,
  templateId, setTemplateId, templates, onAiCompose,
}: EmailEditorProps) {
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [debouncedHtml, setDebouncedHtml] = useState(htmlBody);
  const [showSnippets, setShowSnippets] = useState(false);

  // Debounced preview
  useEffect(() => {
    const t = setTimeout(() => setDebouncedHtml(htmlBody), 200);
    return () => clearTimeout(t);
  }, [htmlBody]);

  function insertAtCursor(text: string) {
    const ta = bodyRef.current;
    if (!ta) { setHtmlBody(htmlBody + text); return; }
    const s = ta.selectionStart;
    setHtmlBody(htmlBody.slice(0, s) + text + htmlBody.slice(ta.selectionEnd));
    setTimeout(() => { ta.focus(); ta.setSelectionRange(s + text.length, s + text.length); }, 0);
  }

  function insertVariable(v: string) {
    insertAtCursor("{{" + v + "}}");
  }

  function insertSnippet(html: string) {
    insertAtCursor("\n" + html + "\n");
    setShowSnippets(false);
  }

  return (
    <div className="space-y-4">
      {/* Top fields */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-700">Compose Email</h2>
          <button onClick={onAiCompose} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-500 text-white rounded-lg text-sm font-semibold hover:from-violet-700 hover:to-blue-600 shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
            Sofia AI Compose
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase">Template</label>
            <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none">
              <option value="">Custom (blank)</option>
              {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase">Subject *</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none" placeholder="Email subject" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase">Preview Text</label>
            <input value={previewText} onChange={(e) => setPreviewText(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase">From Name</label>
            <input value={fromName} onChange={(e) => setFromName(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase">From Email</label>
            <input value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none" />
          </div>
        </div>
      </div>

      {/* Side-by-side Editor + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Code Editor */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-200 bg-slate-50 flex-wrap">
            {/* Snippet buttons */}
            {HTML_SNIPPETS.slice(0, 5).map((s) => (
              <button
                key={s.label}
                onClick={() => insertSnippet(s.html)}
                className="px-2 py-1 text-xs font-semibold bg-white border border-slate-200 rounded hover:bg-violet-50 hover:border-violet-300 text-slate-600 hover:text-violet-700 transition-colors"
                title={s.label}
              >
                {s.icon}
              </button>
            ))}
            <div className="relative">
              <button
                onClick={() => setShowSnippets(!showSnippets)}
                className="px-2 py-1 text-xs font-semibold bg-white border border-slate-200 rounded hover:bg-violet-50 text-slate-600"
                title="More snippets"
              >
                +
              </button>
              {showSnippets && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowSnippets(false)} />
                  <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 w-48 py-1">
                    {HTML_SNIPPETS.map((s) => (
                      <button
                        key={s.label}
                        onClick={() => insertSnippet(s.html)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-violet-50 flex items-center gap-2"
                      >
                        <span className="w-5 text-center">{s.icon}</span>
                        <span className="text-slate-700">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="w-px h-5 bg-slate-200 mx-1" />

            {/* Variable buttons */}
            <div className="flex gap-1 flex-wrap">
              {audienceVars.slice(0, 4).map((v) => (
                <button
                  key={v}
                  onClick={() => insertVariable(v)}
                  className="px-1.5 py-0.5 text-[10px] font-mono bg-violet-50 text-violet-700 rounded hover:bg-violet-100 border border-violet-200"
                >
                  {"{{"}{v}{"}}"}
                </button>
              ))}
              {audienceVars.length > 4 && (
                <span className="text-[10px] text-slate-400 self-center">+{audienceVars.length - 4}</span>
              )}
            </div>
          </div>

          {/* Textarea */}
          <textarea
            ref={bodyRef}
            value={htmlBody}
            onChange={(e) => setHtmlBody(e.target.value)}
            className="flex-1 min-h-[400px] px-4 py-3 text-sm font-mono text-slate-800 focus:outline-none resize-none"
            placeholder="Write or paste your HTML email body..."
            spellCheck={false}
          />

          <div className="px-3 py-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">{htmlBody.length.toLocaleString()} chars</span>
            <span className="text-[11px] text-slate-400">HTML</span>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-slate-50">
            <span className="text-xs font-semibold text-slate-600">Live Preview</span>
            <div className="flex gap-1">
              <button
                onClick={() => setPreviewMode("desktop")}
                className={"px-2 py-1 rounded text-xs font-semibold " + (previewMode === "desktop" ? "bg-violet-600 text-white" : "bg-white border border-slate-200 text-slate-500")}
              >
                Desktop
              </button>
              <button
                onClick={() => setPreviewMode("mobile")}
                className={"px-2 py-1 rounded text-xs font-semibold " + (previewMode === "mobile" ? "bg-violet-600 text-white" : "bg-white border border-slate-200 text-slate-500")}
              >
                Mobile
              </button>
            </div>
          </div>
          <div className="flex-1 bg-slate-100 flex items-start justify-center p-4 overflow-auto">
            {debouncedHtml ? (
              <iframe
                srcDoc={debouncedHtml}
                title="Preview"
                className="bg-white border border-slate-200 rounded-lg shadow-sm"
                style={{
                  width: previewMode === "desktop" ? 600 : 375,
                  minHeight: 400,
                  height: "100%",
                  maxHeight: 600,
                }}
              />
            ) : (
              <div className="text-center py-20">
                <p className="text-4xl mb-2">{"\u2709\ufe0f"}</p>
                <p className="text-sm text-slate-500">Start typing HTML or use Sofia AI to generate your email</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
