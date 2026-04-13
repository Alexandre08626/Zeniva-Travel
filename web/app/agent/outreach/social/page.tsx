"use client";

import { useState, useEffect, useCallback } from "react";

interface Post {
  id: string;
  platform: string;
  content_text: string;
  hashtags: string[];
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
}

const PLATFORMS = [
  { value: "tiktok", label: "TikTok", icon: "\ud83c\udfb5", color: "bg-slate-900 text-white" },
  { value: "instagram", label: "Instagram", icon: "\ud83d\udcf7", color: "bg-gradient-to-r from-purple-500 to-pink-500 text-white" },
  { value: "facebook", label: "Facebook", icon: "\ud83d\udc4d", color: "bg-blue-600 text-white" },
  { value: "linkedin", label: "LinkedIn", icon: "\ud83d\udcbc", color: "bg-blue-700 text-white" },
];

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  scheduled: "bg-blue-100 text-blue-700",
  published: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

const CHAR_LIMITS: Record<string, number> = {
  tiktok: 2200,
  instagram: 2200,
  facebook: 5000,
  linkedin: 3000,
};

function getWeekDays() {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - start.getDay());
  const days = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

export default function SocialPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [platform, setPlatform] = useState("instagram");
  const [contentText, setContentText] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [postStatus, setPostStatus] = useState("draft");
  const [scheduledAt, setScheduledAt] = useState("");
  const [saving, setSaving] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/outreach/social");
      if (res.ok) setPosts((await res.json()).posts || []);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleCreate = async () => {
    if (!contentText.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/outreach/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          content_text: contentText,
          hashtags: hashtags.split(/[,\s]+/).filter(Boolean).map((h) => h.startsWith("#") ? h : "#" + h),
          status: postStatus,
          scheduled_at: postStatus === "scheduled" ? scheduledAt : null,
        }),
      });
      if (res.ok) {
        showToast("Post created");
        setShowCreate(false);
        setContentText("");
        setHashtags("");
        setScheduledAt("");
        fetchPosts();
      }
    } catch { showToast("Failed"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await fetch("/api/outreach/social/" + id, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const weekDays = getWeekDays();
  const charLimit = CHAR_LIMITS[platform] || 2200;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {toast && <div className="fixed top-4 right-4 z-50 bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg">{toast}</div>}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Social Media</h2>
          <p className="text-sm text-slate-500">Plan and schedule social content</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-white rounded-lg border border-slate-200 p-0.5">
            <button onClick={() => setView("calendar")} className={"px-3 py-1.5 rounded-md text-xs font-semibold " + (view === "calendar" ? "bg-violet-600 text-white" : "text-slate-600")}>Calendar</button>
            <button onClick={() => setView("list")} className={"px-3 py-1.5 rounded-md text-xs font-semibold " + (view === "list" ? "bg-violet-600 text-white" : "text-slate-600")}>List</button>
          </div>
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700">
            + New Post
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Posts", value: posts.length, icon: "\ud83d\udcdd" },
          { label: "Scheduled", value: posts.filter((p) => p.status === "scheduled").length, icon: "\ud83d\udcc5" },
          { label: "Published", value: posts.filter((p) => p.status === "published").length, icon: "\u2705" },
          { label: "Drafts", value: posts.filter((p) => p.status === "draft").length, icon: "\ud83d\udcdd" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">{s.label}</p>
              <span className="text-lg">{s.icon}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{loading ? "\u2014" : s.value}</p>
          </div>
        ))}
      </div>

      {/* Calendar View */}
      {view === "calendar" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-200">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="px-2 py-2 text-center text-xs font-semibold text-slate-500 bg-slate-50">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {weekDays.map((day) => {
              const dateStr = day.toISOString().split("T")[0];
              const isToday = new Date().toISOString().split("T")[0] === dateStr;
              const dayPosts = posts.filter((p) => {
                const d = p.scheduled_at || p.created_at;
                return d && d.startsWith(dateStr);
              });

              return (
                <div key={dateStr} className={"min-h-[100px] p-2 border-b border-r border-slate-100 " + (isToday ? "bg-violet-50" : "")}>
                  <p className={"text-xs font-semibold mb-1 " + (isToday ? "text-violet-600" : "text-slate-500")}>
                    {day.getDate()}
                    {isToday && <span className="ml-1 text-[10px]">today</span>}
                  </p>
                  <div className="space-y-1">
                    {dayPosts.map((p) => {
                      const plat = PLATFORMS.find((pl) => pl.value === p.platform);
                      return (
                        <div key={p.id} className={"px-1.5 py-1 rounded text-[10px] font-semibold truncate " + (statusColors[p.status] || "bg-slate-100 text-slate-600")} title={p.content_text}>
                          {plat?.icon} {p.content_text.slice(0, 25)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-100 rounded animate-pulse" />)}</div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3">{"\ud83d\udcf1"}</p>
              <p className="text-lg font-semibold text-slate-700">No posts yet</p>
              <p className="text-sm text-slate-500 mt-1">Create your first social media post</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {posts.map((p) => {
                const plat = PLATFORMS.find((pl) => pl.value === p.platform);
                return (
                  <div key={p.id} className="flex items-start gap-4 px-4 py-4 hover:bg-slate-50">
                    <div className={"w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 " + (plat?.color || "bg-slate-100")}>
                      {plat?.icon || "\ud83d\udcf1"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-700 capitalize">{p.platform}</span>
                        <span className={"px-2 py-0.5 rounded-full text-[10px] font-semibold " + (statusColors[p.status] || "bg-slate-100 text-slate-600")}>{p.status}</span>
                      </div>
                      <p className="text-sm text-slate-900 line-clamp-2">{p.content_text}</p>
                      {p.hashtags?.length > 0 && (
                        <p className="text-xs text-blue-500 mt-1 truncate">{p.hashtags.join(" ")}</p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1">
                        {p.scheduled_at ? "Scheduled: " + new Date(p.scheduled_at).toLocaleString("en-CA") : "Created: " + new Date(p.created_at).toLocaleDateString("en-CA")}
                      </p>
                    </div>
                    <button onClick={() => handleDelete(p.id)} className="text-xs text-red-400 hover:text-red-600 font-semibold flex-shrink-0">Delete</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">New Social Post</h3>

            {/* Platform selector */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-600 uppercase mb-2 block">Platform</label>
              <div className="grid grid-cols-4 gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPlatform(p.value)}
                    className={"flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-colors " + (platform === p.value ? "border-violet-500 bg-violet-50" : "border-slate-200 hover:border-slate-300")}
                  >
                    <span className="text-xl">{p.icon}</span>
                    <span className="text-[10px] font-semibold text-slate-700">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-600 uppercase">Content</label>
                <span className={"text-xs " + (contentText.length > charLimit ? "text-red-500 font-bold" : "text-slate-400")}>{contentText.length} / {charLimit}</span>
              </div>
              <textarea
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                placeholder={"Write your " + platform + " post..."}
              />
            </div>

            {/* Hashtags */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-600 uppercase">Hashtags</label>
              <input
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                placeholder="#travel #zeniva #luxury"
              />
            </div>

            {/* Status & Schedule */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Status</label>
                <select value={postStatus} onChange={(e) => setPostStatus(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none">
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              {postStatus === "scheduled" && (
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase">Schedule</label>
                  <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none" />
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !contentText.trim()} className="px-5 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg disabled:opacity-50">{saving ? "Creating..." : "Create Post"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
