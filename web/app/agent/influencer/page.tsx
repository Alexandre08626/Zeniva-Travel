"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRequirePermission } from "../../../src/lib/roleGuards";
import { normalizeRbacRole } from "../../../src/lib/rbac";

const BRAND_BLUE = "#0F6CF5";
const PREMIUM_BLUE = "#0B1B4D";
const GOLD = "#E6B85A";

// ─── Approved videos loaded dynamically from video queue ────────────────────
type ApprovedVideo = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  youtubeId: string;
  youtubeUrl: string;
  tags: string[];
  approved: boolean;
  approvedDate: string;
  category: string;
};

type Tab = "videos" | "mylinks" | "leads" | "commissions" | "brandkit" | "howto";

type Lead = {
  id: string;
  traveler_name?: string;
  traveler_email?: string;
  destination?: string;
  budget?: string;
  created_at?: string;
  status?: string;
};

export default function InfluencerPage() {
  const user = useRequirePermission("referrals:read", "/agent");
  const roles = user?.roles?.length ? user.roles : user?.role ? [user.role] : [];
  const effectiveRole = normalizeRbacRole(user?.effectiveRole) || normalizeRbacRole(roles[0]);
  const isHQ = effectiveRole === "hq" || effectiveRole === "admin";

  const [activeTab, setActiveTab] = useState<Tab>("videos");
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState({ clicks: 0, leads: 0, bookings: 0, commissionTotal: 0, commissionPending: 0, referralCode: "" });
  const [approvedVideos, setApprovedVideos] = useState<ApprovedVideo[]>([]);

  const siteBase = "https://www.zenivatravel.com";
  const refCode = stats.referralCode || (user?.email?.split("@")[0] ?? "ref");
  const myLink = `${siteBase}/forms/travel?agent=${encodeURIComponent(user?.email ?? refCode)}`;

  const videoShareLink = (videoId: string) =>
    `${siteBase}/forms/travel?agent=${encodeURIComponent(user?.email ?? refCode)}&video=${videoId}`;

  const copy = async (text: string, key: string) => {
    try { await navigator.clipboard.writeText(text); } catch {}
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  useEffect(() => {
    if (!user) return;
    fetch("/api/influencer/dashboard")
      .then(r => r.json())
      .then(p => {
        if (p?.data) {
          setStats(p.data);
          setLeads(p.data.leadsList || []);
        }
      })
      .catch(() => {});

    // Load published YouTube videos from queue
    fetch("/api/agents-proxy?endpoint=video-queue", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        const published = (d?.videos || [])
          .filter((v: any) => v.youtube_video_id && (v.status === "published" || v.status === "approved"))
          .map((v: any) => ({
            id: v.id,
            title: v.title || "Zeniva Travel Video",
            description: v.description || "Share this video with your audience to generate travel leads for your referral link.",
            thumbnail: `https://img.youtube.com/vi/${v.youtube_video_id}/maxresdefault.jpg`,
            youtubeId: v.youtube_video_id,
            youtubeUrl: v.youtube_url || `https://www.youtube.com/watch?v=${v.youtube_video_id}`,
            tags: ["Zeniva Travel", "Luxury Travel", "AI Travel"],
            approved: true,
            approvedDate: (v.actioned_at || v.generated_at || "").split("T")[0],
            category: "Travel",
          }));
        setApprovedVideos(published);
      })
      .catch(() => {});
  }, [user]);

  const TABS: { key: Tab; icon: string; label: string }[] = [
    { key: "videos", icon: "🎬", label: "Videos to Share" },
    { key: "mylinks", icon: "🔗", label: "My Links" },
    { key: "leads", icon: "🎯", label: "My Leads" },
    { key: "commissions", icon: "💰", label: "Commissions" },
    { key: "brandkit", icon: "🎨", label: "Brand Kit" },
    { key: "howto", icon: "📖", label: "How It Works" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-r from-[#0B1B4D] via-[#0F2060] to-[#0B1B4D]">
        {/* Glow orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 left-1/4 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -top-10 right-1/4 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-1.5">
                <span className="text-sm">⭐</span>
                <span className="text-xs font-bold uppercase tracking-widest text-yellow-300">Creator & Agent Hub</span>
              </div>
              <h1 className="text-4xl font-black text-white md:text-5xl">
                Share. Earn. <span style={{ color: GOLD }}>Win.</span>
              </h1>
              <p className="mt-2 max-w-lg text-blue-200">
                Share approved Zeniva videos with your audience. Every form filled becomes <strong className="text-white">your lead</strong>, every booking earns you a <strong className="text-white">commission.</strong>
              </p>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Clicks", value: stats.clicks, color: "text-blue-300" },
                { label: "Leads", value: stats.leads, color: "text-emerald-300" },
                { label: "Bookings", value: stats.bookings, color: "text-yellow-300" },
              ].map(s => (
                <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm">
                  <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                  <div className="mt-1 text-xs text-slate-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* My referral link highlight */}
          <div className="mt-6 flex flex-col items-start gap-3 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-blue-300">Your referral link</div>
              <div className="mt-1 font-mono text-sm font-bold text-white">{myLink}</div>
            </div>
            <button
              onClick={() => copy(myLink, "main")}
              className="flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white transition-all hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${BRAND_BLUE}, #4f46e5)` }}
            >
              {copied === "main" ? "✅ Copied!" : "📋 Copy my link"}
            </button>
          </div>
        </div>
      </div>

      {/* ── TABS ─────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex gap-1 overflow-x-auto py-3">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "text-white opacity-70 hover:bg-white/10 hover:opacity-100"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* ══ VIDEOS TAB ══ */}
        {activeTab === "videos" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">🎬 Approved Videos to Share</h2>
                <p className="mt-1 text-white/80">Each video has <strong className="text-white">your unique link</strong> built in → clients who fill out the form become your leads.</p>
              </div>
              {isHQ && (
                <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1.5 text-xs font-bold text-yellow-300">
                  HQ: {approvedVideos.length} approved video(s)
                </span>
              )}
            </div>

            {approvedVideos.length === 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
                <div className="text-5xl mb-3">🎬</div>
                <p className="text-white font-bold text-lg">No videos available yet</p>
                <p className="text-slate-400 text-sm mt-2">Videos will appear here once the boss approves them in the AI Agents panel.</p>
              </div>
            )}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {approvedVideos.map(video => (
                <div
                  key={video.id}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:shadow-2xl hover:shadow-blue-500/10"
                >
                  {/* Thumbnail / Player */}
                  <div className="relative aspect-video overflow-hidden rounded-t-3xl bg-slate-900">
                    {playingVideo === video.id ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
                        className="h-full w-full"
                        allow="autoplay; fullscreen"
                        allowFullScreen
                      />
                    ) : (
                      <>
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={e => { (e.target as HTMLImageElement).src = "https://placehold.co/640x360/0B1B4D/0F6CF5?text=Zeniva+Travel"; }}
                        />
                        {/* Play button */}
                        <button
                          onClick={() => setPlayingVideo(video.id)}
                          className="absolute inset-0 flex items-center justify-center bg-black/30 transition-all hover:bg-black/20"
                        >
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-2xl transition-transform hover:scale-110">
                            <svg className="ml-1 h-7 w-7 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </button>
                        {/* Approved badge */}
                        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
                          <span>✅</span> Approved
                        </div>
                        {/* Category */}
                        <div className="absolute right-3 top-3 rounded-full bg-blue-600/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                          {video.category}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="text-lg font-black text-white">{video.title}</h3>
                      <p className="mt-1 text-sm text-slate-400">{video.description}</p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {video.tags.map(tag => (
                        <span key={tag} className="rounded-full border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 text-xs text-blue-300">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Share link */}
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">Your share link</div>
                      <div className="mt-1 truncate font-mono text-xs text-blue-300">{videoShareLink(video.id)}</div>
                    </div>

                    {/* Actions */}
                    <a
                      href={video.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 text-sm font-bold text-red-300 transition-all hover:bg-red-500/20 mb-2"
                    >
                      ▶ Watch on YouTube
                    </a>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => copy(videoShareLink(video.id), video.id)}
                        className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 py-2.5 text-sm font-bold text-blue-300 transition-all hover:bg-blue-500/20"
                      >
                        {copied === video.id ? "✅ Copied!" : "📋 Copy link"}
                      </button>
                      <div className="grid grid-cols-3 gap-1">
                        {/* Instagram */}
                        <button
                          onClick={() => copy(`🌴 Planning your dream trip? Let Lina AI handle everything! ✈️\n\n${videoShareLink(video.id)}`, `ig-${video.id}`)}
                          title="Copy Instagram caption"
                          className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg transition-all hover:bg-white/10"
                        >
                          📸
                        </button>
                        {/* TikTok */}
                        <button
                          onClick={() => copy(`✈️ Lina AI will plan your perfect trip! Fill out the form 👇\n\n${videoShareLink(video.id)}`, `tt-${video.id}`)}
                          title="Copy TikTok caption"
                          className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg transition-all hover:bg-white/10"
                        >
                          🎵
                        </button>
                        {/* WhatsApp */}
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(`🌴 Zeniva Travel te planifie ton voyage de rêve! Regarde ça: ${videoShareLink(video.id)}`)}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Share on WhatsApp"
                          className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg transition-all hover:bg-white/10"
                        >
                          💬
                        </a>
                      </div>
                    </div>

                    {/* Caption presets */}
                    <details className="group/det">
                      <summary className="cursor-pointer text-xs font-semibold text-slate-500 hover:text-slate-300">
                        📝 View ready-to-use captions ▾
                      </summary>
                      <div className="mt-2 space-y-2">
                        {[
                          { platform: "Instagram/TikTok", text: `🌴 Dreaming of a luxury trip? Lina AI handles everything — hotels, flights, VIP experiences. Fill out the form and get your proposal in 24h! ✈️\n\n${videoShareLink(video.id)}\n\n#travel #luxurytravel #zenivatravel #aitravel` },
                          { platform: "Facebook/LinkedIn", text: `🚀 I work with Zeniva Travel — an AI travel agency that plans personalized luxury trips. Fill out their form and get a custom proposal in 24h. 100% free, no commitment.\n\n${videoShareLink(video.id)}` },
                          { platform: "WhatsApp/SMS", text: `Hey! Wanted to share this with you — Zeniva Travel creates dream trips with Lina AI. Fill out the form, it's free and you get a proposal in 24h: ${videoShareLink(video.id)}` },
                        ].map(c => (
                          <div key={c.platform} className="rounded-lg border border-white/5 bg-white/5 p-2">
                            <div className="text-[10px] font-bold text-slate-500">{c.platform}</div>
                            <p className="mt-1 text-xs text-slate-400 line-clamp-2">{c.text}</p>
                            <button
                              onClick={() => copy(c.text, `cap-${video.id}-${c.platform}`)}
                              className="mt-1.5 text-[10px] font-bold text-blue-400 hover:text-blue-300"
                            >
                              {copied === `cap-${video.id}-${c.platform}` ? "✅ Copied!" : "Copy →"}
                            </button>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                </div>
              ))}

              {/* Placeholder — more videos coming */}
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
                <div className="text-5xl mb-4">🎬</div>
                <h3 className="text-lg font-bold text-white">Prochaines vidéos</h3>
                <p className="mt-2 text-sm text-slate-500">New approved videos appear here automatically. Stay tuned!</p>
                {isHQ && (
                  <div className="mt-4 rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-3 text-xs text-yellow-300">
                    HQ: Approve videos in <a href="/ai-agents#approvals" className="underline">AI Agents → Approvals</a> — they appear here automatically.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ MY LINKS TAB ══ */}
        {activeTab === "mylinks" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white">🔗 Mes liens de partage</h2>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Main referral link */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Lien principal</div>
                <div className="mt-2 font-mono text-sm text-white break-all">{myLink}</div>
                <p className="mt-2 text-xs text-slate-500">Use this link in your bio, stories, everywhere.</p>
                <button onClick={() => copy(myLink, "main-tab")} className="mt-3 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
                  {copied === "main-tab" ? "✅ Copied!" : "📋 Copy"}
                </button>
              </div>

              {/* Form links for each video */}
              {approvedVideos.map(video => (
                <div key={video.id} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Formulaire — {video.title}</div>
                  <div className="mt-2 font-mono text-sm text-blue-300 break-all">{videoShareLink(video.id)}</div>
                  <p className="mt-2 text-xs text-slate-500">Les clients qui remplissent ce formulaire → ton lead direct.</p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => copy(videoShareLink(video.id), `link-${video.id}`)} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
                      {copied === `link-${video.id}` ? "✅ Copied!" : "📋 Copy"}
                    </button>
                    <a href={videoShareLink(video.id)} target="_blank" rel="noreferrer" className="rounded-xl border border-white/20 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/10">
                      👁️ Voir
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* QR Code placeholder */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="text-lg font-bold text-white">QR Code (bientôt)</h3>
              <p className="mt-1 text-sm text-slate-400">Un QR code imprimable pour tes événements, cartes de visite et présentations.</p>
            </div>
          </div>
        )}

        {/* ══ LEADS TAB ══ */}
        {activeTab === "leads" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-white">🎯 Mes leads</h2>
              <span className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-bold text-white">{leads.length} leads</span>
            </div>

            {leads.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 py-20 text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-white">Pas encore de leads</h3>
                <p className="mt-2 max-w-md text-slate-400">Partage une vidéo ou ton lien avec ton audience — chaque formulaire rempli apparaît ici instantanément.</p>
                <button onClick={() => setActiveTab("videos")} className="mt-5 rounded-full bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700">
                  🎬 View videos to share
                </button>
              </div>
            ) : (
              <div className="grid gap-3">
                {leads.map(lead => (
                  <div key={lead.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-lg font-black text-white">
                        {(lead.traveler_name || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-white">{lead.traveler_name || "Voyageur"}</div>
                        <div className="text-sm text-slate-400">{lead.traveler_email} · {lead.destination || "Destination à définir"}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {lead.budget && <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">{lead.budget}</span>}
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                        lead.status === "client" ? "bg-blue-500/20 text-blue-300" :
                        lead.status === "contacted" ? "bg-purple-500/20 text-purple-300" :
                        "bg-slate-500/20 text-slate-400"
                      }`}>{lead.status || "new"}</span>
                      <span className="text-xs text-slate-600">{lead.created_at ? new Date(lead.created_at).toLocaleDateString("fr-CA") : ""}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ COMMISSIONS TAB ══ */}
        {activeTab === "commissions" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white">💰 Mes commissions</h2>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                { label: "Total gagné", value: `$${Number(stats.commissionTotal || 0).toLocaleString()}`, color: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                { label: "En attente", value: `$${Number(stats.commissionPending || 0).toLocaleString()}`, color: "text-yellow-300", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
                { label: "Bookings", value: stats.bookings, color: "text-blue-300", bg: "bg-blue-500/10", border: "border-blue-500/20" },
              ].map(s => (
                <div key={s.label} className={`rounded-2xl border ${s.border} ${s.bg} p-6 backdrop-blur-sm`}>
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-500">{s.label}</div>
                  <div className={`mt-2 text-4xl font-black ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white mb-4">How do I earn commissions?</h3>
              <div className="grid gap-4 md:grid-cols-3 text-sm">
                {[
                  { step: "1", title: "You share", desc: "Share an approved video with your unique link on your social channels.", icon: "📲" },
                  { step: "2", title: "Client signs up", desc: "They fill out the form → they become your direct lead in the system.", icon: "✍️" },
                  { step: "3", title: "Lina closes the sale", desc: "Lina AI handles the conversation and finalizes the booking. Commission paid automatically!", icon: "💰" },
                ].map(s => (
                  <div key={s.step} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="text-3xl mb-2">{s.icon}</div>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Step {s.step}</div>
                    <div className="mt-1 font-bold text-white">{s.title}</div>
                    <div className="mt-1 text-slate-400">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ BRAND KIT TAB ══ */}
        {activeTab === "brandkit" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white">🎨 Brand Kit</h2>

            {/* Lina avatar + logo */}
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { title: "Zeniva Logo", url: "/branding/logo.png", desc: "Main logo", type: "PNG" },
                { title: "Lina Avatar", url: "/branding/lina-avatar.png", desc: "Official Lina avatar", type: "PNG" },
                { title: "Logo SVG", url: "/branding/logo.svg", desc: "Vector logo", type: "SVG" },
              ].map(asset => (
                <div key={asset.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <div className="flex h-24 items-center justify-center rounded-xl bg-white/5 mb-3">
                    <img src={asset.url} alt={asset.title} className="h-16 object-contain" />
                  </div>
                  <div className="font-bold text-white">{asset.title}</div>
                  <div className="text-xs text-slate-400">{asset.desc}</div>
                  <a href={asset.url} download className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10">
                    ⬇️ Download {asset.type}
                  </a>
                </div>
              ))}
            </div>

            {/* Colors */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white mb-4">Official Brand Colors</h3>
              <div className="grid gap-3 md:grid-cols-4">
                {[
                  { name: "Premium Blue", hex: "#0B1B4D", text: "white" },
                  { name: "Brand Blue", hex: "#0F6CF5", text: "white" },
                  { name: "Accent Gold", hex: "#E6B85A", text: "black" },
                  { name: "Pearl White", hex: "#F8FAFC", text: "black" },
                ].map(c => (
                  <button key={c.name} onClick={() => copy(c.hex, `color-${c.hex}`)} className="rounded-xl p-4 text-left transition-all hover:scale-105" style={{ background: c.hex }}>
                    <div className="text-sm font-bold" style={{ color: c.text }}>{c.name}</div>
                    <div className="text-xs font-mono" style={{ color: c.text, opacity: 0.7 }}>{copied === `color-${c.hex}` ? "✅ Copied!" : c.hex}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Captions */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white mb-4">📝 Approved Captions</h3>
              <div className="space-y-3">
                {[
                  "🌴 Planning a luxury trip? Lina AI handles everything — flights, hotels, VIP experiences. Link in bio! ✈️",
                  "🔥 Discovered Zeniva Travel — an AI travel agency that creates 100% personalized trips. Fill out the form and get your free proposal in 24h!",
                  "✈️ Dream vacation = Zeniva Travel. Lina AI analyzes your preferences and finds the best options. Check the link in my bio to get started!",
                  "🏝️ No more cookie-cutter vacations! Zeniva Travel creates unique experiences with Lina AI — Cancún, Maldives, Paris, anywhere. Your dream trip is waiting!",
                ].map((caption, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-sm text-slate-300">{caption}</p>
                    <button onClick={() => copy(caption, `caption-${i}`)} className="mt-2 text-xs font-bold text-blue-400 hover:text-blue-300">
                      {copied === `caption-${i}` ? "✅ Copied!" : "📋 Copy"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ HOW IT WORKS TAB ══ */}
        {activeTab === "howto" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white">📖 How It Works</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { step: "01", icon: "🎬", title: "Pick a video", desc: "Go to the 'Videos to Share' tab and choose an approved video to share." },
                { step: "02", icon: "📲", title: "Share your link", desc: "Copy your unique link and share it on Instagram, TikTok, Facebook, WhatsApp..." },
                { step: "03", icon: "✍️", title: "Client fills the form", desc: "Your followers fill out the form and automatically become YOUR leads." },
                { step: "04", icon: "💰", title: "Lina closes the sale", desc: "Lina AI contacts the lead, finalizes the trip. You get your commission automatically!" },
              ].map(s => (
                <div key={s.step} className="relative rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <div className="text-4xl font-black text-white/5 absolute top-3 right-4">{s.step}</div>
                  <div className="text-3xl mb-3">{s.icon}</div>
                  <div className="font-black text-white">{s.title}</div>
                  <div className="mt-2 text-sm text-slate-400">{s.desc}</div>
                </div>
              ))}
            </div>

            {/* Rules */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                <h3 className="font-black text-emerald-300 mb-3">✅ What you can do</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>✅ Share approved videos with your unique link</li>
                  <li>✅ Copy and adapt the approved captions</li>
                  <li>✅ Use the official logo and brand colors</li>
                  <li>✅ Talk about your experience with Zeniva Travel</li>
                  <li>✅ Post stories and reels with the link in bio</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
                <h3 className="font-black text-red-300 mb-3">🚫 What you must NOT do</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>🚫 Promise specific prices or availability</li>
                  <li>🚫 Use non-approved visuals or content</li>
                  <li>🚫 Share client information with anyone</li>
                  <li>🚫 Modify the logo or brand colors</li>
                  <li>🚫 Promise unapproved discounts or deals</li>
                </ul>
              </div>
            </div>

            {/* FAQ */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white mb-4">❓ FAQ</h3>
              <div className="space-y-3">
                {[
                  { q: "How much do I earn per sale?", a: "You earn 5% of Zeniva's net profit on the full trip — not the sale price. Example: a $5,000 trip where Zeniva makes $1,000 profit = $50 commission for you." },
                  { q: "When do I get paid?", a: "As soon as the trip is confirmed and payment received, your commission is recorded. Payouts are processed monthly." },
                  { q: "How do I know the lead is mine?", a: "Your referral code is encoded in every link you share. Every lead is automatically attributed to you." },
                  { q: "What if my lead books later?", a: "Your attribution is valid for 30 days after the first click. If the client comes back and books, the commission is still yours." },
                ].map((item, i) => (
                  <details key={i} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <summary className="cursor-pointer font-bold text-white">{item.q}</summary>
                    <p className="mt-2 text-sm text-slate-400">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
              <h3 className="text-xl font-black text-white">Prêt à commencer?</h3>
              <p className="mt-2 text-blue-200">Partage ta première vidéo maintenant et commence à générer des leads!</p>
              <button
                onClick={() => setActiveTab("videos")}
                className="mt-4 rounded-full bg-white px-8 py-3 font-black text-blue-700 transition-all hover:scale-105 hover:shadow-2xl"
              >
                🎬 Voir les vidéos →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
