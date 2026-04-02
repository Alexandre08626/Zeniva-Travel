"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import TemplatePreviewCard from "./TemplatePreviewCard";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  template?: { html: string; subject: string; name: string } | null;
}

interface SofiaChatPanelProps {
  onClose?: () => void;
  campaignContext?: { campaignId?: string; campaignName?: string } | null;
}

const STORAGE_KEY = "sofia_chat_messages";
const SESSION_KEY = "sofia_chat_session";

const QUICK_ACTIONS = [
  { label: "Create Template", icon: "🎨", prompt: "Create a professional HTML email template for a travel campaign. Modern design with Zeniva brand colors." },
  { label: "Campaign Report", icon: "📊", prompt: "Give me a full report on my recent email campaign performance with actionable recommendations." },
  { label: "Subject Lines", icon: "💡", prompt: "Suggest 10 catchy subject lines for a travel email campaign that maximize open rates." },
  { label: "Follow-up Sequence", icon: "🔄", prompt: "Propose a 4-step follow-up email sequence to convert travel leads into clients." },
  { label: "Welcome Template", icon: "👋", prompt: "Create a welcome HTML email template for new leads who sign up on Zeniva Travel. Warm and professional." },
  { label: "A/B Analysis", icon: "🧪", prompt: "Help me plan an A/B test for my next email campaign. What elements to test and how to measure results?" },
];

function parseTemplate(reply: string): { html: string; subject: string; name: string; text: string } | null {
  const htmlMatch = reply.match(/TEMPLATE_START\n?([\s\S]*?)\n?TEMPLATE_END/);
  if (!htmlMatch) return null;
  const subjectMatch = reply.match(/TEMPLATE_SUBJECT:\s*(.+)/);
  const nameMatch = reply.match(/TEMPLATE_NAME:\s*(.+)/);
  return {
    html: htmlMatch[1].trim(),
    subject: subjectMatch?.[1]?.trim() || "",
    name: nameMatch?.[1]?.trim() || "Sofia Template",
    text: reply
      .replace(/TEMPLATE_START[\s\S]*?TEMPLATE_END/, "")
      .replace(/TEMPLATE_SUBJECT:\s*.+/, "")
      .replace(/TEMPLATE_NAME:\s*.+/, "")
      .trim(),
  };
}

function formatMessage(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n- /g, "\n<br/>• ")
    .replace(/\n(\d+)\.\s/g, "\n<br/>$1. ")
    .replace(/\n/g, "<br/>");
}

export default function SofiaChatPanel({ onClose, campaignContext }: SofiaChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => {
    if (typeof window === "undefined") return crypto.randomUUID();
    return localStorage.getItem(SESSION_KEY) || (() => { const id = crypto.randomUUID(); localStorage.setItem(SESSION_KEY, id); return id; })();
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load messages from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setMessages(JSON.parse(saved));
    } catch { /* silent */ }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-100)));
    }
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const history = messages.slice(-20).map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/sofia/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text.trim(),
          history,
          sessionId,
          context: {
            action: text.toLowerCase().includes("rapport") || text.toLowerCase().includes("report") || text.toLowerCase().includes("performance") || text.toLowerCase().includes("stats") ? "campaign_report" : text.toLowerCase().includes("template") || text.toLowerCase().includes("modele") || text.toLowerCase().includes("cree") ? "create_template" : "general",
            campaignId: campaignContext?.campaignId || undefined,
          },
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      const reply = data.reply || "Desolee, je n'ai pas pu traiter ta demande.";
      const template = parseTemplate(reply);

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: template ? template.text : reply,
        timestamp: Date.now(),
        template: template ? { html: template.html, subject: template.subject, name: template.name } : null,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Desolee, une erreur est survenue. Reessaie dans un moment.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [messages, isTyping, sessionId, campaignContext]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-violet-50 to-pink-50 flex-shrink-0">
        <div className="relative">
          <Image src="/agents/sofia.png" alt="Sofia" width={40} height={40} className="rounded-full ring-2 ring-violet-300" />
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-900">Sofia</h3>
          <p className="text-[11px] text-slate-500 truncate">Specialiste Email Marketing</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={clearChat} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg" title="Clear chat">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <Image src="/agents/sofia.png" alt="Sofia" width={64} height={64} className="rounded-full mx-auto mb-3 ring-4 ring-violet-100" />
            <h4 className="text-sm font-bold text-slate-900 mb-1">Hi! I&apos;m Sofia</h4>
            <p className="text-xs text-slate-500 mb-5 max-w-[280px] mx-auto">
              Your email marketing specialist at Zeniva. I create HTML templates, analyze your campaigns and help you convert more leads. Ask me anything!
            </p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => sendMessage(action.prompt)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-xl text-left transition-colors"
                >
                  <span className="text-base flex-shrink-0">{action.icon}</span>
                  <span className="text-[11px] font-semibold text-violet-700 leading-tight">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div className={msg.role === "user" ? "max-w-[80%]" : "max-w-[85%]"}>
              <div
                className={
                  msg.role === "user"
                    ? "bg-violet-600 text-white rounded-2xl rounded-br-md px-3.5 py-2.5 text-sm"
                    : "bg-slate-100 text-slate-800 rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm"
                }
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
              />
              {msg.template && (
                <TemplatePreviewCard
                  html={msg.template.html}
                  subject={msg.template.subject}
                  suggestedName={msg.template.name}
                />
              )}
              <p className="text-[10px] text-slate-400 mt-1 px-1">
                {new Date(msg.timestamp).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Campaign context indicator */}
      {campaignContext?.campaignName && (
        <div className="px-4 py-1.5 bg-violet-50 border-t border-violet-200 flex-shrink-0">
          <p className="text-[11px] text-violet-600 font-semibold truncate">
            Contexte: {campaignContext.campaignName}
          </p>
        </div>
      )}

      {/* Input */}
      <div className="px-3 py-3 border-t border-slate-200 flex-shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Demande a Sofia..."
            rows={1}
            className="flex-1 resize-none px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none focus:border-transparent max-h-32"
            style={{ minHeight: 42 }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="p-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-40 disabled:hover:bg-violet-600 transition-colors flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
